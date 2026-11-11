package decision

import (
	"fmt"
	"math"
	"time"

	"perisai/service/internal/domain"
)

// BuildESG turns the observed history plus approved actions into a compliance
// view: mean/peak per parameter, exceedance hours, and an audit trail.
func BuildESG(station string, history map[string][]domain.Point, d domain.Decision) domain.ESGReport {
	rep := domain.ESGReport{
		Station:     station,
		Period:      "Last 24 hours",
		GeneratedAt: time.Now(),
		Frameworks:  []string{"GRI 305", "ISO 14001", "ISO 45001", "SASB RT-IG"},
	}

	compliantHours, totalHours := 0, 0
	for _, p := range Order {
		series := history[p]
		if len(series) == 0 {
			continue
		}
		th := domain.Thresholds[p]
		sum, peak, exceeded := 0.0, 0.0, 0
		for _, pt := range series {
			sum += pt.Value
			if pt.Value > peak {
				peak = pt.Value
			}
			if pt.Value >= th.High {
				exceeded++
			} else {
				compliantHours++
			}
			totalHours++
		}
		mean := sum / float64(len(series))
		rep.Metrics = append(rep.Metrics, domain.ESGMetric{
			Parameter: p,
			Label:     th.Label,
			Unit:      th.Unit,
			Mean:      math.Round(mean*10) / 10,
			Peak:      math.Round(peak*10) / 10,
			Limit:     th.High,
			Exceeded:  exceeded,
			Status:    domain.Classify(p, peak),
		})
	}

	if totalHours > 0 {
		rep.Compliance = int(math.Round(float64(compliantHours) / float64(totalHours) * 100))
	}

	now := time.Now()
	for i, a := range d.Actions {
		if !a.Enabled {
			continue
		}
		rep.Audit = append(rep.Audit, domain.AuditEntry{
			Ref:    fmt.Sprintf("AUD-%s-%03d", now.Format("20060102"), i+1),
			At:     now.Add(-time.Duration(i*17) * time.Minute),
			Action: a.Label,
			Actor:  a.Owner,
			Result: "Approved",
		})
	}
	return rep
}
