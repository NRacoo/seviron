# Perisai — Environmental Decision Platform (POC)

Multi-vendor air sensors are normalized into one schema, projected 24 hours
ahead, and converted into auditable operational decisions.

```
ingest  ->  normalize  ->  forecast  ->  decide  ->  act  ->  report
```

## Layout

```
perisai/
├── service/                   # Go decision service (standard library only)
│   ├── cmd/server
│   └── internal/
│       ├── config             # environment configuration
│       ├── upstream           # api-data-services client, vendor normalization, device inventory
│       ├── domain             # readings, thresholds, ceilings, ESG types
│       ├── forecast           # Holt trend + hour-of-day profile, damped
│       ├── decision           # risk index, insights, controls, ESG report
│       └── http               # REST handlers
└── web/                       # Next.js 15 App Router, atomic design
    └── src/
        ├── app/               # map · sensors · forecast · decisions · actions · esg
        ├── components/
        │   ├── atoms/         # Icon, Wordmark, Tag, StatusDot, Button, Panel, Chart
        │   ├── molecules/     # NavItem, SiteSwitcher, MetricTile, StatBlock, RiskBar, DataTable
        │   ├── organisms/     # AppRail, PageHeader, ForecastExplorer, ActionQueue, SiteMapView
        │   └── templates/     # AppShell, PageSection
        ├── lib/               # api client, formatters
        │   └── geo/           # pre-projected Indonesian province outlines
        ├── scripts/           # build-map.mjs regenerates lib/geo/indonesia.ts
        └── types/
```

## Pages

| Route | Purpose |
|---|---|
| `/map` | National forecast map of Indonesia; risk per site, ranked list, drill-down |
| `/sensors` | Device inventory across vendors, uptime, parameter coverage |
| `/forecast` | 24-hour projection per parameter, observed vs forecast vs limit |
| `/decisions` | Consolidated site judgement, risk index, reasoning |
| `/actions` | Control queue with owners, windows, standards, approval |
| `/esg` | Exposure performance, exceedance hours, approval audit trail |

## Run

```bash
# backend (mock data by default)
cd service && go run ./cmd/server          # :8088

# frontend
cd web && npm install && npm run dev       # :3000
```

Or `./dev.sh` to start both.

Point at the real upstream (`birulangit/app/api-data-services`):

```bash
PERISAI_MOCK=false \
PERISAI_UPSTREAM_BASE=http://localhost:8080/api/v1 \
PERISAI_UPSTREAM_KEY=<api-key> \
PERISAI_SITES="Industrial Estate A|Jawa Barat|-6.325|107.153|Manufacturing;Gresik Works|Jawa Timur|-7.156|112.653|Heavy industry" \
go run ./cmd/server
```

`PERISAI_SITES` is `Name|Region|lat|lon|Category`, semicolon separated. The
coordinates place each site on the national map; omit the variable to use the
eight default Indonesian industrial sites.

## Map asset

`web/src/lib/geo/indonesia.ts` holds 34 province outlines already projected
(equirectangular) into the SVG viewBox and simplified with Visvalingam-Whyatt,
so no GeoJSON or mapping library is shipped to the browser. Regenerate with
`node scripts/build-map.mjs` after editing `src/lib/geo/source.geojson`.

## API

| Method | Path | Returns |
|---|---|---|
| GET | `/healthz` | liveness and data-source mode |
| GET | `/api/v1/sites` | configured sites with region and coordinates |
| GET | `/api/v1/map` | every site scored for the map: risk, driver, peak hour |
| GET | `/api/v1/sensors?site=` | device inventory and reporting status |
| GET | `/api/v1/forecast?site=` | per-parameter history, projection, peak |
| GET | `/api/v1/decision?site=` | cards, insights, controls, risk index |
| GET | `/api/v1/actions?site=` | control queue and triggering conditions |
| GET | `/api/v1/esg?site=` | exposure metrics, compliance rate, audit trail |

## Upstream mapping

`internal/upstream` reads two existing endpoints from `api-data-services`:

- `GET /api/v1/devices/stasiun/:stasiun` for the device inventory
- `GET /api/v1/aqms/stasiun/:stasiun` for the measurement series

`models.AQMS` stores every value as a string, so each field is parsed to a
float; `temp` and `hum` are combined into a heat index using the Rothfusz
regression. Adding another vendor API only requires a new normalizer in that
package — everything downstream is vendor agnostic.

## Decision logic

1. Sort the 24-hour history per parameter.
2. Holt linear smoothing (level plus geometrically damped trend) multiplied by a
   learned hour-of-day profile, clamped to a physical ceiling.
3. Compare the forecast peak against moderate / high / danger thresholds.
4. Weighted exceedance ratio produces a 0–100 risk index and a verdict.
5. Each parameter above its limit maps to a control with an owner, an execution
   window, and the standard it satisfies.
6. Approved controls and observed exceedances form the ESG report.

Thresholds and ceilings live in `service/internal/domain/domain.go`.

## Design

| Token | Value |
|---|---|
| Royal Blue | `#0056FF` — primary actions, active navigation |
| Azure Blue | `#2277FF` — focus and accents |
| Midnight | `#0A1733` — navigation rail |
| Soft Lavender | `#E3E7FC` — borders and sunken surfaces |
| White | `#FFFFFF` — surfaces |

Status colours are deliberately desaturated so the brand blue stays dominant.
All iconography is a hand-built SVG set in `atoms/Icon`; no emoji and no icon
dependency. Numerals use a tabular monospace face so columns align.
