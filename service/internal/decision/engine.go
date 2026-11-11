package decision

import (
	"fmt"
	"math"
	"sort"

	"perisai/service/internal/domain"
	"perisai/service/internal/forecast"
)

var Order = []string{"pm25", "pm10", "no2", "o3", "co2", "heat_index"}

var vendorOf = map[string]string{
	"pm25": "Aeroqual S500", "pm10": "Aeroqual S500",
	"no2": "Vaisala AQT530", "o3": "Vaisala AQT530",
	"co2": "Senseair K96", "heat_index": "Senseair K96",
}

func Build(station string, history map[string][]domain.Point) domain.Decision {
	d := domain.Decision{Station: station, Horizon: "24h", Live: true}

	type peak struct {
		param string
		hour  int
		value float64
		sev   domain.Severity
	}
	var peaks []peak

	for _, p := range Order {
		series := history[p]
		if len(series) == 0 {
			continue
		}
		sort.Slice(series, func(i, j int) bool { return series[i].At.Before(series[j].At) })
		fc := forecast.Project(p, series, 24)
		now := series[len(series)-1].Value
		th := domain.Thresholds[p]
		sev := domain.Classify(p, fc.Peak.Value)

		d.Cards = append(d.Cards, domain.ParameterCard{
			Parameter: p,
			Label:     th.Label,
			Unit:      th.Unit,
			Vendor:    vendorOf[p],
			Now:       now,
			Forecast:  fc.Peak.Value,
			PeakHour:  fc.Peak.At.Hour(),
			Delta:     round(fc.Peak.Value - now),
			Limit:     th.High,
			Severity:  sev,
			AtRisk:    sev == domain.SevHigh || sev == domain.SevDanger,
			History:   series,
			Trend:     fc.Hourly,
		})
		if sev == domain.SevHigh || sev == domain.SevDanger {
			peaks = append(peaks, peak{p, fc.Peak.At.Hour(), fc.Peak.Value, sev})
		}
	}

	d.Total = len(d.Cards)
	for _, c := range d.Cards {
		if c.AtRisk {
			d.AtRisk++
		}
	}

	sort.Slice(peaks, func(i, j int) bool { return peaks[i].value > peaks[j].value })
	var risky []string
	for _, pk := range peaks {
		th := domain.Thresholds[pk.param]
		d.Insights = append(d.Insights, domain.Insight{
			Parameter: pk.param,
			Label:     th.Label,
			Hour:      pk.hour,
			Severity:  pk.sev,
			Text:      phrase(pk.param, pk.hour, pk.value),
		})
		risky = append(risky, pk.param)
	}

	d.RiskScore = score(d.Cards)
	d.RiskLabel, d.RiskLevel = label(d.RiskScore)
	d.Actions = actions(risky)
	return d
}

func phrase(param string, hour int, v float64) string {
	th := domain.Thresholds[param]
	switch param {
	case "pm25", "pm10":
		return fmt.Sprintf("%s reaches %.0f %s around %02d:00, above the %.0f %s shift limit.",
			th.Label, v, th.Unit, hour, th.High, th.Unit)
	case "o3":
		return fmt.Sprintf("Ozone peaks at %.0f %s around %02d:00 across outdoor yards.", v, th.Unit, hour)
	case "heat_index":
		return fmt.Sprintf("Heat index reaches %.0f °C at %02d:00; outdoor exposure should be capped.", v, hour)
	case "co2":
		return fmt.Sprintf("Indoor CO2 holds above %.0f ppm through the %02d:00 shift.", v, hour)
	default:
		return fmt.Sprintf("%s reaches %.0f %s at %02d:00.", th.Label, v, th.Unit, hour)
	}
}

func score(cards []domain.ParameterCard) int {
	num, den := 0.0, 0.0
	for _, c := range cards {
		th := domain.Thresholds[c.Parameter]
		ratio := math.Min(c.Forecast/th.High, 2)
		num += th.Weight * ratio
		den += th.Weight * 2
	}
	if den == 0 {
		return 0
	}
	return int(math.Round(num / den * 100))
}

func label(s int) (string, domain.Severity) {
	switch {
	case s >= 75:
		return "High risk. Controls required before the next shift.", domain.SevDanger
	case s >= 50:
		return "Elevated risk. Prepare mitigation controls.", domain.SevHigh
	case s >= 25:
		return "Moderate risk. Continue monitoring.", domain.SevMod
	default:
		return "Low risk. Normal operations.", domain.SevGood
	}
}

func actions(risky []string) []domain.Action {
	seen := map[string]bool{}
	var out []domain.Action
	add := func(a domain.Action) {
		if !seen[a.ID] {
			seen[a.ID] = true
			out = append(out, a)
		}
	}
	for _, p := range risky {
		switch p {
		case "pm25", "pm10":
			add(domain.Action{ID: "notify", Label: "Notify shift workforce",
				Detail: "Push advisory to 1,200 staff before the 07:00 handover",
				Owner:  "HSE Duty Officer", Window: "Tonight 20:00", Enabled: true, Driver: p,
				Reference: "OSHA 1910.134"})
			add(domain.Action{ID: "ppe", Label: "Issue N95 and hydration",
				Detail: "Stage respirators and water at field crew muster points",
				Owner:  "Site Logistics", Window: "05:00 - 06:30", Enabled: true, Driver: p,
				Reference: "ISO 45001 8.1"})
		case "o3", "heat_index":
			add(domain.Action{ID: "shift", Label: "Reschedule outdoor work",
				Detail: "Move outdoor tasks into the 05:00 - 10:00 window",
				Owner:  "Operations Planner", Window: "Next shift", Enabled: true, Driver: p,
				Reference: "NIOSH heat criteria"})
		case "co2", "no2":
			add(domain.Action{ID: "vent", Label: "Raise production ventilation",
				Detail: "Increase AHU fresh-air rate by 40 percent on lines 2 and 3",
				Owner:  "Facilities Engineering", Window: "From 06:00", Enabled: true, Driver: p,
				Reference: "ASHRAE 62.1"})
		}
	}
	if len(out) == 0 {
		add(domain.Action{ID: "monitor", Label: "Maintain monitoring cadence",
			Detail: "No forecast exceedance. Keep standard 15-minute polling",
			Owner:  "Control Room", Window: "Continuous", Enabled: false, Driver: "none",
			Reference: "Internal SOP-04"})
	}
	return out
}

func round(v float64) float64 { return math.Round(v*10) / 10 }
