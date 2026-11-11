package upstream

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"perisai/service/internal/domain"
)

// deviceRow mirrors models.Device in api-data-services.
type deviceRow struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Project string `json:"project"`
	Stasiun string `json:"stasiun"`
	Lantai  string `json:"lantai"`
	Lokasi  string `json:"location"`
}

type deviceEnvelope struct {
	Data []deviceRow `json:"data"`
}

// Sensors lists the devices feeding a station. Falls back to a representative
// fleet when running in mock mode.
func (c *Client) Sensors(ctx context.Context, station string) ([]domain.Sensor, error) {
	if c.cfg.UseMock {
		return mockFleet(station), nil
	}

	url := fmt.Sprintf("%s/devices/stasiun/%s", c.cfg.UpstreamBase, station)
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
	var env deviceEnvelope
	if err := json.NewDecoder(res.Body).Decode(&env); err != nil {
		return nil, err
	}

	out := make([]domain.Sensor, 0, len(env.Data))
	for _, d := range env.Data {
		out = append(out, domain.Sensor{
			DeviceID:   d.ID,
			Name:       d.Name,
			Vendor:     d.Project,
			Station:    d.Stasiun,
			Placement:  placement(d.Lokasi, d.Lantai),
			Parameters: []string{"pm25", "pm10", "co2", "heat_index"},
			Online:     true,
			Uptime:     99.0,
			LastSeen:   time.Now(),
		})
	}
	return out, nil
}

func placement(loc, floor string) string {
	if floor == "" {
		return loc
	}
	if loc == "" {
		return "Floor " + floor
	}
	return loc + " - floor " + floor
}

func mockFleet(station string) []domain.Sensor {
	seed := int64(len(station))
	for _, ch := range station {
		seed += int64(ch)
	}
	rnd := rand.New(rand.NewSource(seed))

	defs := []struct {
		name, vendor, place string
		params              []string
	}{
		{"AQ-NORTH-01", "Aeroqual S500", "North gate, outdoor", []string{"pm25", "pm10"}},
		{"AQ-YARD-02", "Vaisala AQT530", "Loading yard, outdoor", []string{"no2", "o3"}},
		{"AQ-LINE2-03", "Senseair K96", "Production line 2, indoor", []string{"co2", "heat_index"}},
		{"AQ-LINE3-04", "Senseair K96", "Production line 3, indoor", []string{"co2", "heat_index"}},
		{"AQ-STACK-05", "Aeroqual S500", "Stack perimeter, outdoor", []string{"pm25", "pm10"}},
		{"AQ-WARE-06", "Vaisala AQT530", "Warehouse apron, outdoor", []string{"no2", "o3"}},
	}

	out := make([]domain.Sensor, 0, len(defs))
	for i, d := range defs {
		online := !(i == 4 && rnd.Intn(3) == 0)
		last := time.Now().Add(-time.Duration(rnd.Intn(240)) * time.Second)
		if !online {
			last = time.Now().Add(-47 * time.Minute)
		}
		out = append(out, domain.Sensor{
			DeviceID:   fmt.Sprintf("dev-%04d", 1000+i),
			Name:       d.name,
			Vendor:     d.vendor,
			Station:    station,
			Placement:  d.place,
			Parameters: d.params,
			Online:     online,
			Uptime:     round1(97 + rnd.Float64()*2.9),
			LastSeen:   last,
		})
	}
	return out
}

func round1(v float64) float64 {
	return float64(int(v*10+0.5)) / 10
}
