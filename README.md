# KAWASAN
### Know Your Area: District-Level Socioeconomic Intelligence Dashboard

KAWASAN is a data-driven platform designed to analyse and visualise socioeconomic development across Malaysian districts using publicly available datasets.

The platform aims to make district-level information more accessible, helping users explore regional disparities, compare socioeconomic conditions, identify development gaps, and understand development patterns through interactive visualisations.

## Project Links

- [Production dashboard](https://kawasan-gamma.vercel.app/)
- [API health](https://kawasan-api.onrender.com/health) and [interactive API documentation](https://kawasan-api.onrender.com/docs)
- [Frontend setup and deployment guide](frontend/README.md)
- [API and KRDI methodology](documentation/KAWASAN_Backend_API_Documentation.md)
- [Production QA report and evidence](documentation/KAWASAN_Production_QA_Report.md)


## Overview

KAWASAN combines data analytics, a composite development index, geographic information, and a REST API to support an interactive socioeconomic intelligence dashboard.

Key capabilities include:

- District-level socioeconomic analysis
- KAWASAN Regional Development Index (KRDI)
- District comparisons and development gap analysis
- Interactive geographic visualisation
- Multi-indicator socioeconomic intelligence
- API-based data retrieval

## Repository Structure

The repository contains the analytical and backend components supporting KAWASAN.

### `api/`

Contains the FastAPI backend.

**Main application:** `api/main.py`

The backend currently provides 15 GET endpoints for accessing district-level analytics, KRDI results, geographic information, and socioeconomic intelligence.

### `data/`

Contains the source, intermediate, and processed datasets used in the project.

Key files include:

**Unified District Dataset**

`data/analytics_dataset/KAWASAN_Unified_District_Dataset_2024.csv`

A consolidated dataset containing socioeconomic indicators for district-level analysis.

**KRDI Dataset**

`data/analytics_dataset/KAWASAN_KRDI_District_2024_v0.1.csv`

Contains the calculated KAWASAN Regional Development Index results.

**Geographic Dataset**

`data/processed/kawasan_krdi_2024_map.geojson`

Contains geographic features used for district-level map visualisation.

### Jupyter Notebooks

Python-based notebooks used for:

- Exploratory data analysis
- Data cleaning and preprocessing
- Dataset integration
- Indicator calculations
- KRDI development
- Analytical validation

### `tests/`

Contains tests for validating backend functionality and analytical outputs.

### `documentation/`

Contains supporting project documentation and analytical methodology.

### `requirements.txt`

Defines the Python dependencies required to run the backend.

## Data and Analytics

The current analytical implementation covers:

| Component | Description |
|---|---|
| Geographic coverage | 155 eligible districts across 12 Malaysian states |
| Socioeconomic indicators | 28 indicators |
| Development index | KRDI v0.1 |
| KRDI components | 6 selected indicators |
| Sensitivity analysis | 4 weighting scenarios |
| Geographic format | GeoJSON |
| Data formats | CSV, JSON, GeoJSON |

### KAWASAN Regional Development Index (KRDI)

KRDI is a composite index developed to support comparative analysis of district-level socioeconomic conditions.

It combines selected indicators into a standardised development score, enabling the identification of relative strengths, weaknesses, and development gaps.

Sensitivity analysis is incorporated to examine how alternative weighting assumptions influence the results.

KRDI should be interpreted as a project-defined analytical measure rather than an official government development index.

### Data Limitations

National statistics and rankings reflect the eligible districts in the 2024 analytical dataset. Socioeconomic data were collected for Perlis, Kuala Lumpur, Putrajaya, and Labuan. Reference-year alignment and indicator coverage were insufficient for comparable KRDI v0.1 scores. These areas remain unscored and unranked and may be included in future versions when suitable data become available.

Missing values are preserved where appropriate and should be displayed as **N/A**, rather than interpreted as zero.

Users should consider data availability, indicator definitions, and methodological limitations when interpreting results.

## Technology Stack

| Layer | Technology |
|---|---|
| Data analysis | Python, Pandas, NumPy |
| Analytical development | Jupyter Notebook |
| Backend framework | FastAPI |
| API server | Uvicorn |
| Data storage | CSV, GeoJSON |
| Frontend | React, JavaScript |
| Styling | Tailwind CSS |
| Maps | React Leaflet |
| Charts | Recharts |

## Local Setup

The verified local toolchain is Python 3.13 and Node.js 24 with npm.

### 1. Clone the repository

```bash
git clone https://github.com/damris29/KAWASAN.git
cd KAWASAN
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the backend

Run from the repository root:

```bash
python -m uvicorn api.main:app --reload
```

The API will be available locally at:

- Base URL: `http://127.0.0.1:8000`
- API Documentation: `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/health`

### 5. Start the frontend

Keep the API running and open a second terminal. From the repository root, run:

```powershell
cd frontend
Copy-Item .env.example .env.local
npm ci
npm run dev -- --host localhost --port 5173 --strictPort
```

Open `http://localhost:5173`. For local development, `frontend/.env.local` should contain `VITE_API_BASE_URL=http://127.0.0.1:8000`. If the file already exists, update that setting directly. To use Render instead, set it to `https://kawasan-api.onrender.com` and restart Vite.


## API Documentation

KAWASAN uses FastAPI to expose analytical results through REST endpoints.

The backend currently contains **15 GET endpoints**.

Selected endpoints include:

| Endpoint | Description |
|---|---|
| `GET /health` | API health check |
| `GET /api/districts` | Retrieve district information |
| `GET /api/map/geojson` | Retrieve geographic features |
| `GET /api/map/geojson/{district_code}` | Retrieve geographic information for a selected district |
| `GET /api/districts/{district_code}/full-intelligence` | Retrieve comprehensive socioeconomic intelligence for a district |

For the complete endpoint list, request parameters, and response schemas, visit:

`http://127.0.0.1:8000/docs`

### Example API Integration

The API can be consumed by any frontend capable of making HTTP requests.

Example using JavaScript:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function fetchDistricts() {
  const response = await fetch(`${API_BASE_URL}/api/districts`);

  if (!response.ok) {
    throw new Error("Failed to retrieve district data");
  }

  return response.json();
}
```

Example local environment configuration:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Replace the local URL with the deployed API URL when hosting the application.

## Backend Deployment

The FastAPI backend can be deployed using a Python-compatible hosting service such as Render.

Example Render configuration:

| Setting | Value |
|---|---|
| Service Type | Web Service |
| Runtime | Python |
| Branch | `master` |
| Root Directory | Repository root |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn api.main:app --host 0.0.0.0 --port $PORT` |

After deployment, verify the health endpoint and API documentation before connecting the frontend.

## Frontend Deployment

| Host | Required setting | Value |
| --- | --- | --- |
| Vercel | Root directory | `frontend` |
| Vercel | Framework / Node.js | Vite / 24.x |
| Vercel | Install / build / output | `npm ci` / `npm run build` / `dist` |
| Vercel | `VITE_API_BASE_URL` | `https://kawasan-api.onrender.com` |
| Render | `FRONTEND_ORIGINS` | `https://kawasan-gamma.vercel.app`, plus any other approved origins separated by commas |

Enter origins without a trailing slash. The SPA rewrite is already in `frontend/vercel.json`. Store local settings in `frontend/.env.local` and production settings in the hosting dashboards. Commit configuration examples only.

## Submission Checklist

- [ ] Include the production dashboard URL, the repository URL, and the submission commit or tag.
- [ ] Include the KRDI methodology and the QA report with evidence links. Confirm the evidence files are available in the submission.
- [ ] Run `npm run lint` and `npm run build` from `frontend`.
- [ ] Run `python -m unittest discover -s tests -v` from the repository root with the local API running.
- [ ] Verify the deployed release by opening and refreshing all four dashboard routes. Check district selection, map navigation, comparison swap, gap analysis, and keyboard access.
- [ ] Record the final deployment status and any remaining limitations in the QA report.


## Development Notes

- The backend reads processed datasets directly from the repository.
- Dataset paths are resolved relative to the project directory.
- Jupyter notebooks are used for analytical development and are not required during normal API operation.
- The API returns JSON-compatible responses for frontend integration.
- Geographic data is provided in GeoJSON format.
- Missing socioeconomic values should not be interpreted as zero.
- Analytical methodology and data limitations should be considered when presenting KRDI results.

---

**KAWASAN — Turning Malaysian district data into actionable socioeconomic intelligence.**
