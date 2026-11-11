package upstream

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"sync"
	"time"

	"perisai/service/internal/config"
	"perisai/service/internal/domain"
)

// Client pulls raw samples from the existing api-data-services service
// (birulangit/app/api-data-services) and normalizes vendor payloads into
// domain.Reading series. Any number of upstream APIs can be plugged in by
// adding a Source.
type Client struct {
	cfg  config.Config
	http *http.Client

	mu    sync.Mutex
	cache map[string]cacheEntry
}

type cacheEntry struct {
	at   time.Time
	data map[string][]domain.Point
}

func New(cfg config.Config) *Client {
	return &Client{
		cfg:   cfg,
		http:  &http.Client{Timeout: 8 * time.Second},
		cache: map[string]cacheEntry{},
	}
}

// aqmsRow mirrors models.AQMS in api-data-services (all values are strings).
type aqmsRow struct {
	DeviceID   string `json:"device_id"`
	Co2        string `json:"co2"`
	Pm25       string `json:"pm2_5"`
	Pm10       string `json:"pm10"`
	No2        string `json:"no2"`
	O3         string `json:"o3"`
	Temp       string `json:"temp"`
	Hum        string `json:"hum"`
	WaktuMasuk string `json:"waktu_masuk"`
}

type aqmsEnvelope struct {
	Data []aqmsRow `json:"data"`
}

// History returns 24h of hourly series per parameter for a station.
func (c *Client) History(ctx context.Context, station string) (map[string][]domain.Point, error) {
	c.mu.Lock()
	if e, ok := c.cache[station]; ok && time.Since(e.at) < c.cfg.CacheTTL {
		c.mu.Unlock()
		return e.data, nil
	}
	c.mu.Unlock()

	var (
		data map[string][]domain.Point
		err  error
	)
	if c.cfg.UseMock {
		data = mockSeries(station)
	} else {
		data, err = c.fetchAQMS(ctx, station)
		if err != nil {
			return nil, err
		}
	}

	c.mu.Lock()
	c.cache[station] = cacheEntry{at: time.Now(), data: data}
	c.mu.Unlock()
	return data, nil
}

func (c *Client) fetchAQMS(ctx context.Context, station string) (map[string][]domain.Point, error) {
	url := fmt.Sprintf("%s/aqms/stasiun/%s", c.cfg.UpstreamBase, station)
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if c.cfg.UpstreamKey != "" {
		req.Header.Set("x-api-key", c.cfg.UpstreamKey)
	}
	res, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		return nil, fmt.Errorf("upstream %s: status %d", url, res.StatusCode)
	}
	var env aqmsEnvelope
	if err := json.NewDecoder(res.Body).Decode(&env); err != nil {
		return nil, err
	}
	return normalize(env.Data), nil
}

func normalize(rows []aqmsRow) map[string][]domain.Point {
	out := map[string][]domain.Point{}
	for _, r := range rows {
		at := parseTime(r.WaktuMasuk)
		push := func(p, raw string) {
			if v, ok := parseFloat(raw); ok {
				out[p] = append(out[p], domain.Point{At: at, Value: v})
			}
		}
		push("pm25", r.Pm25)
		push("pm10", r.Pm10)
		push("no2", r.No2)
		push("o3", r.O3)
		push("co2", r.Co2)
		if t, ok := parseFloat(r.Temp); ok {
			if h, ok2 := parseFloat(r.Hum); ok2 {
				out["heat_index"] = append(out["heat_index"], domain.Point{At: at, Value: heatIndex(t, h)})
			}
		}
	}
	return out
}

// heatIndex: Rothfusz regression, °C in / °C out.
func heatIndex(tc, rh float64) float64 {
	tf := tc*9/5 + 32
	hi := -42.379 + 2.04901523*tf + 10.14333127*rh -
		0.22475541*tf*rh - 0.00683783*tf*tf - 0.05481717*rh*rh +
		0.00122874*tf*tf*rh + 0.00085282*tf*rh*rh - 0.00000199*tf*tf*rh*rh
	if tf < 80 {
		hi = tf
	}
	return math.Round((hi-32)*5/9*10) / 10
}

func parseFloat(s string) (float64, bool) {
	v, err := strconv.ParseFloat(s, 64)
	return v, err == nil
}

func parseTime(s string) time.Time {
	for _, l := range []string{time.RFC3339, "2006-01-02 15:04:05", "2006-01-02T15:04:05"} {
		if t, err := time.Parse(l, s); err == nil {
			return t
		}
	}
	return time.Now()
}

// mockSeries generates deterministic-ish demo data so the POC runs with no
// upstream database available.
func mockSeries(station string) map[string][]domain.Point {
	seed := int64(0)
	for _, ch := range station {
		seed += int64(ch)
	}
	rnd := rand.New(rand.NewSource(seed))

	// Each site gets its own baseline so the national map shows a real spread
	// rather than one profile repeated. Derived deterministically from the name.
	load := 0.5 + float64(seed%37)/37*1.6 // industrial load factor
	coastal := float64(seed%11) / 11      // coastal sites disperse better
	base := map[string]float64{
		"pm25":       26 * load * (1 - 0.3*coastal),
		"pm10":       48 * load * (1 - 0.3*coastal),
		"no2":        20 * load,
		"o3":         36 + 28*coastal,
		"co2":        520 * (0.78 + 0.6*load),
		"heat_index": 29 + 5*coastal + 3.5*load,
	}
	now := time.Now().Truncate(time.Hour)
	out := map[string][]domain.Point{}
	for p, b := range base {
		for i := 23; i >= 0; i-- {
			at := now.Add(-time.Duration(i) * time.Hour)
			// diurnal wave + noise; o3 peaks midday, pm peaks at shift change.
			phase := float64(at.Hour())
			wave := math.Sin((phase-6)/24*2*math.Pi) * 0.22
			switch p {
			case "o3":
				wave = math.Sin((phase-13)/24*2*math.Pi) * 0.38
			case "heat_index":
				// temperature swings far less in relative terms than concentrations
				wave = math.Sin((phase-14)/24*2*math.Pi) * 0.12
			}
			v := b * (1 + wave + (rnd.Float64()-0.5)*0.06)
			out[p] = append(out[p], domain.Point{At: at, Value: math.Round(v*10) / 10})
		}
	}
	return out
}
