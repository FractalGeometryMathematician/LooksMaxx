---
title: MOG Lab
emoji: 🔬
colorFrom: green
colorTo: gray
sdk: static
app_file: index.html
pinned: false
---

# MOG LAB

A standalone, playful face geometry and grooming app. No Maypop account, API key, backend, or paid inference. Photo processing stays in the visitor's browser. The model, JavaScript and WebAssembly files are served from the same host.

## Running it

The app uses ES modules plus local model/WebAssembly files, so it **must be served over HTTP**. Double-clicking `index.html` (a `file://` URL) makes the browser block every script and nothing responds.

- **Windows:** double-click `start.bat` (needs Python), then use the browser tab it opens.
- **Mac/Linux:** run `./start.sh`.
- **GitHub Pages:** Settings → Pages → deploy from `main`, folder `/ (root)`. The root `index.html` redirects to `mog-lab-source/`.

## Included

- Dual frontal and 90-degree lateral photo inputs. Lateral photos support their own camera, clipboard/paste, native phone capture, clear and report export.
- Twelve editable manual lateral marks, undo/reset, visual head-reference line, surface jaw-outline angle, segment-length ratio, nose–chin-line lip gaps, and nose-base-to-chin reference angle. Combined mode blends six profile surface traits into the main rating with an editable contribution (default 35%). Profile completeness, self-confirmed view and surface-reference alignment are required.
- Detailed image-left/right canthal tilt, PFL/PFH, iris/pupil spacing and lower iris-to-lid outline-gap proxies. Unsupported eyelid/orbital diagnoses are not generated.
- Photo upload and drag/drop (JPG/PNG/WebP, 15 MB max), Ctrl+V / Cmd+V image paste, and a user-triggered Paste image button.
- Live phone/computer camera preview, capture, front/back camera switching, and a native phone-camera fallback. No microphone access; streams stop on capture/cancel/tab hide.
- Automatic broad hairstyle suggestion using a local hair segmentation model and outline rules, with manual correction.
- Imported measured-report pools for pool-only percentile comparison; at least five compatible reports are required. There is no default synthetic or global percentile.
- MediaPipe Face Landmarker with real face detection and multiple-face rejection.
- Default PSL-inspired guide mode, guide-tier vocabulary, a structure-priority preset, a documented heuristic conversion, optional within-pool normal scaling and retained raw target-fit mode.
- A comprehensive looksmaxxing-style aesthetic profile: 16 automatic frontal measurements plus optional hairline-calibrated facial thirds and a manually located mentolabial crease ratio.
- Angular/defined, balanced/harmonious, soft/rounded, and user-supplied male-coded ratio template presets, with user-editable weights and reference ratios. No sex or ethnicity is inferred to choose a preset.
- Five weighted categories, strongest matches, exact score deductions, and a full measurement/target table.
- Default Harsh scoring with continuous target-distance penalties and one-decimal scores; Original mode preserves broad forgiving bands.
- Editable score ceilings (negative tilt, midface ratio, jaw/cheek width) with triggers, binding cap and separate cap deduction; enabled by default.
- Optional-style slang game tiers on a 0–10 rating: Sub-five, LTN/MTN/HTN Normie, Chadlite, Chad, Gigachad. These tiers have no population calibration.
- Separate Softmaxxing presentation/routine table and sourced procedure-reference table (Le Fort I, BSSO, genioplasty), with no photo-based procedure mapping or body-fat target.
- Reports include comparison settings so users can match intensity, aesthetic, weights and available traits.
- A feature-map overlay plus an optional phi guide; phi no longer determines the overall score.
- Pose/expression checks with overall-score and percentile suppression for unreliable scans.
- Facial fullness readout describing visible outline, with retake handling for poor pose.
- Lighting-sensitive cheek contrast estimate, clearly distinguished from skin health.
- Explainable grooming/photo suggestions using detected or corrected hairstyle.
- Labeled synthetic demo, clear-photo control, and local JSON report download.
- Responsive layout and keyboard-accessible controls.

## Deploy to Hugging Face Spaces — easiest

1. Create a new Space at https://huggingface.co/new-space and choose **Static** as the SDK and **Public** visibility.
2. Upload **all files and folders in this bundle**, preserving `vendor/wasm/` and `models/`. `index.html` and this `README.md` must be at the repository root.
3. Save/commit. The README metadata above selects the static app. Visitors do not need an account to use a public Space.

Official instructions: https://huggingface.co/docs/hub/en/spaces-sdks-static

## Deploy to GitHub Pages

1. Create a public repository and add the entire bundle, preserving the folders.
2. Open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, branch **main**, folder **/ (root)**, then save.
3. Open the Pages URL GitHub shows after deployment. No build step or Actions setup is necessary.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Run locally

Use a current browser with WebAssembly support. Serve this directory over HTTP; opening `index.html` directly with `file://` does not support ES module/model loading reliably.

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000. The first photo scan loads the local face and hair models plus the WebAssembly runtime; subsequent scans in the same tab reuse the model. No images are sent to the server. The host may keep its normal HTTP access logs; the app adds no analytics or photo upload endpoint.

## What the numbers mean

`profile.js` defines the app-authored aesthetic presets, target bands and group weights. Default angular weights are harmony 20%, eyes 25%, jaw/cheekbones 25%, nose/lips 15%, and balance 15%. All three presets use the same measured traits with different target ranges; no gender, age or ethnicity is inferred to select a preset.

| Category | Measurements |
| --- | --- |
| Harmony | Face height/width, midface/lower-face ratio, eye spacing, upper-face fWHR proxy, optional full facial thirds |
| Eye area | Canthal tilt, eye width/aperture ratio, brow–eye gap |
| Jaw and cheekbones | Jaw/cheek width, chin/cheek width, cheek/temple width, lower-cheek/cheek contour taper |
| Nose and lips | Nose/eye width, mouth/nose width, lower/upper lip height, philtrum/lower-lip-to-chin ratio, optional philtrum/marked-crease-to-chin ratio |
| Balance | Left/right paired-landmark mismatch after head-roll and fitted-midline correction |

Original mode gives each feature a fit from 0–100: 100 inside its target band, otherwise `max(0, 100 * (1 - (distanceOutsideBand / tolerance)^2))`.

Harsh mode is the UI default and removes that flat perfect-score plateau. Its target is the midpoint of the original band; asymmetry and thirds spread instead target zero. The half-fit distance is `0.85 * halfBandWidth + 0.15 * tolerance` (using the band upper bound as width for the two zero-target traits). Fit is `100 * exp(-ln(2) * ((value - target) / halfFitDistance)^2)`. Thus a measurement at one half-fit distance receives 50, and a perfect target receives 100. Available features, group weights and pose checks are preserved. Harsh totals and category fits display one decimal. This increases discrimination near the earlier ceiling; it does not guarantee a larger gap between every pair or establish more accurate human beauty ratings. Compare only matching intensity, aesthetic, weights and available feature keys. Older reports are not directly comparable to Harsh results. Each category averages its available features; the overall averages categories using the selected weights. Missing features are omitted, never scored zero. Missing categories are omitted and weights renormalized. Setting all weights to zero withholds the total. `pointsLost` records each trait's exact weighted deduction before final rounding. The table shows values, target ranges, fit, and deductions.

The hairline is not supplied by MediaPipe. Users may mark its center after scanning; this adds the upper/middle/lower thirds. Incorrect marks remain unavailable. The default forehead landmark is identified as a landmark rather than presented as a true hairline. A front-facing photo does not establish true gonial angle, forward growth, bite alignment, or nose/chin/cheekbone projection; none is fabricated.

Photo checks flag turned faces, strong head roll, closed/squinted eyes, open mouth, small faces or cropped outlines. Overall score and percentile are withheld when flagged; the measured values remain provisional. These are heuristic checks, not calibrated confidence. The older three-metric `measure().score` remains only as a legacy geometry diagnostic; it is not the displayed score or benchmark.

The presets represent configurable aesthetic preferences and are not a human-rated attractiveness model or a single authoritative looksmaxxing standard. Hair detection and photo texture inform presentation tips, but are excluded from structural scoring because silhouette/contrast alone cannot establish haircut suitability or skin beauty. Texture is not skin health. Facial fullness is visible outline, not adipose tissue. No age, ethnicity, body-fat, health, personality, identity or dating-success inference.

Landmark-region reference: https://github.com/google-ai-edge/mediapipe/blob/master/mediapipe/python/solutions/face_mesh_connections.py

## Facial fullness

This readout describes visible outline, not fat tissue. A face-height/cheek-width ratio below 1.40 together with a jaw/cheek-width ratio of at least 0.80 is labeled `ROUNDER OUTLINE`. Height/width above 1.65 or jaw/cheek width below 0.72 is labeled `MORE TAPERED`; other readings are `MODERATE TAPER`. Poor-pose readings show `RETAKE NEEDED`. Thresholds are heuristic style categories, not validated fat estimates. This feature is excluded from the structural aesthetic score and included in the downloaded JSON report.

## Limits and verification

The source syntax, geometry invariance/range/error tests, mocked camera lifecycle/clipboard tests, hair outline tests, synthetic benchmark tests, comprehensive profile/availability/preset/weight/quality tests, harsh-mode target/dispersion/deduction/benchmark tests, lateral geometry/mirror/rule/override/iris-availability tests, combined contribution/completeness/gate and reference-pool validation/rescoring tests (48 total, including PSL tier, quantile, pool tie and ceiling tests), HTML references, model formats and WebAssembly files were checked. Real-photo inference, physical phone/webcam hardware, clipboard permissions and browser visual QA have **not** been verified in the build environment. Before a public launch, try clear portraits on desktop/mobile, a non-face image, a two-face image, and all upload/clear/export flows. Head pose, perspective, expression, occlusion and lighting can materially change readings. The pose warning is heuristic, not calibrated confidence.

## Edit the app

`index.html`: copy/layout. `styles.css`: colors and responsive design. `geometry.js`: raw landmark geometry and recommendations. `profile.js`: comprehensive traits, aesthetic presets, weights and quality checks. `eyes.js`: detailed eye/iris geometry. `lateral.js`: manual profile-surface math. `rules.js`: score ceilings and game-tier thresholds. `app.js`: upload, inference, overlay and report flows. `capture.js`: camera lifetime and pasted-image extraction. `hair.js`: hair-mask measurements and broad style rules. `psl.js`: guide tiers and documented heuristic/pool scale conversions. `combined.js`: profile criteria and combined score. `references.js`: numeric pool validation and same-settings ranking. `benchmark.js`: legacy synthetic diagnostic, not used by the app UI. No package installation needed.

MediaPipe assets are pinned to version 0.10.21 and model version 1. See `THIRD_PARTY.md`.

## Camera and clipboard

Use the public HTTPS app URL directly for reliable camera access. Browser permission is requested only after Use camera; camera/microphone permissions in an embedding page can block camera access. No microphone is requested. Camera frames stay local. On phones, Phone camera uses native capture. If the Clipboard Read API is unsupported/denied, regular Ctrl+V / Cmd+V image paste still works where the browser supports image clipboard data. Copy the image itself, not its URL.

## Measured reference pools

Import one or more JSON readouts, an array of readouts, or an object with `name`, `source`, and `records`. Reports must contain numeric `features` or exported `measurements`. At most 5,000 records and 10 MB total JSON are accepted. Duplicate numeric profiles, synthetic demos and reports with failed frontal photo checks are excluded. Reference reports need every currently scored frontal feature, and when combined scoring is active they need a complete confirmed aligned profile. Five compatible records are needed for a percentile. All references are rescored under the active preset, weights, intensity, target overrides, profile contribution and ceilings. Percentile uses the proportion below the current score plus half of ties. Scores use the same displayed precision on both sides. The pool's user-provided provenance is displayed; the app cannot verify that reports represent unique real people or a representative population. Do not describe this pool-only statistic as a global beauty percentile. Report labels, raw numerical references and photos remain in browser memory.

The retained `benchmark.js` module is used only by legacy diagnostic tests, not by the user-facing percentile. `reference-pool.example.json` documents the empty import container; no sample people are invented.

## Verify locally

```sh
node --test tests/*.test.mjs
```

## Multi-view and user targets

The lateral panel is a manual surface-photo annotation workflow. The app does not reconstruct 3D bone geometry, automatically identify porion/orbitale, certify Frankfort alignment, or evaluate maxillary development, orbital vector, true ramus length, or true gonial angle. Ear/under-eye references are visually chosen proxies; view orientation is self-confirmed. Without marks, metrics remain unavailable. Ratios/angles preserve image scaling, while normalized lip offsets avoid false millimeter precision. True clinical decisions require clinical assessment; no BSSO, Le Fort I, genioplasty, implants or target body-fat prescription is mapped from the score.

The additional user ratio template reflects the supplied requested values: midface/lower-face 0.91–1.00, brow-to-upper-lip fWHR proxy 1.80–2.00, jaw/cheek width 0.70–0.75, philtrum/marked-crease-to-chin 0.45–0.55. They are user references, not authoritative anatomical or sex/phenotype standards. `Edit reference ratios` changes the ranges for the active preset and is included in exports and benchmark calculations.

Upper eyelid exposure, dermatochalasis, orbital recession, hypotelorism, hypertelorism and tissue composition are not inferred. Per-eye iris/lid gaps are only visible-outline estimates and are not scored as clinical eye support.

## Score ceilings and game tiers

Default editable gates: average canthal tilt < −4 degrees caps at 62/100; midface/lower-face > 1.05 caps at 65/100; jaw/cheek width < 0.65 caps at 60/100. All triggered rules are shown, and the lowest ceiling controls the result if lower than the uncapped score. The rules never boost a lower score. Missing traits do not trigger a rule. Failed photo checks still withhold all ratings. Trait deductions explain the uncapped weighted fit; any cap deduction is listed separately.

Game rating is the final score / 10, rounded to one decimal. Tier boundaries: <5 Sub-five; 5–5.49 LTN; 5.5–5.99 MTN; 6–6.49 HTN; 6.5–7.49 Chadlite; 7.5–8.49 Chad; ≥8.5 Gigachad. This is a UI taxonomy, not a human beauty population scale. Matching score comparisons must use the same targets, intensity, weights, available traits and gates.

Photographic-method limitation reference: https://pmc.ncbi.nlm.nih.gov/articles/PMC8722827/
Iris landmark reference: https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/iris.md

## Combined scoring (v7)

Frontal-only mode remains available. Enable combined mode to calculate `(1 - profileWeight) × frontalScore + profileWeight × profileScore`, then apply all enabled ceiling rules. Profile score averages six continuously graded surface traits: jaw-outline angle, upper/lower outline length ratio, normalized upper and lower lip gaps, nose-base/chin angle and chin offset. Their targets are app-authored editable aesthetic choices, not clinical norms. The side-view confirmation is user-provided, not machine-certified. Incomplete, degenerate, unconfirmed or tilted-reference profiles suppress combined scores. Additional profile gates are editable and are inactive in frontal-only or 0% profile mode. Exported reports retain frontal score, profile values and fits, pre-ceiling combined score, all caps, view settings, source-pool provenance and raw frontal features. Lower-cheek taper is a new visible-contour criterion; it does not measure adipose tissue or prescribe weight loss.

The procedure-reference table describes the anatomical regions addressed by named procedures with a primary hospital source. It is educational, not an automatic recommendation based on geometric deficits. SNA/SNB and verified skeletal Frankfort alignment require information unavailable from these surface images. No internal anatomical or clinical measures are substituted with surface marks.

## PSL guide mode (v8)

Source: https://looksmaxxers.com/pages/psl-scale-explained-the-looksmaxxing-rating-system

The linked guide is descriptive and provides no numeric feature weights, scoring function, reference measurements or calibrated dataset. The app implements its tier vocabulary and its center-5, standard-deviation-1 normal-scale concept. The new default `psl` preset reuses the angular ratio targets with app-authored weights: harmony 25, eyes 25, jaw 35, nose/lips 10, balance 5. These remain surface geometry proxies; bone projection is not inferred. Hair, grooming, physique, personality and status stay outside the score.

Default heuristic rating is `1 + 0.08 × capped target fit`, rounded to one decimal and bounded to 1–9. A 50/100 fit becomes 5.0 by construction; this does not establish population-average attractiveness. Perfect selected-target fit becomes 9.0, and 10 is reserved as theoretical. This conversion is not supplied or validated by the source guide.

Optional pool mode recomputes every compatible reference under the current settings, then uses `p = (number below + 0.5 × ties + 0.5) / (n + 1)` and `rating = clamp(5 + inverseNormal(p), 1, 9)`. Five compatible measured reports are required; synthetic demo subjects are excluded. Ties receive the same rating. Smoothing avoids infinite extremes in small pools. This is a pool-relative target-fit normalization and does not establish a global or human-rated PSL calibration. Each triggered raw ceiling also maps to a PSL ceiling with `1 + 0.08 × cap`, preserving caps after pool scaling.

Tier intervals: below 3.5 Below LTN; 3.5–<4.5 LTN; 4.5–<5.5 MTN; 5.5–<6.5 HTN; 6.5–<7 HTN–Chadlite transition; 7–7.5 Chadlite; >7.5–<8 Chadlite–Chad transition; 8–<9 Chad; 9 Gigachad. Transition labels fill the source's unspecified gaps. Dehumanizing labels and clinical-condition classifications are omitted. The source gives conflicting rarity estimates in different sections; none are used as measured population percentiles.

The large rating, tier badge and JSON export identify the selected mode, formula and calibration basis. Underlying target fit remains visible. Raw target-fit mode retains the previous game-tier vocabulary for compatibility.
