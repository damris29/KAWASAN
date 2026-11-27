export const dimensions = [
  ["economic_wellbeing", "Economic Wellbeing", 50],
  ["economic_equality", "Economic Equality", 20],
  ["infrastructure", "Infrastructure", 30],
];

const indicators = {
  income_mean: ["Mean household income", "currency"],
  income_median: ["Median household income", "currency", "higher"],
  expenditure_mean: ["Mean household expenditure", "currency"],
  gini: ["Gini coefficient", "gini", "lower"],
  poverty_absolute: ["Absolute poverty", "percent", "lower"],
  poverty_relative: ["Relative poverty", "percent", "lower"],
  enrolment_primary: ["Primary enrolment"],
  enrolment_secondary: ["Secondary enrolment"],
  enrolment_post_secondary: ["Post-secondary enrolment"],
  completion_primary: ["Primary completion", "percent"],
  completion_secondary_lower: ["Lower secondary completion", "percent"],
  completion_secondary_upper: ["Upper secondary completion", "percent"],
  schools_primary: ["Primary schools"],
  schools_secondary: ["Secondary schools"],
  schools_tertiary: ["Tertiary institutions"],
  teachers_primary: ["Primary teachers"],
  teachers_secondary: ["Secondary teachers"],
  lf: ["Labour force", "thousands"],
  lf_employed: ["Employed population", "thousands"],
  lf_unemployed: ["Unemployed population", "thousands"],
  lf_outside: ["Population outside the labour force", "thousands"],
  p_rate: ["Labour force participation rate", "percent", "higher"],
  u_rate: ["Unemployment rate", "percent", "lower"],
  ep_ratio: ["Employment-to-population ratio", "percent"],
  piped_water: ["Piped water access", "percent", "higher"],
  sanitation: ["Sanitation access", "percent", "higher"],
  electricity: ["Electricity access", "percent", "higher"],
  population: ["Population", "thousands"],
};

export const indicatorLabel = (key) => indicators[key]?.[0] ?? key;
export const indicatorDirection = (key) => indicators[key]?.[2];
export const valid = Number.isFinite;
const formatter = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 2 });
const giniFormatter = new Intl.NumberFormat("en-MY", { maximumFractionDigits: 3 });
export const number = (value) => valid(value) ? formatter.format(value) : "N/A";

export function indicatorValue(key, value, difference = false) {
  if (!valid(value)) return "N/A";
  const sign = difference && value > 0 ? "+" : "";
  const formatted = number(value);
  switch (indicators[key]?.[1]) {
    case "percent": return sign + formatted + (difference ? " pp" : "%");
    case "currency": return sign + "RM " + formatted;
    case "gini": return sign + giniFormatter.format(value);
    case "thousands": return formatted + " thousand";
    default: return sign + formatted;
  }
}

export const bands = [
  { label: "High", range: "80–100", min: 80, color: "#125552" },
  { label: "Moderate", range: "60–<80", min: 60, color: "#328a83" },
  { label: "Low", range: "40–<60", min: 40, color: "#86c2b6" },
  { label: "Very low", range: "0–<40", min: 0, color: "#d8eee4" },
];
export const noBand = { label: "N/A", range: "Missing score", color: "#b7c0cc" };
export const bandFor = (score) => valid(score) ? bands.find(({ min }) => score >= min) ?? noBand : noBand;

export function placeName(value) {
  return typeof value === "string" ? value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase()) : "N/A";
}

export function normalizeDistrict(record) {
  return {
    code: String(record.code_state_district),
    name: placeName(record.district_clean),
    state: placeName(record.state_clean),
    score: record.KRDI,
    rank: record.KRDI_rank,
    stability: record.rank_stability,
    category: valid(record.KRDI) ? record.krdi_category ?? bandFor(record.KRDI).label : noBand.label,
  };
}

export const districtLink = (code, route = "/districts") => route + "?district=" + encodeURIComponent(code);
export const detailPath = (code, suffix = "") => "/api/districts/" + encodeURIComponent(code) + suffix;
export const geoPath = (code) => "/api/map/geojson/" + encodeURIComponent(code);
export const statesFor = (districts) => [...new Set(districts.map((district) => district.state))].sort();
export const comparisonColors = ["#0f766e", "#a4540b"];
