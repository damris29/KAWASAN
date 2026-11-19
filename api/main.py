from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="KAWASAN API",
    description="Regional Development Intelligence Platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "platform": "KAWASAN",
        "status": "running",
        "api_version": "0.1.0"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "KAWASAN Backend"
    }

from pathlib import Path
import pandas as pd

# Locate the KAWASAN project directory
PROJECT_DIR = Path(__file__).resolve().parent.parent

KRDI_PATH = (
    PROJECT_DIR
    / "data"
    / "analytics_dataset"
    / "KAWASAN_KRDI_District_2024_v0.1.csv"
)

# Load KRDI data
krdi_df = pd.read_csv(KRDI_PATH)


@app.get("/api/districts")
def list_districts():
    columns = [
        "state_clean",
        "district_clean",
        "code_state_district",
        "KRDI",
        "KRDI_rank",
        "rank_stability"
    ]

    districts = krdi_df[columns].copy()

    districts = districts.sort_values("KRDI_rank")

    return {
        "total_districts": len(districts),
        "index_version": "KRDI_v0.1",
        "districts": districts.to_dict(orient="records")
    }

from fastapi import HTTPException


@app.get("/api/districts/{district_code}")
def get_district(district_code: str):

    district = krdi_df[
        krdi_df["code_state_district"].astype(str) == district_code
    ]

    if district.empty:
        raise HTTPException(
            status_code=404,
            detail="District not found"
        )

    record = district.iloc[0]

    return {
        "state": record["state_clean"],
        "district": record["district_clean"],
        "district_code": record["code_state_district"],
        "reference_year": int(record["reference_year"]),
        "index_version": record["index_version"],
        "krdi": {
            "score": float(record["KRDI"]),
            "rank": int(record["KRDI_rank"]),
            "rank_range": int(record["rank_range"]),
            "stability": record["rank_stability"]
        },
        "dimensions": {
    "economic_wellbeing": round(
        float(record["economic_wellbeing_score"]), 2
    ),
    "economic_equality": round(
        float(record["economic_equality_score"]), 2
    ),
    "infrastructure": round(
        float(record["infrastructure_score"]), 2
    )
}
    }

# Step 63: District Intelligence API

DISTRICT_PATH = (
    PROJECT_DIR
    / "data"
    / "analytics_dataset"
    / "KAWASAN_Unified_District_Dataset_2024.csv"
)

district_df = pd.read_csv(DISTRICT_PATH)


def clean_value(value):
    """Convert missing values to None and NumPy numbers to Python types."""
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value


@app.get("/api/districts/{district_code}/intelligence")
def get_district_intelligence(district_code: str):

    district = district_df[
        district_df["code_state_district"].astype(str) == district_code
    ]

    if district.empty:
        raise HTTPException(
            status_code=404,
            detail="District not found"
        )

    record = district.iloc[0]

    groups = {
        "economy": [
            "income_mean",
            "income_median",
            "expenditure_mean",
            "gini",
            "poverty_absolute",
            "poverty_relative"
        ],
        "education": [
            "enrolment_primary",
            "enrolment_secondary",
            "enrolment_post_secondary",
            "completion_primary",
            "completion_secondary_lower",
            "completion_secondary_upper",
            "schools_primary",
            "schools_secondary",
            "schools_tertiary",
            "teachers_primary",
            "teachers_secondary"
        ],
        "employment": [
            "lf",
            "lf_employed",
            "lf_unemployed",
            "lf_outside",
            "p_rate",
            "u_rate",
            "ep_ratio"
        ],
        "infrastructure": [
            "piped_water",
            "sanitation",
            "electricity"
        ],
        "demographics": [
            "population"
        ]
    }

    indicators = {}

    for group, columns in groups.items():
        indicators[group] = {
            column: clean_value(record[column])
            for column in columns
        }

    return {
        "district_code": district_code,
        "district": record["district_clean"],
        "state": record["state_clean"],
        "reference_year": 2024,
        "indicators": indicators
    }

# Step 64: Complete District Intelligence API

@app.get("/api/districts/{district_code}/overview")
def get_district_overview(district_code: str):

    # Reuse our existing API functions
    krdi = get_district(district_code)
    intelligence = get_district_intelligence(district_code)

    return {
        "district_code": district_code,
        "district": intelligence["district"],
        "state": intelligence["state"],
        "reference_year": 2024,
        "index_version": krdi["index_version"],

        "krdi": krdi["krdi"],
        "dimensions": krdi["dimensions"],

        "indicators": intelligence["indicators"]
    }

# Step 65: District Benchmarking API

BENCHMARK_INDICATORS = {
    "income_median": "higher",
    "poverty_absolute": "lower",
    "poverty_relative": "lower",
    "gini": "lower",
    "p_rate": "higher",
    "u_rate": "lower",
    "piped_water": "higher",
    "sanitation": "higher",
    "electricity": "higher"
}


@app.get("/api/districts/{district_code}/benchmark")
def get_district_benchmark(district_code: str):

    district = district_df[
        district_df["code_state_district"].astype(str) == district_code
    ]

    if district.empty:
        raise HTTPException(
            status_code=404,
            detail="District not found"
        )

    record = district.iloc[0]
    results = {}

    for indicator, direction in BENCHMARK_INDICATORS.items():

        values = district_df[indicator].dropna()
        value = record[indicator]

        if pd.isna(value):
            results[indicator] = None
            continue

        if direction == "higher":
            rank = int((values > value).sum() + 1)
        else:
            rank = int((values < value).sum() + 1)

        total = len(values)

        rank_position = (
            100 * (total - rank) / (total - 1)
            if total > 1 else None
        )

        results[indicator] = {
            "value": float(value),
            "national_median": float(values.median()),
            "rank": rank,
            "out_of": total,
            "rank_position": (
                round(rank_position, 2)
                if rank_position is not None else None
            ),
            "direction": direction
        }

    return {
        "district_code": district_code,
        "district": record["district_clean"],
        "state": record["state_clean"],
        "reference_year": 2024,
        "benchmark_scope": "National district comparison",
        "benchmarks": results
    }

# Step 66: Development Gap Engine API

@app.get("/api/districts/{district_code}/gaps")
def get_district_gaps(district_code: str):

    benchmark = get_district_benchmark(district_code)

    groups = {
        "relative_strengths": [],
        "middle_range": [],
        "potential_gaps": []
    }

    for indicator, result in benchmark["benchmarks"].items():

        if result is None:
            continue

        position = result["rank_position"]

        item = {
            "indicator": indicator,
            "value": result["value"],
            "national_median": result["national_median"],
            "rank": result["rank"],
            "out_of": result["out_of"],
            "rank_position": position
        }

        if position >= 75:
            groups["relative_strengths"].append(item)

        elif position >= 25:
            groups["middle_range"].append(item)

        else:
            groups["potential_gaps"].append(item)

    return {
        "district_code": district_code,
        "district": benchmark["district"],
        "state": benchmark["state"],
        "reference_year": 2024,
        "classification_method": "National rank position",
        "summary": {
            "relative_strengths": len(groups["relative_strengths"]),
            "middle_range": len(groups["middle_range"]),
            "potential_gaps": len(groups["potential_gaps"])
        },
        "development_gaps": groups
    }

# Step 67: Infrastructure Access Gap API

INFRASTRUCTURE_INDICATORS = [
    "piped_water",
    "sanitation",
    "electricity"
]


@app.get("/api/districts/{district_code}/infrastructure-gaps")
def get_infrastructure_gaps(district_code: str):

    district = district_df[
        district_df["code_state_district"].astype(str) == district_code
    ]

    if district.empty:
        raise HTTPException(
            status_code=404,
            detail="District not found"
        )

    record = district.iloc[0]
    results = {}
    substantial_gaps = []

    for indicator in INFRASTRUCTURE_INDICATORS:

        value = record[indicator]

        if pd.isna(value):
            results[indicator] = None
            continue

        access = float(value)
        shortfall = round(max(0, 100 - access), 2)

        if shortfall <= 1:
            classification = "Near-universal access"
        elif shortfall <= 5:
            classification = "Minor shortfall"
        elif shortfall <= 15:
            classification = "Moderate shortfall"
        else:
            classification = "Substantial shortfall"
            substantial_gaps.append(indicator)

        results[indicator] = {
            "access_percent": round(access, 2),
            "shortfall_percentage_points": shortfall,
            "classification": classification
        }

    return {
        "district_code": district_code,
        "district": record["district_clean"],
        "state": record["state_clean"],
        "reference_year": 2024,
        "infrastructure_access": results,
        "summary": {
            "substantial_gap_count": len(substantial_gaps),
            "substantial_gap_indicators": substantial_gaps
        }
    }

# Step 68: Complete District Development Intelligence

@app.get("/api/districts/{district_code}/full-intelligence")
def get_full_district_intelligence(district_code: str):

    overview = get_district_overview(district_code)
    benchmark = get_district_benchmark(district_code)
    gaps = get_district_gaps(district_code)
    infrastructure = get_infrastructure_gaps(district_code)

    return {
        **overview,

        "benchmarking": benchmark["benchmarks"],

        "development_analysis": {
            "summary": gaps["summary"],
            "relative_strengths": gaps["development_gaps"]["relative_strengths"],
            "middle_range": gaps["development_gaps"]["middle_range"],
            "potential_gaps": gaps["development_gaps"]["potential_gaps"]
        },

        "infrastructure_analysis": {
            "access": infrastructure["infrastructure_access"],
            "summary": infrastructure["summary"]
        },

        "methodology_notes": {
            "krdi": "Provisional KRDI v0.1; rankings depend on indicator weights and normalisation.",
            "benchmarking": "National district comparison using rank-based positions; ties share ranks.",
            "development_gaps": "Exploratory classification based on relative national standing.",
            "infrastructure": "Shortfalls measured in percentage points from 100% access."
        }
    }

# Step 69: District Comparison API

from fastapi import Query


@app.get("/api/compare")
def compare_districts(
    district_a: str = Query(...),
    district_b: str = Query(...)
):
    # Retrieve both districts using existing functions
    first = get_district_overview(district_a)
    second = get_district_overview(district_b)

    comparison_indicators = [
        "income_median",
        "poverty_absolute",
        "poverty_relative",
        "gini",
        "p_rate",
        "u_rate",
        "piped_water",
        "sanitation",
        "electricity"
    ]

    comparison = {}

    for indicator in comparison_indicators:

        first_value = clean_value(
            district_df.loc[
                district_df["code_state_district"].astype(str) == district_a,
                indicator
            ].iloc[0]
        )

        second_value = clean_value(
            district_df.loc[
                district_df["code_state_district"].astype(str) == district_b,
                indicator
            ].iloc[0]
        )

        comparison[indicator] = {
            "district_a": first_value,
            "district_b": second_value
        }

    return {
        "reference_year": 2024,
        "district_a": {
            "code": district_a,
            "name": first["district"],
            "state": first["state"],
            "krdi": first["krdi"]
        },
        "district_b": {
            "code": district_b,
            "name": second["district"],
            "state": second["state"],
            "krdi": second["krdi"]
        },
        "indicator_comparison": comparison
    }

# Step 70: District Map Data API

@app.get("/api/map/districts")
def get_district_map_data():

    columns = [
        "state_clean",
        "district_clean",
        "code_state_district",
        "KRDI",
        "KRDI_rank",
        "rank_stability"
    ]

    map_data = krdi_df[columns].copy()

    # Exploratory KRDI score bands
    def classify_krdi(score):
        if score >= 80:
            return "High"
        elif score >= 60:
            return "Moderate"
        elif score >= 40:
            return "Low"
        else:
            return "Very low"

    map_data["krdi_category"] = (
        map_data["KRDI"].apply(classify_krdi)
    )

    return {
        "reference_year": 2024,
        "index_version": "KRDI_v0.1",
        "total_districts": len(map_data),
        "classification_note": (
            "Exploratory score bands, not official "
            "development classifications."
        ),
        "districts": map_data.to_dict(orient="records")
    }

# Step 74: GeoJSON Map API

import json
from pathlib import Path


@app.get("/api/map/geojson")
def get_map_geojson():

    geojson_path = (
        Path(__file__).resolve().parent.parent
        / "data"
        / "processed"
        / "kawasan_krdi_2024_map.geojson"
    )

    if not geojson_path.exists():
        raise HTTPException(
            status_code=404,
            detail="KRDI GeoJSON file not found"
        )

    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson_data = json.load(f)

    return geojson_data

# Step 75: Individual District GeoJSON API

@app.get("/api/map/geojson/{district_code}")
def get_district_geojson(district_code: str):

    geojson_data = get_map_geojson()

    for feature in geojson_data["features"]:

        if (
            str(feature["properties"]["code_state_district"])
            == district_code
        ):
            return {
                "type": "FeatureCollection",
                "features": [feature]
            }

    raise HTTPException(
        status_code=404,
        detail="District geographic boundary not found"
    )

# Step 76: Map-to-Dashboard Integration

@app.get("/api/map/districts/{district_code}/dashboard")
def get_map_district_dashboard(district_code: str):

    # Retrieve geographic information
    geographic_data = get_district_geojson(district_code)

    # Retrieve socioeconomic intelligence
    intelligence_data = get_full_district_intelligence(district_code)

    return {
        "district_code": district_code,
        "geography": geographic_data,
        "intelligence": intelligence_data
    }