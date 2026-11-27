# KAWASAN frontend

The React dashboard uses the FastAPI district data and 2024 KRDI v0.1 results. The four workspaces share the same district identifiers and analytical conventions.

| Workspace | What it shows |
| --- | --- |
| National Overview | Four national KPIs, the national district choropleth, top and bottom rank charts, a KRDI histogram, a state and territory mean chart, and a filterable, paginated ranking table |
| District Intelligence | District selection, eight headline metrics, a dimension radar, a boundary map, five socioeconomic indicator groups, national benchmarks, and ranking sensitivity |
| Compare Districts | Two independent selectors, swap, side-by-side KRDI metrics, grouped dimension bars and radar, nine socioeconomic comparisons, and calculated observations |
| Development Gaps | Four summaries, national benchmark position bars and thresholds, stacked infrastructure access/shortfall bars, and a prioritized investigation table |

District profile and gap URLs accept `?district=1_2` and comparison URLs accept `?a=1_2&b=13_37`.

## Run locally

Use Node.js 24 and install Python dependencies from the repository root.

```powershell
python -m pip install -r requirements.txt
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

In a second terminal, run:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`. The Vite dev server forwards relative API requests to the configured backend, so development works on other local ports as well. The production preview makes direct API calls and needs an origin allowed by the backend. `.env.local` overrides the developer's existing `.env`. To use the hosted API instead, set `VITE_API_BASE_URL=https://kawasan-api.onrender.com` and restart Vite.

Run `npm run lint` and `npm run build` inside `frontend`. Run `python -m unittest discover -s tests -v` from the repository root with the local API running. To check the production bundle locally, use `npm run preview -- --host localhost --port 5173 --strictPort` after stopping the development server.

## API integration

| Calls | Use |
| --- | --- |
| `/api/districts` | Normalize flat list records for national statistics, filters and validated selector codes |
| `/api/map/districts`, `/api/map/geojson` | Join national map attributes to geometry by district code. Geometry carries score attributes that can also render the choropleth while the map-attributes request is pending |
| `/api/map/geojson/{code}` | Fetch the selected district boundary independently of its profile |
| `/api/districts/{code}/full-intelligence` | Use the nested score, indicators, benchmarks, gap classifications and infrastructure shortfalls directly |
| `/api/compare?district_a={code}&district_b={code}`, `/api/districts/{code}` | Retrieve the comparison and fetch each district's dimension scores in parallel |

The list and national map resources are cached for the browser session and concurrent identical requests share a promise. Failed shared requests can be retried. District-specific requests support cancellation. Routes and Leaflet code are loaded on demand. The national GeoJSON is about 0.79 MB from Render and contains 155 features. It uses the checked-in geographic boundaries and renders without a third-party basemap.

## Methodology and sources

Use the header help button to view definitions and interpretation limits. KRDI uses exploratory score bands and national district benchmarks, with tied rankings retained. National medians and the mean of district KRDI scores weight each valid district equally. Missing observations appear as N/A. The dashboard preserves the source completion rates, which may exceed 100%.

See the [KAWASAN API and methodology documentation](../documentation/KAWASAN_Backend_API_Documentation.md). Source definitions and attribution include the Department of Statistics Malaysia's [population](https://open.dosm.gov.my/data-catalogue/population_district), [labour force](https://open.dosm.gov.my/data-catalogue/lfs_district), [household income and expenditure](https://open.dosm.gov.my/data-catalogue/hies_district), and [household amenities](https://open.dosm.gov.my/data-catalogue/hh_access_amenities) datasets, and the Ministry of Education's [enrolment](https://open.dosm.gov.my/data-catalogue/enrolment_school_district) and [completion](https://open.dosm.gov.my/data-catalogue/completion_school_district) datasets.

## Deploy to Vercel

1. Import the team repository or select its existing Vercel project. Set **Root Directory** to `frontend`, **Framework Preset** to Vite, **Node.js Version** to 24.x, **Install Command** to `npm ci`, **Build Command** to `npm run build`, and **Output Directory** to `dist`.
2. Set `VITE_API_BASE_URL=https://kawasan-api.onrender.com` in each Vercel environment being deployed. Vite embeds this public API URL at build time. Trigger a fresh build after changing it.
3. In Render, add the exact Vercel production origin to `FRONTEND_ORIGINS`. Add any known preview or local origins that still need access, comma-separated, without paths or trailing slashes. Save and redeploy the API. For example, `FRONTEND_ORIGINS=https://kawasan.example.com,http://localhost:5173`.
4. After Vercel reports the deployment ready, visit `/`, `/districts?district=1_2`, `/compare?a=1_2&b=13_37`, and `/gaps?district=1_2` directly, then refresh each route. The [Vercel Vite SPA rewrite](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas) is configured in `frontend/vercel.json`.
5. Confirm `/health` succeeds on Render, then use the browser network panel to verify that requests to `/api/districts` and `/api/map/geojson` succeed from the deployed frontend origin. Confirm that clicking a map district opens its profile.

The Vercel project and production origin must be configured by someone with access to the hosting accounts.
