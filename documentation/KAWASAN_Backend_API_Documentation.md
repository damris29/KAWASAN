
# KAWASAN Backend API Documentation

**Project:** KAWASAN — Regional Development Intelligence Platform  
**API Framework:** FastAPI (Python)  
**API Version:** 0.1.0  
**Development Base URL:** `http://127.0.0.1:8000`

## 1. Introduction

The KAWASAN Backend API provides access to district-level socioeconomic indicators, regional development scores, benchmarking results, gap analysis, and geographic data for Malaysia.

The backend supports the KAWASAN dashboard by supplying structured JSON responses and GeoJSON geographic features.

### Core Capabilities

- Retrieve district information and socioeconomic indicators.
- Access KAWASAN Regional Development Index (KRDI) scores and rankings.
- Compare development indicators between districts.
- Benchmark district performance against national district-level statistics.
- Identify relative development gaps and infrastructure shortfalls.
- Retrieve geographic boundaries for interactive maps.
- Combine district intelligence and geographic information for dashboard integration.

### Data Coverage

- **District coverage:** 155 Malaysian districts
- **Primary analytical reference year:** 2024
- **KRDI version:** v0.1 (provisional)
- **Geographic format:** GeoJSON
- **API response format:** JSON

### Important Notes

KRDI v0.1 is an exploratory composite index developed for KAWASAN. Its indicator selection, normalisation methods and weights are provisional.

Some socioeconomic indicators have incomplete geographic or historical coverage. Results should be interpreted with reference to their reporting year, units and available data.

## 2. API Access

The backend is currently intended for local development and testing.

**Interactive API documentation (Swagger UI):**

`http://127.0.0.1:8000/docs`

**Health check endpoint:**

`GET /health`

Expected response:

```json
{
  "status": "healthy",
  "service": "KAWASAN Backend"
}
```

The backend currently permits cross-origin GET requests from the configured local frontend development origins, including `http://localhost:5173` and `http://localhost:3000`.

The API must be running before frontend applications can request data.


## 3. API Endpoint Reference

All endpoints use the HTTP GET method and return JSON responses, except geographic endpoints, which return GeoJSON-compatible JSON.

### 3.1 System Endpoints

| Endpoint | Description |
|---|---|
| `/` | API root information |
| `/health` | Backend health check |

### 3.2 District Intelligence

| Endpoint | Description |
|---|---|
| `/api/districts` | List available districts |
| `/api/districts/{district_code}` | Retrieve district KRDI results |
| `/api/districts/{district_code}/intelligence` | Retrieve socioeconomic indicators |
| `/api/districts/{district_code}/overview` | Retrieve combined KRDI and indicator information |
| `/api/districts/{district_code}/benchmark` | Retrieve national district-level benchmarking |
| `/api/districts/{district_code}/gaps` | Identify relative strengths and development gaps |
| `/api/districts/{district_code}/infrastructure-gaps` | Analyse infrastructure access shortfalls |
| `/api/districts/{district_code}/full-intelligence` | Retrieve consolidated district analytics |

### 3.3 District Comparison

| Endpoint | Description |
|---|---|
| `/api/compare?district_a={code_a}&district_b={code_b}` | Compare two districts |

### 3.4 Geographic and Dashboard Data

| Endpoint | Description |
|---|---|
| `/api/map/districts` | Retrieve district attributes for mapping |
| `/api/map/geojson` | Retrieve GeoJSON boundaries for all 155 districts |
| `/api/map/geojson/{district_code}` | Retrieve a single district's geographic boundary |
| `/api/map/districts/{district_code}/dashboard` | Retrieve combined geographic and analytical dashboard data |

### 3.5 District Code Format

Districts are identified using the standardised geographic key:

`code_state_district`

Example: `1_2` represents Johor Bahru, Johor.

Example request:

`GET /api/districts/1_2`

### 3.6 Example Requests

**Retrieve all district map boundaries:**

`GET http://127.0.0.1:8000/api/map/geojson`

**Retrieve Johor Bahru's full intelligence:**

`GET http://127.0.0.1:8000/api/districts/1_2/full-intelligence`

**Compare Johor Bahru and another district:**

`GET http://127.0.0.1:8000/api/compare?district_a=1_2&district_b=13_37`

**Retrieve Johor Bahru's dashboard data:**

`GET http://127.0.0.1:8000/api/map/districts/1_2/dashboard`

### 3.7 Integration Notes

- All requests currently use the GET method.
- The frontend should use district codes rather than district names as identifiers.
- API responses may contain missing or unavailable indicator values.
- The GeoJSON endpoints provide geographic boundaries for map visualisation.
- The dashboard endpoint combines geographic information and analytical results.
- The frontend should display the relevant reference year and indicate that KRDI v0.1 is provisional.
- CS1 should configure the frontend's API base URL for the integration environment.


## 4. API Response Structures

This section describes the main types of data returned by the KAWASAN API.

### 4.1 KRDI Results

Endpoint:

`GET /api/districts/{district_code}`

Provides district-level KRDI information, including:

- District identification
- KRDI score
- National ranking
- Development category
- Dimension scores

KRDI v0.1 contains three analytical dimensions:

1. Economic Wellbeing
2. Economic Equality
3. Infrastructure

The index is provisional and uses exploratory indicator weights.

### 4.2 District Intelligence

Endpoint:

`GET /api/districts/{district_code}/intelligence`

Provides socioeconomic indicators covering:

- Economy
- Education
- Employment
- Infrastructure
- Demographics

The unified district dataset contains 28 analytical indicators. Individual indicators may have missing values.

### 4.3 Benchmarking Results

Endpoint:

`GET /api/districts/{district_code}/benchmark`

Compares selected district indicators against the national median across districts with available data.

Benchmarking considers whether higher or lower values indicate more favourable outcomes.

The calculated rank position is a relative ranking measure, not a statistical percentile.

### 4.4 Development Gap Analysis

Endpoint:

`GET /api/districts/{district_code}/gaps`

Groups benchmarked indicators into:

- Relative strengths
- Middle range
- Potential gaps

These classifications are exploratory and depend on relative district ranking.

### 4.5 Infrastructure Gap Analysis

Endpoint:

`GET /api/districts/{district_code}/infrastructure-gaps`

Evaluates access shortfalls for:

- Piped water
- Sanitation
- Electricity

Shortfalls are calculated relative to 100% access.

### 4.6 Geographic Data

Endpoint:

`GET /api/map/geojson`

Returns a GeoJSON FeatureCollection containing district boundaries and associated KRDI attributes.

The geographic dataset contains 155 matched district features.

### 4.7 Combined Dashboard Response

Endpoint:

`GET /api/map/districts/{district_code}/dashboard`

Combines two main response components:

- `geography`: District GeoJSON FeatureCollection
- `intelligence`: Consolidated district analytical results

This endpoint is intended to simplify district-level dashboard integration.


### 4.8 Verified KRDI API Response Example

**Endpoint:**

`GET /api/districts/1_2`

**Example district:** Johor Bahru, Johor

**Response:**

```json
{
  "state": "johor",
  "district": "johor bahru",
  "district_code": "1_2",
  "reference_year": 2024,
  "index_version": "KRDI_v0.1",
  "krdi": {
    "score": 80.11,
    "rank": 13,
    "rank_range": 18,
    "stability": "Weight-sensitive"
  },
  "dimensions": {
    "economic_wellbeing": 83.68,
    "economic_equality": 41.36,
    "infrastructure": 100.0
  }
}
```

**Field descriptions:**

| Field | Description |
|---|---|
| `state` | State name |
| `district` | District name |
| `district_code` | Standardised geographic identifier |
| `reference_year` | Analytical reference year |
| `index_version` | KRDI methodology version |
| `krdi.score` | Composite development score |
| `krdi.rank` | District ranking |
| `krdi.rank_range` | Ranking variation across tested weighting scenarios |
| `krdi.stability` | Weight sensitivity classification |
| `dimensions` | Scores for the three KRDI dimensions |

**Note:** KRDI scores and rankings are provisional. An infrastructure dimension score of 100 represents the maximum normalised dimension score, not necessarily 100% access to every infrastructure service.


### 4.9 Verified District Intelligence Response

**Endpoint:**

`GET /api/districts/1_2/intelligence`

**Example district:** Johor Bahru, Johor

**Reference year:** 2024

The API returns 28 socioeconomic indicators organised into five categories.

| Category | Indicators | Count |
|---|---|---:|
| Economy | income_mean, income_median, expenditure_mean, gini, poverty_absolute, poverty_relative | 6 |
| Education | enrolment_primary, enrolment_secondary, enrolment_post_secondary, completion_primary, completion_secondary_lower, completion_secondary_upper, schools_primary, schools_secondary, schools_tertiary, teachers_primary, teachers_secondary | 11 |
| Employment | lf, lf_employed, lf_unemployed, lf_outside, p_rate, u_rate, ep_ratio | 7 |
| Infrastructure | piped_water, sanitation, electricity | 3 |
| Demographics | population | 1 |
| **Total** | | **28** |

#### Response Structure

The JSON response contains:

- `district_code`: Standardised district identifier
- `district`: District name
- `state`: State name
- `reference_year`: Analytical reference year
- `indicators`: Object containing five indicator categories

#### Example Indicator Values

| Indicator | Johor Bahru |
|---|---:|
| Mean household income | 10,975 |
| Median household income | 8,977 |
| Absolute poverty | 1.9 |
| Gini coefficient | 0.35 |
| Labour force participation rate | 74.6 |
| Unemployment rate | 2.7 |
| Piped water access | 99.99 |
| Sanitation access | 100.0 |
| Electricity access | 100.0 |

#### Important Considerations

- The response contains 28 indicators, but availability may differ across districts.
- Missing indicators must be handled appropriately by the frontend.
- The response uses the analytical reference year 2024.
- Indicator units must be verified against the data dictionary and original sources before final presentation.
- Employment and demographic counts may use scaled units and should not automatically be interpreted as individual persons.
- School completion values must be interpreted according to their source definitions.


### 4.10 Verified District Benchmarking Response

**Endpoint:**

`GET /api/districts/1_2/benchmark`

**Example district:** Johor Bahru, Johor

**Reference year:** 2024

**Benchmark scope:** National district comparison

The API returns nine benchmarking indicators, each containing:

- `value`: District indicator value
- `national_median`: Median across districts with available values
- `rank`: District ranking for the indicator
- `out_of`: Number of districts included in the comparison
- `rank_position`: Normalised ranking position (0–100)
- `direction`: Whether higher or lower values are favourable

#### Verified Benchmarking Results

| Indicator | District Value | National Median | Rank |
|---|---:|---:|---:|
| income_median | 8977 | 4606 | 6 |
| poverty_absolute | 1.9 | 8.0 | 14 |
| poverty_relative | 9.9 | 14.3 | 43 |
| gini | 0.350 | 0.328 | 112 |
| p_rate | 74.6 | 66.8 | 11 |
| u_rate | 2.7 | 2.9 | 65 |
| piped_water | 99.99 | 98.99 | 65 |
| sanitation | 100 | 100 | 1 |
| electricity | 100 | 100 | 1 |

All nine indicators in this example have a comparison coverage of 155 districts.

#### Indicator Direction

Higher values are considered favourable for:

- income_median
- p_rate
- piped_water
- sanitation
- electricity

Lower values are considered favourable for:

- poverty_absolute
- poverty_relative
- gini
- u_rate

#### Rank Position Calculation

For the current benchmarking implementation:

`rank_position = 100 × (out_of - rank) / (out_of - 1)`

A higher rank position indicates a more favourable relative ranking.

This measure is not a statistical percentile. Tied indicator values may share the same rank.

#### Interpretation Notes

- National medians are calculated across districts, not population-weighted.
- Ranking direction depends on the indicator.
- Coverage may differ for indicators with missing values.
- Benchmark results describe relative district performance, not causal relationships.


### 4.11 Verified Development Gap Analysis Response

**Endpoint:**

`GET /api/districts/1_2/gaps`

**Example district:** Johor Bahru, Johor

**Reference year:** 2024

**Classification method:** National rank position

#### Response Structure

The API returns:

- `district_code`: Standardised district identifier
- `district`: District name
- `state`: State name
- `reference_year`: Analytical reference year
- `classification_method`: Method used for classification
- `summary`: Number of indicators in each classification
- `development_gaps`: Indicators grouped by classification

#### Classification Rules

| Classification | Rank Position |
|---|---|
| Relative strengths | 75 to 100 |
| Middle range | 25 to below 75 |
| Potential gaps | Below 25 |

These thresholds are provisional and intended for exploratory analysis.

#### Verified Results — Johor Bahru

| Classification | Count | Indicators |
|---|---:|---|
| Relative strengths | 5 | income_median, poverty_absolute, p_rate, sanitation, electricity |
| Middle range | 4 | poverty_relative, gini, u_rate, piped_water |
| Potential gaps | 0 | None |

Each indicator entry contains:

- `indicator`
- `value`
- `national_median`
- `rank`
- `out_of`
- `rank_position`

#### Interpretation Notes

- Classification is based on relative national district rankings.
- Higher rank positions represent more favourable performance after accounting for indicator direction.
- The analysis covers nine selected indicators, not every aspect of regional development.
- An empty `potential_gaps` array does not imply that a district has no socioeconomic challenges.
- Classifications may change when underlying data, geographic coverage or benchmarking rules are updated.


### 4.12 Verified Infrastructure Gap Analysis Response

**Endpoint:**

`GET /api/districts/1_2/infrastructure-gaps`

**Example district:** Johor Bahru, Johor

**Reference year:** 2024

#### Response Structure

The API returns:

- `district_code`: Standardised district identifier
- `district`: District name
- `state`: State name
- `reference_year`: Analytical reference year
- `infrastructure_access`: Infrastructure access indicators and shortfalls
- `summary`: Count and names of indicators with substantial gaps

Each infrastructure indicator contains:

- `access_percent`
- `shortfall_percentage_points`
- `classification`

#### Calculation Method

Infrastructure shortfall is calculated as:

`Shortfall (percentage points) = 100 - Access (%)`

#### Classification Rules

| Shortfall | Classification |
|---|---|
| 0–1 percentage points | Near-universal access |
| Above 1–5 | Minor gap |
| Above 5–15 | Moderate gap |
| Above 15 | Substantial gap |

#### Verified Results — Johor Bahru

| Indicator | Access (%) | Shortfall (pp) | Classification |
|---|---:|---:|---|
| piped_water | 99.99 | 0.01 | Near-universal access |
| sanitation | 100.0 | 0 | Near-universal access |
| electricity | 100.0 | 0 | Near-universal access |

**Substantial gap count:** 0

**Substantial gap indicators:** Empty array

#### Interpretation Notes

- Infrastructure gaps represent shortfalls from universal access.
- These are absolute access shortfalls, not relative national rankings.
- The classifications are exploratory.
- Missing infrastructure data must not be interpreted as zero access.


### 4.13 Verified District Comparison Response

**Endpoint:**

`GET /api/compare?district_a=1_2&district_b=13_37`

**Reference year:** 2024

**District A:** Johor Bahru, Johor  
**District B:** Bukit Mabong, Sarawak

#### Response Structure

The API returns:

- `reference_year`: Analytical reference year
- `district_a`: Identification and KRDI results for the first district
- `district_b`: Identification and KRDI results for the second district
- `indicator_comparison`: Nine socioeconomic indicators for both districts

Each district object contains:

- `code`
- `name`
- `state`
- `krdi.score`
- `krdi.rank`
- `krdi.rank_range`
- `krdi.stability`

Each indicator comparison contains:

- `district_a`: Indicator value for the first district
- `district_b`: Indicator value for the second district

#### Verified KRDI Comparison

| Metric | Johor Bahru | Bukit Mabong |
|---|---:|---:|
| KRDI Score | 80.11 | 23.92 |
| National Rank | 13 | 155 |
| Rank Range | 18 | 1 |
| Rank Stability | Weight-sensitive | Very stable |

#### Verified Indicator Comparison

| Indicator | Johor Bahru | Bukit Mabong |
|---|---:|---:|
| income_median | 8977 | 2589 |
| poverty_absolute | 1.9 | 6.3 |
| poverty_relative | 9.9 | 54.2 |
| gini | 0.350 | 0.333 |
| p_rate | 74.6 | 64.4 |
| u_rate | 2.7 | 2.8 |
| piped_water | 99.99 | 25.0 |
| sanitation | 100.0 | 100.0 |
| electricity | 100.0 | 54.17 |

#### Integration Notes

- Districts are selected using their standardised district codes.
- Both district objects contain KRDI results.
- The `indicator_comparison` object provides paired values for nine indicators.
- CS2 can use this response to generate side-by-side charts and comparison tables.
- Indicator direction must be considered when interpreting performance.
- Missing values should be displayed as unavailable rather than zero.
- The KRDI methodology and rankings are provisional.
- Indicator units must be verified against the data dictionary before final presentation.


## 5. Geographic and Dashboard Integration

### 5.1 Complete District GeoJSON

**Endpoint:**

`GET /api/map/geojson`

Returns a GeoJSON FeatureCollection containing geographic boundaries for 155 Malaysian districts.

Each district feature contains geographic information and KRDI attributes.

Key properties include:

- `state`
- `district`
- `code_state`
- `code_district`
- `code_state_district`
- `krdi_score`
- `krdi_rank`
- `rank_stability`
- `krdi_category`
- `reference_year`
- `index_version`

The geographic features use MultiPolygon geometries.

**Frontend usage:**

CS2 can use the GeoJSON response to create an interactive district-level map, colour districts according to KRDI scores and display district information when users select a region.

### 5.2 Single District GeoJSON

**Endpoint:**

`GET /api/map/geojson/{district_code}`

Example:

`GET /api/map/geojson/1_2`

Returns a GeoJSON FeatureCollection containing the geographic boundary of the selected district.

This endpoint can support district highlighting, map zooming and geographic selection.

### 5.3 Combined District Dashboard

**Endpoint:**

`GET /api/map/districts/{district_code}/dashboard`

Example:

`GET /api/map/districts/1_2/dashboard`

Returns geographic information and analytical intelligence for the selected district.

The response contains:

- `district_code`: Standardised district identifier
- `geography`: District GeoJSON FeatureCollection
- `intelligence`: Consolidated district analytical information

This endpoint allows the frontend to retrieve the selected district's geographic boundary and analytical results through a single request.

### 5.4 District Map Attributes

**Endpoint:**

`GET /api/map/districts`

Returns district-level attributes for map integration.

This endpoint can support district selection and map-related data processing without requiring the complete geographic boundaries.

---

## 6. Analytical Methodology

### 6.1 KAWASAN Regional Development Index (KRDI)

KRDI v0.1 is an exploratory composite development index.

The current implementation evaluates three dimensions:

1. Economic Wellbeing
2. Economic Equality
3. Infrastructure

The index uses six indicators:

- Median household income
- Absolute poverty
- Relative poverty
- Gini coefficient
- Piped water access
- Electricity access

### 6.2 Normalisation

KRDI v0.1 uses min-max normalisation to transform selected indicators onto a common scale.

Indicator direction is considered during normalisation.

For favourable indicators, higher values produce higher normalised scores.

For unfavourable indicators, lower values produce higher normalised scores.

### 6.3 Provisional Dimension Weights

| Dimension | Weight |
|---|---:|
| Economic Wellbeing | 50% |
| Economic Equality | 20% |
| Infrastructure | 30% |

These weights are provisional and require further methodological validation.

### 6.4 Weight Sensitivity

The analytical work includes exploratory sensitivity testing using four weighting configurations:

- Baseline
- Equal weights
- Economy-focused
- Infrastructure-focused

The resulting rankings are compared to evaluate how sensitive district positions are to weighting assumptions.

The API exposes rank variation and stability classifications.

### 6.5 Benchmarking and Gap Analysis

District benchmarking compares selected indicators against national district-level medians.

The implementation accounts for whether higher or lower values represent more favourable outcomes.

Development gap classifications are based on normalised rank positions.

Infrastructure gaps are calculated as percentage-point shortfalls from universal access.

### 6.6 Methodological Limitations

- KRDI v0.1 is provisional and is not an official government development index.
- The index covers six selected indicators rather than every dimension of regional development.
- Normalised scores should not be interpreted as direct measurements of service access.
- Missing data and geographic coverage may affect comparisons.
- Data from different reporting years should not automatically be treated as directly comparable.
- Indicator units and definitions must be verified against original sources.
- Rankings and gap classifications are descriptive, not causal.

---

## 7. Backend Integration Guide

### 7.1 Local Development

The backend uses Python and FastAPI.

From the KAWASAN project root, navigate to the API directory:

```powershell
cd api
```

Start the backend using the project virtual environment on Windows:

```powershell
& "..\.venv\Scripts\python.exe" -m uvicorn main:app --reload
```

Default local API URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

### 7.2 Frontend Integration

The frontend can retrieve API data using HTTP GET requests.

Example JavaScript request:

```javascript
const response = await fetch(
  "http://127.0.0.1:8000/api/districts/1_2"
);

if (!response.ok) {
  throw new Error(`API error: ${response.status}`);
}

const data = await response.json();

console.log(data);
```

### 7.3 Cross-Origin Resource Sharing (CORS)

The backend currently permits GET requests from the following local frontend origins:

- `http://localhost:3000`
- `http://localhost:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:5173`

CORS settings may require adjustment when the frontend is deployed to a different origin.

### 7.4 Integration Responsibilities

**CS1 — Technical Lead & Data Engineering**

- Manage the shared GitHub repository.
- Coordinate system architecture and integration.
- Maintain data ingestion and validation workflows.
- Configure shared backend environments.
- Ensure consistent data schemas and reliable data access.

**CS2 — Frontend & Geospatial UI**

- Develop the interactive dashboard.
- Integrate district maps and charts.
- Consume backend API responses.
- Implement loading, missing-data and error states.
- Display appropriate data sources and reporting years.

**CS3 — Analytics & Backend**

- Maintain analytical calculations and KRDI methodology.
- Provide backend functions and API outputs.
- Verify benchmarking and gap analysis.
- Support integration troubleshooting when necessary.
- Document analytical assumptions and limitations.

### 7.5 Integration Checklist

- [ ] Shared repository is configured by CS1.
- [ ] Backend dependencies and setup instructions are documented.
- [ ] Required datasets are accessible in the integration environment.
- [ ] FastAPI starts successfully after repository setup.
- [ ] CS2 can retrieve district intelligence through the API.
- [ ] CS2 can render the GeoJSON district boundaries.
- [ ] District selection uses `code_state_district`.
- [ ] Missing data and API errors are handled appropriately.
- [ ] CORS settings match the frontend development environment.
- [ ] End-to-end integration tests are completed.

---

## 8. Final Notes

The KAWASAN backend provides a functional foundation for district-level development intelligence.

Core implemented capabilities include:

- KRDI scores and rankings
- Socioeconomic indicator retrieval
- National district benchmarking
- Development gap analysis
- Infrastructure gap analysis
- District comparisons
- Geographic boundary retrieval
- Combined geographic and analytical dashboard responses

The backend has been tested locally, including successful browser-to-API connectivity.

Further work includes final methodological validation, reproducibility testing, frontend integration and deployment preparation.

**Current API Version:** 0.1.0

**Current KRDI Version:** v0.1

**Primary Analytical Reference Year:** 2024
