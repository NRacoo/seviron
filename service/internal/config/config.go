package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Site is a monitored location with the geographic position used to place it on
// the national map.
type Site struct {
	Name     string  `json:"name"`
	Region   string  `json:"region"`
	Lat      float64 `json:"lat"`
	Lon      float64 `json:"lon"`
	Category string  `json:"category"`
}

type Config struct {
	Port         string
	UpstreamBase string
	UpstreamKey  string
	Sites        []Site
	CacheTTL     time.Duration
	UseMock      bool
}

// defaultSites covers the Indonesian industrial corridors the POC demonstrates.
var defaultSites = []Site{
	{"Industrial Estate A", "Jawa Barat", -6.3250, 107.1530, "Manufacturing"},
	{"Cilegon Petrochemical", "Banten", -6.0174, 106.0541, "Petrochemical"},
	{"Gresik Works", "Jawa Timur", -7.1560, 112.6530, "Heavy industry"},
	{"Batam Logistics Park", "Kepulauan Riau", 1.0456, 104.0305, "Logistics"},
	{"Balikpapan Refinery", "Kalimantan Timur", -1.2650, 116.8290, "Refinery"},
	{"Makassar Port Zone", "Sulawesi Selatan", -5.1180, 119.4040, "Port"},
	{"Medan Belawan", "Sumatera Utara", 3.7780, 98.6870, "Port"},
	{"Semarang Kendal Estate", "Jawa Tengah", -6.9220, 110.2060, "Manufacturing"},
}

func Load() Config {
	c := Config{
		Port:         env("PERISAI_PORT", "8088"),
		UpstreamBase: env("PERISAI_UPSTREAM_BASE", "http://localhost:8080/api/v1"),
		UpstreamKey:  env("PERISAI_UPSTREAM_KEY", ""),
		CacheTTL:     30 * time.Second,
		UseMock:      env("PERISAI_MOCK", "true") == "true",
		Sites:        defaultSites,
	}

	// PERISAI_SITES overrides the default fleet:
	//   "Name|Region|lat|lon|Category;Name|Region|lat|lon|Category"
	if raw := os.Getenv("PERISAI_SITES"); raw != "" {
		if parsed := parseSites(raw); len(parsed) > 0 {
			c.Sites = parsed
		}
	}
	return c
}

func parseSites(raw string) []Site {
	var out []Site
	for _, entry := range strings.Split(raw, ";") {
		parts := strings.Split(strings.TrimSpace(entry), "|")
		if len(parts) < 4 {
			continue
		}
		lat, err1 := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64)
		lon, err2 := strconv.ParseFloat(strings.TrimSpace(parts[3]), 64)
		if err1 != nil || err2 != nil {
			continue
		}
		s := Site{
			Name:   strings.TrimSpace(parts[0]),
			Region: strings.TrimSpace(parts[1]),
			Lat:    lat,
			Lon:    lon,
		}
		if len(parts) > 4 {
			s.Category = strings.TrimSpace(parts[4])
		}
		out = append(out, s)
	}
	return out
}

// Names returns just the site names, in configured order.
func (c Config) Names() []string {
	out := make([]string, 0, len(c.Sites))
	for _, s := range c.Sites {
		out = append(out, s.Name)
	}
	return out
}

// Lookup finds a site by name, falling back to the first configured site.
func (c Config) Lookup(name string) (Site, bool) {
	for _, s := range c.Sites {
		if strings.EqualFold(s.Name, name) {
			return s, true
		}
	}
	if len(c.Sites) > 0 {
		return c.Sites[0], false
	}
	return Site{}, false
}

func env(k, d string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return d
}
