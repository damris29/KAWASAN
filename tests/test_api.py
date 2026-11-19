
import unittest
import urllib.request
import urllib.error
import json

BASE_URL = "http://127.0.0.1:8000"


def get_api_response(endpoint):
    try:
        with urllib.request.urlopen(BASE_URL + endpoint, timeout=10) as response:
            return response.status, json.load(response)
    except urllib.error.HTTPError as error:
        return error.code, json.load(error)


class TestKawasanAPI(unittest.TestCase):

    def test_health_check(self):
        status, data = get_api_response("/health")

        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "healthy")

    def test_valid_district(self):
        status, data = get_api_response("/api/districts/1_2")

        self.assertEqual(status, 200)
        self.assertEqual(data["district_code"], "1_2")
        self.assertIn("krdi", data)
        self.assertIn("dimensions", data)

    def test_invalid_district(self):
        status, data = get_api_response("/api/districts/999_999")

        self.assertEqual(status, 404)
        self.assertEqual(data["detail"], "District not found")

    def test_invalid_dashboard(self):
        status, data = get_api_response(
            "/api/map/districts/999_999/dashboard"
        )

        self.assertEqual(status, 404)
        self.assertEqual(
            data["detail"],
            "District geographic boundary not found"
        )

    
    def test_benchmark_rank_position(self):
        status, data = get_api_response(
            "/api/districts/1_2/benchmark"
        )

        self.assertEqual(status, 200)

        income = data["benchmarks"]["income_median"]

        rank = income["rank"]
        total = income["out_of"]

        expected_position = round(
            100 * (total - rank) / (total - 1),
            2
        )

        self.assertAlmostEqual(
            income["rank_position"],
            expected_position,
            places=2
        )

    
    def test_development_gap_classification(self):
        status, data = get_api_response(
            "/api/districts/1_2/gaps"
        )

        self.assertEqual(status, 200)

        gaps = data["development_gaps"]
        summary = data["summary"]

        thresholds = {
            "relative_strengths": lambda x: x >= 75,
            "middle_range": lambda x: 25 <= x < 75,
            "potential_gaps": lambda x: x < 25,
        }

        total_indicators = 0

        for category, condition in thresholds.items():
            indicators = gaps[category]

            self.assertEqual(
                summary[category],
                len(indicators)
            )

            for indicator in indicators:
                position = indicator["rank_position"]

                self.assertTrue(
                    condition(position),
                    f"{indicator['indicator']} incorrectly "
                    f"classified as {category}"
                )

            total_indicators += len(indicators)

        self.assertEqual(total_indicators, 9)



    def test_infrastructure_gap_calculation(self):
        district_codes = ["1_2", "13_37"]

        for district_code in district_codes:
            with self.subTest(district=district_code):
                status, data = get_api_response(
                    f"/api/districts/{district_code}/infrastructure-gaps"
                )

                self.assertEqual(status, 200)

                infrastructure = data["infrastructure_access"]

                for indicator_name, indicator in infrastructure.items():
                    access = indicator["access_percent"]
                    shortfall = indicator["shortfall_percentage_points"]
                    classification = indicator["classification"]

                    expected_shortfall = round(100 - access, 2)

                    self.assertAlmostEqual(
                        shortfall,
                        expected_shortfall,
                        places=2,
                        msg=f"Incorrect shortfall for {indicator_name}"
                    )

                    if expected_shortfall <= 1:
                        expected_classification = "Near-universal access"
                    elif expected_shortfall <= 5:
                        expected_classification = "Minor gap"
                    elif expected_shortfall <= 15:
                        expected_classification = "Moderate gap"
                    else:
                        expected_classification = "Substantial shortfall"

                    self.assertEqual(
                        classification,
                        expected_classification,
                        f"Incorrect classification for {indicator_name}"
                    )

                substantial = [
                    name
                    for name, indicator in infrastructure.items()
                    if indicator["classification"] == "Substantial shortfall"
                ]

                self.assertEqual(
                    data["summary"]["substantial_gap_count"],
                    len(substantial)
                )

                self.assertEqual(
                    set(data["summary"]["substantial_gap_indicators"]),
                    set(substantial)
                )


    def test_dashboard_data_consistency(self):
        district_code = "1_2"

        status_krdi, krdi_data = get_api_response(
            f"/api/districts/{district_code}"
        )

        status_dashboard, dashboard_data = get_api_response(
            f"/api/map/districts/{district_code}/dashboard"
        )

        self.assertEqual(status_krdi, 200)
        self.assertEqual(status_dashboard, 200)

        self.assertEqual(
            dashboard_data["district_code"],
            district_code
        )

        self.assertEqual(
            dashboard_data["intelligence"]["krdi"]["score"],
            krdi_data["krdi"]["score"]
        )

        self.assertEqual(
            dashboard_data["intelligence"]["krdi"]["rank"],
            krdi_data["krdi"]["rank"]
        )


    def test_district_comparison_consistency(self):
        district_a = "1_2"
        district_b = "13_37"

        status_compare, comparison = get_api_response(
            f"/api/compare?district_a={district_a}&district_b={district_b}"
        )

        self.assertEqual(status_compare, 200)
        self.assertEqual(comparison["reference_year"], 2024)

        for label, district_code in [
            ("district_a", district_a),
            ("district_b", district_b)
        ]:
            with self.subTest(district=district_code):
                status, district = get_api_response(
                    f"/api/districts/{district_code}"
                )

                self.assertEqual(status, 200)
                self.assertEqual(
                    comparison[label]["code"],
                    district_code
                )

                self.assertEqual(
                    comparison[label]["krdi"]["score"],
                    district["krdi"]["score"]
                )

                self.assertEqual(
                    comparison[label]["krdi"]["rank"],
                    district["krdi"]["rank"]
                )

                self.assertEqual(
                    comparison[label]["krdi"]["stability"],
                    district["krdi"]["stability"]
                )


    def test_geojson_district_coverage(self):
        status, data = get_api_response("/api/map/geojson")

        self.assertEqual(status, 200)
        self.assertEqual(data["type"], "FeatureCollection")

        features = data["features"]

        self.assertEqual(len(features), 155)

        for feature in features:
            self.assertEqual(feature["type"], "Feature")
            self.assertIsNotNone(feature["geometry"])
            self.assertIn(
                feature["geometry"]["type"],
                ["Polygon", "MultiPolygon"]
            )


    def test_geographic_identifier_consistency(self):
        geo_status, geo_data = get_api_response(
            "/api/map/geojson"
        )

        district_status, district_data = get_api_response(
            "/api/districts"
        )

        self.assertEqual(geo_status, 200)
        self.assertEqual(district_status, 200)

        features = geo_data["features"]

        geo_codes = [
            feature["properties"]["code_state_district"]
            for feature in features
        ]

        # Every geographic identifier must be unique.
        self.assertEqual(
            len(geo_codes),
            len(set(geo_codes))
        )

        # Every feature must have a non-empty identifier.
        self.assertTrue(
            all(geo_codes)
        )

        # Confirm all expected geographic features exist.
        self.assertEqual(len(geo_codes), 155)

        # Check that known district identifiers are present.
        self.assertIn("1_2", geo_codes)
        self.assertIn("13_37", geo_codes)


    def test_full_geographic_analytical_matching(self):
        geo_status, geo_data = get_api_response(
            "/api/map/geojson"
        )

        district_status, district_data = get_api_response(
            "/api/districts"
        )

        self.assertEqual(geo_status, 200)
        self.assertEqual(district_status, 200)

        geo_codes = {
            feature["properties"]["code_state_district"]
            for feature in geo_data["features"]
        }

        analytical_codes = {
            district["code_state_district"]
            for district in district_data["districts"]
        }

        self.assertEqual(len(geo_codes), 155)
        self.assertEqual(len(analytical_codes), 155)

        self.assertEqual(
            geo_codes,
            analytical_codes,
            msg=(
                f"Missing geographic boundaries: "
                f"{analytical_codes - geo_codes}. "
                f"Extra geographic boundaries: "
                f"{geo_codes - analytical_codes}"
            )
        )


    def test_missing_data_handling(self):
        status, district_list = get_api_response(
            "/api/districts"
        )

        self.assertEqual(status, 200)

        district_codes = [
            district["code_state_district"]
            for district in district_list["districts"]
        ]

        self.assertEqual(len(district_codes), 155)

        for district_code in district_codes:
            with self.subTest(district=district_code):
                status, data = get_api_response(
                    f"/api/districts/{district_code}/full-intelligence"
                )

                self.assertEqual(status, 200)
                self.assertIsInstance(data, dict)

                # Ensure missing values are not serialized
                # as invalid JSON numbers.
                def check_values(value):
                    if isinstance(value, dict):
                        for item in value.values():
                            check_values(item)
                    elif isinstance(value, list):
                        for item in value:
                            check_values(item)
                    elif isinstance(value, float):
                        import math
                        self.assertTrue(math.isfinite(value))

                check_values(data)


    def test_krdi_score_and_ranking_validation(self):
        status, data = get_api_response("/api/districts")

        self.assertEqual(status, 200)
        self.assertEqual(data["total_districts"], 155)

        districts = data["districts"]
        self.assertEqual(len(districts), 155)

        district_codes = []

        for district in districts:
            code = district["code_state_district"]
            score = district["KRDI"]
            rank = district["KRDI_rank"]

            district_codes.append(code)

            with self.subTest(district=code):
                self.assertIsInstance(score, (int, float))
                self.assertGreaterEqual(score, 0)
                self.assertLessEqual(score, 100)

                self.assertIsInstance(rank, int)
                self.assertGreaterEqual(rank, 1)
                self.assertLessEqual(rank, 155)

        # District identifiers must be unique.
        self.assertEqual(
            len(district_codes),
            len(set(district_codes))
        )

        # Scores must be ordered from highest to lowest.
        scores = [district["KRDI"] for district in districts]

        self.assertEqual(
            scores,
            sorted(scores, reverse=True)
        )

        # A lower rank number must never have a lower score.
        for i in range(len(districts) - 1):
            current = districts[i]
            following = districts[i + 1]

            self.assertLessEqual(
                current["KRDI_rank"],
                following["KRDI_rank"]
            )

            self.assertGreaterEqual(
                current["KRDI"],
                following["KRDI"]
            )


    def test_full_dashboard_response(self):
        district_codes = ["1_2", "13_37"]

        for district_code in district_codes:
            with self.subTest(district=district_code):
                status, data = get_api_response(
                    f"/api/map/districts/{district_code}/dashboard"
                )

                self.assertEqual(status, 200)
                self.assertEqual(
                    data["district_code"],
                    district_code
                )

                # Geographic boundary validation
                geography = data["geography"]

                self.assertEqual(
                    geography["type"],
                    "FeatureCollection"
                )

                self.assertGreater(
                    len(geography["features"]),
                    0
                )

                self.assertEqual(
                    geography["features"][0]["properties"]["code_state_district"],
                    district_code
                )

                # District intelligence validation
                intelligence = data["intelligence"]

                self.assertEqual(
                    intelligence["district_code"],
                    district_code
                )

                required_sections = [
                    "krdi",
                    "dimensions",
                    "indicators",
                    "benchmarking",
                    "development_analysis",
                    "infrastructure_analysis",
                    "methodology_notes"
                ]

                for section in required_sections:
                    self.assertIn(section, intelligence)
                    self.assertIsInstance(
                        intelligence[section],
                        dict
                    )

                # KRDI structure
                self.assertIn("score", intelligence["krdi"])
                self.assertIn("rank", intelligence["krdi"])
                self.assertIn("stability", intelligence["krdi"])

                # Socioeconomic indicator categories
                required_categories = [
                    "economy",
                    "education",
                    "employment",
                    "infrastructure",
                    "demographics"
                ]

                for category in required_categories:
                    self.assertIn(
                        category,
                        intelligence["indicators"]
                    )


if __name__ == "__main__":
    unittest.main(verbosity=2)
