package domain

import "time"

type Severity string

const (
	SevGood   Severity = "good"
	SevMod    Severity = "moderate"
	SevHigh   Severity = "high"
	SevDanger Severity = "danger"
)

type Point struct {
	At    time.Time `json:"at"`
	Value float64   `json:"value"`
}

// Sensor = one physical device registered upstream in api-data-services.
type Sensor struct {
	DeviceID   string    `json:"device_id"`
	Name       string    `json:"name"`
	Vendor     string    `json:"vendor"`
	Station    string    `json:"station"`
	Placement  string    `json:"placement"`
	Parameters []string  `json:"parameters"`
	Online     bool      `json:"online"`
	Uptime     float64   `json:"uptime"`
	LastSeen   time.Time `json:"last_seen"`
}

type ParameterCard struct {
	Parameter string   `json:"parameter"`
	Label     string   `json:"label"`
	Unit      string   `json:"unit"`
	Vendor    string   `json:"vendor"`
	Now       float64  `json:"now"`
	Forecast  float64  `json:"forecast"`
	PeakHour  int      `json:"peak_hour"`
	Delta     float64  `json:"delta"`
	Limit     float64  `json:"limit"`
	Severity  Severity `json:"severity"`
	AtRisk    bool     `json:"at_risk"`
	History   []Point  `json:"history"`
	Trend     []Point  `json:"trend"`
}

type Insight struct {
	Parameter string   `json:"parameter"`
	Label     string   `json:"label"`
	Text      string   `json:"text"`
	Hour      int      `json:"hour"`
	Severity  Severity `json:"severity"`
}

type Action struct {
	ID        string `json:"id"`
	Label     string `json:"label"`
	Detail    string `json:"detail"`
	Owner     string `json:"owner"`
	Window    string `json:"window"`
	Enabled   bool   `json:"enabled"`
	Driver    string `json:"driver"`
	Reference string `json:"reference"`
}

type Decision struct {
	Station     string          `json:"station"`
	GeneratedAt time.Time       `json:"generated_at"`
	Horizon     string          `json:"horizon"`
	Cards       []ParameterCard `json:"cards"`
	Insights    []Insight       `json:"insights"`
	Actions     []Action        `json:"actions"`
	RiskScore   int             `json:"risk_score"`
	RiskLabel   string          `json:"risk_label"`
	RiskLevel   Severity        `json:"risk_level"`
	AtRisk      int             `json:"at_risk_count"`
	Total       int             `json:"total_params"`
	Live        bool            `json:"live"`
}

// ESG reporting view derived from the same decision pipeline.
type ESGMetric struct {
	Parameter string   `json:"parameter"`
	Label     string   `json:"label"`
	Unit      string   `json:"unit"`
	Mean      float64  `json:"mean"`
	Peak      float64  `json:"peak"`
	Limit     float64  `json:"limit"`
	Exceeded  int      `json:"exceeded_hours"`
	Status    Severity `json:"status"`
}

type AuditEntry struct {
	Ref    string    `json:"ref"`
	At     time.Time `json:"at"`
	Action string    `json:"action"`
	Actor  string    `json:"actor"`
	Result string    `json:"result"`
}

type ESGReport struct {
	Station     string       `json:"station"`
	Period      string       `json:"period"`
	GeneratedAt time.Time    `json:"generated_at"`
	Compliance  int          `json:"compliance_rate"`
	Metrics     []ESGMetric  `json:"metrics"`
	Audit       []AuditEntry `json:"audit"`
	Frameworks  []string     `json:"frameworks"`
}

// SiteMarker is one site rendered on the national map, carrying just enough
// forecast context to colour and label it without a second request.
type SiteMarker struct {
	Name      string   `json:"name"`
	Region    string   `json:"region"`
	Category  string   `json:"category"`
	Lat       float64  `json:"lat"`
	Lon       float64  `json:"lon"`
	RiskScore int      `json:"risk_score"`
	RiskLevel Severity `json:"risk_level"`
	RiskLabel string   `json:"risk_label"`
	AtRisk    int      `json:"at_risk_count"`
	Total     int      `json:"total_params"`
	Headline  string   `json:"headline"`
	Driver    string   `json:"driver"`
	DriverVal float64  `json:"driver_value"`
	DriverUni string   `json:"driver_unit"`
	PeakHour  int      `json:"peak_hour"`
	Online    bool     `json:"online"`
}

// SiteMap is the national overview: every site plus the forecast horizon it was
// computed for.
type SiteMap struct {
	GeneratedAt time.Time    `json:"generated_at"`
	Horizon     string       `json:"horizon"`
	Country     string       `json:"country"`
	Sites       []SiteMarker `json:"sites"`
	Summary     MapSummary   `json:"summary"`
}

type MapSummary struct {
	Total    int `json:"total"`
	AtRisk   int `json:"at_risk"`
	Critical int `json:"critical"`
	MeanRisk int `json:"mean_risk"`
}

type Threshold struct {
	Label             string
	Unit              string
	Mod, High, Danger float64
	Weight            float64
	Indoor            bool
}

var Thresholds = map[string]Threshold{
	"pm25":       {"PM2.5", "µg/m³", 15, 35, 55, 1.0, false},
	"pm10":       {"PM10", "µg/m³", 45, 100, 150, 0.8, false},
	"no2":        {"NO₂", "ppb", 25, 50, 100, 0.6, false},
	"o3":         {"O₃", "ppb", 50, 70, 90, 0.7, false},
	"co2":        {"CO₂", "ppm", 800, 1200, 1800, 0.6, true},
	"heat_index": {"Heat index", "°C", 32, 39, 45, 0.9, false},
}

// Ceilings bound the projection to a physically plausible range so a steep
// short-term trend cannot extrapolate into a nonsensical value.
var Ceilings = map[string]float64{
	"pm25":       400,
	"pm10":       600,
	"no2":        300,
	"o3":         250,
	"co2":        5000,
	"heat_index": 48,
}

func Clamp(param string, v float64) float64 {
	if c, ok := Ceilings[param]; ok && v > c {
		return c
	}
	if v < 0 {
		return 0
	}
	return v
}

func Classify(param string, v float64) Severity {
	t, ok := Thresholds[param]
	if !ok {
		return SevGood
	}
	switch {
	case v >= t.Danger:
		return SevDanger
	case v >= t.High:
		return SevHigh
	case v >= t.Mod:
		return SevMod
	default:
		return SevGood
	}
}
