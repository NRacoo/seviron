package http

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"sync"
	"time"

	"perisai/service/internal/config"
	"perisai/service/internal/decision"
	"perisai/service/internal/domain"
	"perisai/service/internal/upstream"
)

type Server struct {
	cfg config.Config
	up  *upstream.Client
}

func New(cfg config.Config, up *upstream.Client) *Server {
	return &Server{cfg: cfg, up: up}
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.health)
	mux.HandleFunc("/api/v1/sites", s.sites)
	mux.HandleFunc("/api/v1/map", s.siteMap)
	mux.HandleFunc("/api/v1/sensors", s.sensors)
	mux.HandleFunc("/api/v1/forecast", s.forecast)
	mux.HandleFunc("/api/v1/decision", s.decision)
	mux.HandleFunc("/api/v1/actions", s.actions)
	mux.HandleFunc("/api/v1/esg", s.esg)
	return cors(logger(mux))
}

func (s *Server) station(r *http.Request) string {
	site, _ := s.cfg.Lookup(r.URL.Query().Get("site"))
	return site.Name
}

func (s *Server) buildDecision(ctx context.Context, station string) (domain.Decision, map[string][]domain.Point, error) {
	hist, err := s.up.History(ctx, station)
	if err != nil {
		return domain.Decision{}, nil, err
	}
	d := decision.Build(station, hist)
	d.GeneratedAt = time.Now()
	return d, hist, nil
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, map[string]any{"status": "ok", "mock": s.cfg.UseMock, "time": time.Now()})
}

func (s *Server) sites(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, map[string]any{"sites": s.cfg.Sites})
}

// siteMap fans out across every configured site so the national view renders in
// a single request.
func (s *Server) siteMap(w http.ResponseWriter, r *http.Request) {
	markers := make([]domain.SiteMarker, len(s.cfg.Sites))

	var wg sync.WaitGroup
	for i, site := range s.cfg.Sites {
		wg.Add(1)
		go func(i int, site config.Site) {
			defer wg.Done()
			m := domain.SiteMarker{
				Name:     site.Name,
				Region:   site.Region,
				Category: site.Category,
				Lat:      site.Lat,
				Lon:      site.Lon,
			}

			d, _, err := s.buildDecision(r.Context(), site.Name)
			if err != nil {
				m.RiskLabel = "No data"
				m.RiskLevel = domain.SevGood
				markers[i] = m
				return
			}

			m.Online = true
			m.RiskScore = d.RiskScore
			m.RiskLevel = d.RiskLevel
			m.RiskLabel = d.RiskLabel
			m.AtRisk = d.AtRisk
			m.Total = d.Total

			if len(d.Insights) > 0 {
				m.Headline = d.Insights[0].Text
			} else {
				m.Headline = "All parameters forecast within their shift limit."
			}

			// Driver = the card furthest past its limit.
			var worst domain.ParameterCard
			ratio := -1.0
			for _, c := range d.Cards {
				if c.Limit > 0 && c.Forecast/c.Limit > ratio {
					ratio = c.Forecast / c.Limit
					worst = c
				}
			}
			m.Driver = worst.Label
			m.DriverVal = worst.Forecast
			m.DriverUni = worst.Unit
			m.PeakHour = worst.PeakHour

			markers[i] = m
		}(i, site)
	}
	wg.Wait()

	sum := domain.MapSummary{Total: len(markers)}
	total := 0
	for _, m := range markers {
		total += m.RiskScore
		if m.AtRisk > 0 {
			sum.AtRisk++
		}
		if m.RiskLevel == domain.SevDanger {
			sum.Critical++
		}
	}
	if len(markers) > 0 {
		sum.MeanRisk = total / len(markers)
	}

	sort.SliceStable(markers, func(i, j int) bool {
		return markers[i].RiskScore > markers[j].RiskScore
	})

	writeJSON(w, 200, domain.SiteMap{
		GeneratedAt: time.Now(),
		Horizon:     "24h",
		Country:     "Indonesia",
		Sites:       markers,
		Summary:     sum,
	})
}

func (s *Server) sensors(w http.ResponseWriter, r *http.Request) {
	station := s.station(r)
	list, err := s.up.Sensors(r.Context(), station)
	if err != nil {
		fail(w, err)
		return
	}
	online := 0
	for _, x := range list {
		if x.Online {
			online++
		}
	}
	writeJSON(w, 200, map[string]any{
		"station": station,
		"total":   len(list),
		"online":  online,
		"sensors": list,
	})
}

func (s *Server) forecast(w http.ResponseWriter, r *http.Request) {
	station := s.station(r)
	d, _, err := s.buildDecision(r.Context(), station)
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{
		"station":      station,
		"horizon":      d.Horizon,
		"generated_at": d.GeneratedAt,
		"cards":        d.Cards,
	})
}

func (s *Server) decision(w http.ResponseWriter, r *http.Request) {
	d, _, err := s.buildDecision(r.Context(), s.station(r))
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, 200, d)
}

func (s *Server) actions(w http.ResponseWriter, r *http.Request) {
	station := s.station(r)
	d, _, err := s.buildDecision(r.Context(), station)
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, 200, map[string]any{
		"station":    station,
		"risk_score": d.RiskScore,
		"risk_label": d.RiskLabel,
		"actions":    d.Actions,
		"insights":   d.Insights,
	})
}

func (s *Server) esg(w http.ResponseWriter, r *http.Request) {
	station := s.station(r)
	d, hist, err := s.buildDecision(r.Context(), station)
	if err != nil {
		fail(w, err)
		return
	}
	writeJSON(w, 200, decision.BuildESG(station, hist, d))
}

func fail(w http.ResponseWriter, err error) {
	writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		if r.Method == http.MethodOptions {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
	})
}
