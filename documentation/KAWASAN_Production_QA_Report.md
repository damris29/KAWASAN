# KAWASAN Production QA Report

**Audit window** · 27–28 November 2026, Malaysia time  
**Release recommendation** · **READY WITH MINOR LIMITATIONS**

## 1. Executive Summary

All four production workspaces loaded and rendered real data. The 155 district scores and ranks matched the checked-in source, and the national map contained all 155 expected boundaries. No P0 or P1 defects were identified in the exercised release paths. The main submission limitations are keyboard access to individual map districts and limited on-page explanation of which states and federal territories are covered.

The audit was read-only against production. Changes in this checkout are limited to the report and QA evidence. No commit, push, deployment, or hosting configuration change was performed.

## 2. Production Infrastructure

| Check | Result |
| --- | --- |
| Vercel frontend and HTTPS | Valid TLS certificate. `/`, `/districts`, `/compare`, and `/gaps` returned HTTP 200. |
| Render backend and HTTPS | `/health` returned HTTP 200. All tested valid API requests returned HTTP 200. |
| CORS | The production Vercel origin received the matching allow-origin header on GET and OPTIONS. An unconfigured origin received no allow-origin header. |
| API errors | Invalid district, invalid boundary, and invalid comparison requests returned HTTP 404. |
| Direct links and refresh | All four browser routes loaded directly and after a full reload, with district/comparison query parameters retained. |
| Frontend configuration | The deployed browser called the HTTPS Render API. The public Render URL was present in the client bundle. |
| Public credential exposure | A passive scan of the 11 served JavaScript assets found zero matches for the seven checked credential patterns. Hosting account variables and Git history were outside the scan. |

The API matrix covers health, docs, national district listing, detail, intelligence, overview, benchmark, gaps, infrastructure gaps, full intelligence, comparison, map attributes, national and district GeoJSON, and map-to-dashboard integration. [Production frontend](https://kawasan-gamma.vercel.app/) · [Production API](https://kawasan-api.onrender.com/health) · [API evidence](qa/api-results.json) · [Bundle evidence](qa/bundle-results.json)

## 3. Test Environment

Windows 11, headless Microsoft Edge 158.0.4370.45 controlled through Chrome DevTools Protocol, Node.js 24.12.0, and Python 3.13.7. Production browser checks used CSS viewports of 1920 × 1080, 1366 × 768, 768 × 1024, and 390 × 844. Tablet and mobile sizing was emulated at device scale factor 1. Local regression checks used checkout `663001a` and the local FastAPI service. The deployed JavaScript filenames are recorded in the evidence.

## 4. Results by Workspace

| Workspace | Production browser result |
| --- | --- |
| National Overview | **Pass.** The count was 155, the mean displayed 66.92, and the extremes were Kuala Langat (#1, 97.79) and Bukit Mabong (#155, 23.92). All polygons rendered. Hover, map click-through, score-band legend, top/bottom bars, state bars, and histogram heights were checked against the API. State filtering, changing sort mode, clearing filters, and page 2 were exercised. The district-name search field was previously removed at the product owner's request, so search was excluded as a superseded requirement. |
| District Intelligence | **Pass.** Shareable URLs and the state/district dropdown flow were exercised. The browser displayed four representative profiles spanning Peninsular Malaysia, Sabah and Sarawak, including ranks 1, 75, 80 and 155. Each boundary rendered, and headline rank, score, stability and range matched the API. The radar chart for Bukit Mabong also matched its API profile. Bukit Mabong and Telang Usan each displayed 11 missing education values as N/A. Bukit Mabong's 28 indicator and nine benchmark rows were checked cell by cell. Rapid switching under simulated latency ended on the last selection. |
| Compare Districts | **Pass for observed records.** Johor Bahru versus Bukit Mabong displayed the expected 56.19-point score difference and 142-position rank difference. All nine comparison rows matched API values, including RM formatting, percentage-point differences, ties and direction. Swap updated the URL and content. An identical pair produced the expected guidance. The grouped bars and both radar series matched all six API dimension values, including zero. The Unified District Dataset had all nine comparison fields present for every row, so the UI fallback for a missing comparison value was reviewed in source only. |
| Development Gaps | **Pass.** Bukit Mabong displayed 1 strength, 4 middle-range indicators, 4 potential gaps and 2 substantial shortfalls. Chart geometry matched the API. Piped water access was 25% with a 75-point shortfall, sanitation was 100% with a zero-point shortfall, and electricity was 54.17% with a 45.83-point shortfall. The two substantial shortfalls appeared first in the investigation table. Suggestions described topics to investigate without asserting a cause. |

No JavaScript exceptions, console errors or unexpected HTTP error responses were recorded on ordinary runs. Three requests were cancelled during rapid switching. The deliberately blocked GeoJSON request produced the expected failure message while the rest of the Overview remained usable. Selecting Retry restored all 155 polygons. Initial harness issues with pagination text encoding, keyboard event dispatch and SVG zero-width bars were corrected and rerun successfully. [Browser evidence](qa/browser-results.json)

## 5. Data Accuracy and Analytical Integrity

- All 155 API scores, ranks and stability labels matched the KRDI CSV. GeoJSON identifiers matched the analytical district set one for one. Map score bands matched backend thresholds.
- Independent mean was **66.91793548**. The ten 10-point histogram bins held **0, 0, 2, 2, 8, 21, 57, 51, 12, 2** records, totalling 155. The 12 displayed state means matched independent calculations.
- Six API profiles were cross-checked against both the Unified District Dataset and the KRDI CSV. The sample checked indicator values, dimension scores, rank range, district medians, ranking direction, rank positions, gap classification and infrastructure severity. No discrepancies were found.
- Verified the documented threshold rules: rank positions at least 75 are strengths, 25 to below 75 are middle range, and below 25 are potential gaps. A shortfall is substantial above 15 percentage points. Benchmark medians are described as the middle value across districts with data.
- The methodology dialog identifies KRDI v0.1 as provisional, lists the three weights, and describes data sources and limitations. The tested charts use a common 0–100 scale for KRDI, dimension scores and rank position. Available data retain their source units, including RM, percentages and percentage points.

[API and CSV comparisons](qa/api-results.json) · [Backend methodology](KAWASAN_Backend_API_Documentation.md)

## 6. Performance and Reliability

Browser timings run from navigation to visible data. Map pages also waited for rendered polygons. Each viewport cell is one observation, so the differences include network and cache variability.

| Workspace | Desktop | Laptop | Tablet | Mobile |
| --- | ---: | ---: | ---: | ---: |
| National Overview | 2,066 ms | 2,099 ms | 1,689 ms | 1,574 ms |
| District Intelligence | 713 ms | 1,051 ms | 584 ms | 848 ms |
| Compare Districts | 578 ms | 652 ms | 809 ms | 643 ms |
| Development Gaps | 609 ms | 612 ms | 720 ms | 581 ms |

- With browser cache disabled, the Overview was ready by **1,452 ms**. The document response started at **17 ms**. GeoJSON completed at **1,244 ms**, leaving up to **208 ms** before the ready snapshot. That interval includes parsing, layer drawing and polling.
- Warm API requests measured three times each: health **56–139 ms**, listing **56–93 ms**, national GeoJSON **784–1,611 ms**, full intelligence **62–114 ms**, and comparison **87–200 ms**. Every endpoint's individual observation is in the API evidence. National GeoJSON was **792,504 bytes** uncompressed.
- Map-to-profile navigation took **186 ms** in one warm run. Rapid switching took **564 ms** with 400 ms simulated network latency.
- The Overview downloaded **285,791 encoded JavaScript bytes** across five assets, equivalent to **924,133 decoded bytes**. The 11 unique assets observed across all routes totalled **1,003,340 decoded bytes**.
- Standard page loads issued each distinct required endpoint once. A browser refresh starts a new session. Render service inactivity could not be established, so these timings are warm-service measurements. Lighthouse was unavailable in the audit environment.

[Browser timing and request evidence](qa/browser-results.json) · [API timing evidence](qa/api-results.json)


## 7. Accessibility Assessment

The page language is English. The workspace navigation, main landmark, and selector labels were present. Keyboard activation opened the methodology dialog. Escape closed it and returned focus to the help button. The rankings table provides keyboard-accessible district links. Two limitations remain on the Overview. The district polygons have no keyboard focus targets, and there is no explicit skip-to-content link. A screen-reader session, contrast audit and formal WCAG conformance review were outside this run.

## 8. Responsive Design

All four pages rendered at all four requested sizes. No page-wide horizontal overflow was measured. The longest captured page was District Intelligence at 390 pixels wide and 5,480 pixels high. The screenshots show the sections and stacked charts on narrow layouts. These were browser-emulated viewport measurements on Windows.

## 9. Full-Page Screenshots

| Viewport | Overview | District Intelligence | Compare Districts | Development Gaps |
| --- | --- | --- | --- | --- |
| Desktop | [Overview](qa/screenshots/desktop-overview.png) | [District](qa/screenshots/desktop-district-intelligence.png) | [Compare](qa/screenshots/desktop-compare-districts.png) | [Gaps](qa/screenshots/desktop-development-gaps.png) |
| Laptop | [Overview](qa/screenshots/laptop-overview.png) | [District](qa/screenshots/laptop-district-intelligence.png) | [Compare](qa/screenshots/laptop-compare-districts.png) | [Gaps](qa/screenshots/laptop-development-gaps.png) |
| Tablet | [Overview](qa/screenshots/tablet-overview.png) | [District](qa/screenshots/tablet-district-intelligence.png) | [Compare](qa/screenshots/tablet-compare-districts.png) | [Gaps](qa/screenshots/tablet-development-gaps.png) |
| Mobile | [Overview](qa/screenshots/mobile-overview.png) | [District](qa/screenshots/mobile-district-intelligence.png) | [Compare](qa/screenshots/mobile-compare-districts.png) | [Gaps](qa/screenshots/mobile-development-gaps.png) |

### Headed Playwright Run

On 28 November, the corrected suite ran against production in visible Chromium 159.0.8154.6 on the Windows desktop, with `headless: false`, `slowMo: 800`, and `workers: 1`. The viewport was 1366 × 768. The terminal displayed RUN and PASS/FAIL for each step. The four-workspace suite finished **4 passed in 53.8 seconds** with exit code 0. Durations include the deliberate 800 ms action delays and evidence capture. The four-size screenshot matrix above came from the earlier headless Edge pass.

The visible run covered state and score-band filters, ranking sort and pagination, chart hover, national and district map zoom and reset, district polygon click-through, district dropdowns, the shareable profile refresh, comparison swap and duplicate handling, and the investigation-table link back to a district. Browser error and unexpected failed-request checks passed for every workspace. An initial headed attempt was stopped after its exact-label locator did not match the dropdown; the corrected run below used the rendered controls.

| Workspace | Result | Screenshot | Video | Trace |
| --- | --- | --- | --- | --- |
| National Overview | Pass · 21.0 s | [Screenshot](qa/screenshots/headed-overview.png) | [Video](qa/headed-artifacts/production-National-Overview/video.webm) | [Trace](qa/headed-artifacts/production-National-Overview/trace.zip) |
| District Intelligence | Pass · 9.6 s | [Screenshot](qa/screenshots/headed-district-intelligence.png) | [Video](qa/headed-artifacts/production-District-Intelligence/video.webm) | [Trace](qa/headed-artifacts/production-District-Intelligence/trace.zip) |
| Compare Districts | Pass · 9.7 s | [Screenshot](qa/screenshots/headed-compare-districts.png) | [Video](qa/headed-artifacts/production-Compare-Districts/video.webm) | [Trace](qa/headed-artifacts/production-Compare-Districts/trace.zip) |
| Development Gaps | Pass · 9.6 s | [Screenshot](qa/screenshots/headed-development-gaps.png) | [Video](qa/headed-artifacts/production-Development-Gaps/video.webm) | [Trace](qa/headed-artifacts/production-Development-Gaps/trace.zip) |

[Terminal log](qa/headed-terminal.log) · [Machine-readable Playwright results](qa/headed-results.json)


## 10. Defects and Observations

### P2 · District polygons cannot be selected by keyboard

- **Reproduce** · Open the National Overview and use Tab and Enter to navigate the map without a pointer.
- **Expected** · A keyboard user can identify a district and open its profile from the map or through an explicitly linked map alternative.
- **Actual** · Zero of the 155 SVG district polygons accepted keyboard focus. The map works with a pointer. Rank table district links provide a separate keyboard route.
- **Evidence** · The browser recorded 155 interactive paths and zero focusable paths in the Overview accessibility checks. [Browser evidence](qa/browser-results.json)

### P2 · The Overview omits the geographic coverage of its national results

- **Reproduce** · Open the National Overview, count the categories in the state chart, then inspect the geography listed in the district API.
- **Expected** · Readers can see which regions contribute to the national summary and which areas are outside the dataset.
- **Actual** · The 155 records span 12 states. Perlis and all three federal territories have no records in this dataset. The Overview displays the district count and state averages without stating those exclusions.
- **Evidence** · The API state rollup has 12 categories, and the chart matches those 12 means. [API evidence](qa/api-results.json) · [Overview screenshot](qa/screenshots/desktop-overview.png)

### P3 · No explicit skip-to-content shortcut

- **Reproduce** · Open the Overview and start tabbing from the top of the document.
- **Expected** · A shortcut can move keyboard focus directly to dashboard content.
- **Actual** · No skip link is present. A main landmark is available for assistive technology that supports landmark navigation.
- **Evidence** · The Overview DOM check recorded `skipLink: false`. [Browser evidence](qa/browser-results.json)

### P3 · Missing search-result description metadata

- **Reproduce** · Inspect the deployed home page document head.
- **Expected** · The public entry page supplies a description identifying the dashboard and its 2024 district data.
- **Actual** · The page has a title and language attribute. The description meta tag is absent.
- **Evidence** · The production browser recorded `metaDescription: null`. [Browser evidence](qa/browser-results.json)

## 11. Recommended Fixes

1. Add an explicitly keyboard-operable district lookup or link the map to the ranking table. If adding keyboard navigation within the map, avoid 155 sequential Tab stops.
2. Add a short geographic coverage note to the Overview and clarify that its national statistics describe the districts present in the dataset.
3. Add a visible-on-focus skip link and a concise home page meta description.

## 12. Regression Checks and Remaining Limitations

| Check | Result |
| --- | --- |
| Frontend ESLint | Passed |
| Frontend production build | Passed |
| Existing local FastAPI tests | 15 passed |
| Production CDP browser smoke | Passed after correcting harness selectors and expected strings |
| Production headed Playwright smoke | All four workspaces passed in 53.8 seconds with one worker |
| Controlled Render cold start | Unverified. The service was active during sampling. |
| Lighthouse | Unavailable in the audit environment. No scores are claimed. |
| Missing-value comparison in production | Unverified through the UI. Source fallback was reviewed. |
| Cross-browser, physical mobile and screen reader checks | Outside the audit environment. |
| Hosting account settings and secrets | The audit verified external behaviour and scanned served assets. Account-level values were unavailable. |

The audit sampled representative districts and compared all 155 baseline scores and ranks with the source. It did not validate every indicator in every district or exercise every filter combination.

## 13. Final Submission Readiness

**READY WITH MINOR LIMITATIONS.** The core dashboard journeys work and the checked results match the API and source data. Communicate the geographic coverage when presenting national statistics. The map keyboard limitation and other observations are documented above.


## 14. Release Refinement Verification · 28 November 2026

The four findings above describe the deployed baseline measured during the audit. The checkout now contains all four fixes, verified locally. Production evidence remains a record of the baseline.

| Finding | Resolution | Local verification |
| --- | --- | --- |
| P2 · Geographic coverage | The Overview states that national statistics and rankings represent 155 eligible districts in 12 states. The methodology dialog names Perlis, Kuala Lumpur, Putrajaya, and Labuan, explains the 2024 reference-year and indicator coverage limitations, and describes potential inclusion in future versions if suitable data become available. | Verified the Overview and dialog wording in Chromium. The reporting year, provisional status and geographic coverage caveat agree with the backend methodology documentation. The explanation for the four exclusions follows the data analytics team's clarification. |
| P2 · Keyboard access to map districts | A link in the national map card moves focus to the district rankings, where users can filter districts and open profiles with the keyboard. | Activated the link with Enter, tabbed to the table controls, and opened a district profile using the keyboard. All 155 polygons rendered and the change added no polygon Tab stops. |
| P3 · Skip to content | A first-in-order skip link is visible on focus and moves focus to the main dashboard content. | Verified Tab and Enter behaviour on all four routes, including direct URLs with district parameters. |
| P3 · Description metadata | The HTML entry page now has a description of KAWASAN's coverage and data year. | The description and existing page title were verified on all four routes. |

Frontend lint and the production build passed. All 15 existing backend tests passed. Local Chromium loaded populated tables on all four workspaces and recorded no page exceptions. The Overview passed the 390 px width check. Backend code, datasets, and scoring rules were untouched.

**Release status** · The changes are ready for release handoff. A production smoke test is still pending after an authorized deployment. The map uses the ranking table as its keyboard alternative. The earlier cold-start, Lighthouse, and screen-reader audit limitations still apply. No commit, push, or deployment was performed.

