package forecast

import (
	"math"
	"time"

	"perisai/service/internal/domain"
)

// Forecast = 24h-ahead hourly projection built from:
//  1. Holt linear trend on the recent series (level + slope)
//  2. an hour-of-day profile learned from history (diurnal cycle)
//
// Light enough to run per request, good enough for a POC decision engine.
type Result struct {
	Hourly []domain.Point
	Peak   domain.Point
}

const (
	alpha = 0.4 // level smoothing
	beta  = 0.2 // trend smoothing
)

func Project(param string, series []domain.Point, horizon int) Result {
	if len(series) == 0 {
		return Result{}
	}
	level := series[0].Value
	trend := 0.0
	for _, p := range series[1:] {
		prev := level
		level = alpha*p.Value + (1-alpha)*(level+trend)
		trend = beta*(level-prev) + (1-beta)*trend
	}

	profile := hourProfile(series)
	last := series[len(series)-1].At
	res := Result{}
	for h := 1; h <= horizon; h++ {
		at := last.Add(time.Duration(h) * time.Hour)
		// Geometrically damped trend: the slope contribution converges instead of
		// growing linearly, so a steep recent move cannot dominate hour 24.
		const phi = 0.7
		damp := (1 - math.Pow(phi, float64(h))) * phi / (1 - phi)
		v := domain.Clamp(param, (level+trend*damp)*profile[at.Hour()])
		p := domain.Point{At: at, Value: math.Round(v*10) / 10}
		res.Hourly = append(res.Hourly, p)
		if p.Value > res.Peak.Value {
			res.Peak = p
		}
	}
	return res
}

// hourProfile returns a multiplier per hour-of-day, mean-normalized.
func hourProfile(series []domain.Point) [24]float64 {
	var sum [24]float64
	var n [24]int
	total, count := 0.0, 0
	for _, p := range series {
		sum[p.At.Hour()] += p.Value
		n[p.At.Hour()]++
		total += p.Value
		count++
	}
	var out [24]float64
	mean := 1.0
	if count > 0 {
		mean = total / float64(count)
	}
	for h := 0; h < 24; h++ {
		if n[h] == 0 || mean == 0 {
			out[h] = 1
			continue
		}
		m := (sum[h] / float64(n[h])) / mean
		// shrink toward 1 to avoid overfitting a single day of data
		out[h] = 1 + (m-1)*0.6
	}
	return out
}
