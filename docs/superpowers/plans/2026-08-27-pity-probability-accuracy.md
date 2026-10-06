# Pity Probability Accuracy — Detailed Sprint Plan (Algorithm-First, Optimized)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Every task uses checkbox (`- [ ]`) syntax and is self-contained so a fresh subagent can execute it with zero prior context.

**Goal:** Overhaul the entire pull-probability algorithm in `lib/math/pity-engine.ts` so the computed chance of getting the target draw is algebraically exact, numerically robust, optimized for rapid interactive recompute, and converges with cited/empirical ground truth, with a CI-enforced oracle so accuracy can never silently regress.

**Key constraint — NO MACHINE LEARNING.** All accuracy methods are deterministic/algorithmic: exact discrete convolution of empirical per-pull rate tables, a (corrected) Monte Carlo cross-check that consumes the same rate model, direct/least-squares rate tables on cited data. No trained models. Hard requirement.

**No database.** Client-only; presets + fixtures are static TypeScript (`lib/config/presets.ts`, `lib/math/ground-truth.fixtures.ts`), per decision 1.

**No premature optimization / YAGNI.** Optimizations in S1.7 are justified (interactive slider recompute) but kept minimal; the engine is already sub-ms at N≤~660. Web Worker is future-only.

**Product context (prof's forum request).** A forum/discussion feature is expected (prof's requirement). Out of scope here; engine outputs are serializable so a future forum can post/compare calculations. Request a separate plan for the forum.

**Tech Stack:** TypeScript, Vitest. No new runtime deps (decision 7). Playwright for frontend smoke (`notes/testing/playwright-setup.md`).

**Spec:** This document. Cross-refs: `notes/architecture/design-review.md` (smell #1), `notes/architecture/key-decisions.md` (decision 1 no backend, 2 piecewise, 6 winRate honesty, 8 monte-carlo deleted, 9 PHP budget), `notes/architecture/probability-accuracy.md`.

**Skills applied:** algorithm sprints → `codebase-design`, `karpathy-guidelines`, `typescript-expert`, `vitest-testing`, `code-review`/`caveman-review`/`requesting-code-review`. Frontend (S6–S8) → `ui-ux-pro-max`, `web-design-guidelines`, `high-end-visual-design`, `anti-ui-slop`, `frontend-design`, Playwright. Notes → `obsidian-markdown`.

---

## Part 1 — Architecture, Algorithm Choice, Optimization & Bottlenecks

### Best algorithm (DECIDED)
- **Primary computation — exact discrete convolution of empirical per-pull rate tables `r_k`.** First-5-star arrival PDF via survivor loops (`f0[k]=S0*r_k`, `S0*=(1-r_k)`), then the featured distribution by the 50/50-then-guarantee convolution. **Exact**, O(N²) (sub-ms for N≤~2000; all presets N≤~660), unit-testable against closed forms (pure geometric ⇒ EV=75 for p=0.02/winRate 0.5). No parametric assumption — `r_k` comes straight from fixtures.
- **Generalized multi-featured model (corrected).** For a banner with `M` rate-up units, the 50/50 decides rate-up vs standard (P(rateup)=`rateUpProb`), then the specific unit is chosen among `M`. Target probability **depends on which 5-star**: `pFirst = rateUpProb * (1/M)` on the first 5-star; after a loss the second 5-star is a *guaranteed rate-up* (not guaranteed target) with `pGuar = 1/M`. So `pdf[n] = pFirst*f1[n] + (1 - rateUpProb) * pGuar * Σ f1[i]*f0[n-i]`. For M=1 this reduces to the classic `winRate*f1 + (1-winRate)*Σf1*f0`. (Systems with a *second* 50/50 among rate-ups need a 3-five-star chain — see A14; model via a small Markov chain if required, else document as a known limitation.)
- **Guarantee / currency systems — separate `GuaranteeCost` output, NOT a PDF.** Blue Archive spark, FGO story-bond, NIKKE mileage, Epic Seven/SLA selection are **deterministic counters, not per-pull Bernoulli**. Emit pulls-to-guarantee / EV-cost via `GuaranteeCost`; for these, set `modelKind:'counter'` and **suppress the probabilistic `curve`** (show only `GuaranteeCost` or relabel the curve as "chance of any 5-star, not the target").
- **Cross-check oracle ONLY — corrected Monte Carlo.** A Monte Carlo that consumes the *same* rate-model, run in CI as an independent Bernoulli simulation (N≥1e6, pointwise tolerance ≥5×stderr ≈0.015), asserted within tolerance. Catches coding bugs, NOT model error; never rendered to users. Labeled "code-correctness only" in CI logs.
- **Rejected:** FFT (slower + less exact at N≤660), generating functions (no gain, more risk), ML (project rule), MC-as-the-answer.

### Optimization (S1.7, justified + bounded)
- **Precompute per-`PityCurve` `f0` + cumulative survival `S0` once** (module memo keyed by rate-table fingerprint + `modelVersion`). Derive `f1[i] = f0[i+offset] / S0[offset-1]` (the survival prefactor is mandatory — a bare shift is **wrong**, see A8).
- **Memoize `calculatePity`** by full input signature **excluding `pullsInput`** (pullsInput only affects `currentP`, an O(1) `curve[pullsInput]` lookup). Cache key includes rate-table fingerprint, `pityOffset`, `guaranteeType`, `has50/50`, `resetsCounterOnGuarantee`, `modelVersion`.
- **`Float64Array`** allocated fixed-length (`new Float64Array(maxTotalPulls+1)`, assign by index, `.fill(1, len)` for padding) — TypedArrays have no `.push`. Return **defensive copies** (never the cached buffer; callers must not mutate).
- **Perf guard:** median of ≥20 cold-cache runs, assert `p95 < 5ms` for all 10 presets. Web Worker is future-only (fail CI if any preset N exceeds the sub-ms threshold).

### Where probability is computed
- `lib/math/pity-engine.ts` — `calculatePity(input): CalculationResult`. Pure, zero React/Next.
- `lib/math/pity-engine.ts:14` — `getRate(k, baseRate, softPityStart?, rampRate?, hardPity?)` — per-pull 5-star rate. **Private, not exported.**
- `lib/config/presets.ts:14` — `PityCurve` (`baseRate`, `softPityStart`, `hardPity`, `rampRate`, `winRate`). **Add** `has50/50?`, `resetsCounterOnGuarantee?`, `modelKind?: 'bernoulli'|'counter'`, `guaranteeType?`, `modelVersion`.
- `lib/config/resolve-win-rate.ts` — `resolveWinRate(preset, targetItemName, featuredCount)` → `{ pFirst, pGuar, rateUpProb }`.
- `hooks/usePityCalculation.ts` — glue + memoization; edit when `PityEngineInput` changes.

### How the math works (verified exact GIVEN correct r_k)
1. `getRate(k,...)`: `k>=hardPity`→1; `softPityStart<=k<hardPity`→`min(1, baseRate+(k-softPityStart+1)*rampRate)`; else `baseRate`.
2. `S0[0]=1`; `S0[k]=S0[k-1]*(1-r_k)`; `f0[k]=S0[k-1]*r_k`. From offset: `f1[i]=f0[i+offset]/S0[offset-1]`.
3. Featured PDF (generalized, see Best algorithm): `pdf[n]=pFirst*f1[n]+(1-rateUpProb)*pGuar*Σ f1[i]*f0[n-i]`.
4. `pdf` normalized so `Σpdf=1`; `curve` = CDF of normalized `pdf`; `EV=Σ i*pdf[i]`; thresholds from normalized `curve`; `currentP=curve[pullsInput]` (pullsInput = pulls-from-now).

### Bugs & bottlenecks found across 8 verification/red-team passes (must fix)
- **A1 (exactness).** `pity-engine.ts:71` `if (guarantee || baseRate === 1 || winRate === 1)` wrongly folds `baseRate===1` into "always win featured." Fix S1.1 (also rewrite the existing `pity-engine.test.ts` row 2 that asserts the buggy behavior).
- **A2 (numerical).** `cumulative > 0.9999999999 ? 1` clamp + early `break` truncates tail; mass can be <1 and padding masks it cosmetically. Fix S1.2: break at `cumulative >= 1 - 1e-12`, **normalize `pdf` first, derive `curve`/`EV` from it**, assert `1-totalMass < 1e-9` (use `toBeLessThanOrEqual`), guard `totalMass<=0` (return zeros + `Infinity` thresholds).
- **A3 (mis-flagged 50/50).** `winRate===1` treated as "no 50/50," but `resolveWinRate` can return 1 from `item.rate/baseRate`. Fix S1.4: gate `===1` short-circuit on `has50/50===false` preset flag.
- **A4 (compound multi-featured).** `winRate=item.rate/baseRate` drops the 50/50 for M rate-ups; guarantee branch also assumed guaranteed=target. Fix S4.3 with the generalized formula + closed-form test (M=2 ⇒ half).
- **A5 (counter-reset assumption).** Second 5-star after loss assumed reset to 0 (HoYoverse only). Fix S1.4: `resetsCounterOnGuarantee` flag.
- **A6 (currentP contract).** `currentP=curve[pullsInput]` correct only if `pullsInput` is from-now while `pityOffset` is starting pity. Fix S1.5: document + test; convert in hook; serialize `Infinity` thresholds as sentinel `-1` for share links.
- **A7 (spark/mileage not Bernoulli).** Distinct `GuaranteeCost` output + `modelKind:'counter'` to suppress the probabilistic curve. Fix S5.
- **A8 (optimization math bug).** `f1[i]=f0[i+offset]` bare shift drops survival prefactor `1/S0[offset-1]`, overstating f1. Fix S1.7: divide by `S0[offset-1]`.
- **A9 (Float64Array).** TypedArrays have no `.push`; aliasing if cached buffer is returned/mutated. Fix S1.7: fixed-length alloc + index assign + defensive copies/freeze.
- **A10 (divide-by-zero).** `baseRate=0` ⇒ `totalMass=0` ⇒ `NaN` after normalization. Fix S1.2 guard.
- **A11 (thresholds).** Compute p50/p80/p95 from the **normalized** curve, not un-normalized `finalP`. Fix S1.2.
- **A12 (non-converging pad).** Only pad `curve` to 1 when mass actually converged; else leave last real value (caller shows "≥"). Fix S1.2.
- **A13 (pure-counter curve).** Showing a probabilistic `curve` for spark/mileage is misleading. Fix S5/S6: `modelKind:'counter'` hides/suppresses it.
- **A14 (75/25 & M>1 chains).** A 75/25 or M-rate-up banner may need ≥3 five-stars (guaranteed rate-up, then another 1/M). The 2-state cap biases P(target) high for M>1. Fix S4.3 generalized formula; document residual limitation for true 3-state chains.
- **A15 (FGO model).** FGO "story-bond" is not a true guarantee (cannot guarantee a servant). Resolve the exact FGO model before S5b; do not assume selection.
- **A16 (SLA dual).** SLA is 50/50 + selection; specify combined display (curve + `GuaranteeCost`).

### Confidence / honesty note
Ground truth is *estimated* (community datamines with sampling error; official patch notes). Fixtures are **approximate**; tolerances **≥ published uncertainty**; **≥2 sources** where available; report confidence, never false-exact. Fixture oracle (not MC) is the accuracy authority.

---

## Part 2 — Sprint Plan (8 sprints; S1 algorithm-first + optimized; S6–S8 frontend; no DB; ML-free)

### Sprint 1 — Algorithm foundations (PRIORITY, no fixtures needed)
**Goal:** Make the engine algebraically exact, numerically robust, optimized, and confirm the best algorithm. No research required.
**Skills:** karpathy-guidelines, typescript-expert, vitest-testing, codebase-design.

- **Task 1.1: Fix `baseRate===1` exactness bug (A1)** — `lib/math/pity-engine.ts:71`: remove `baseRate === 1`. **Also rewrite `pity-engine.test.ts` row 2** (currently asserts the buggy `curve[1]=1, p50=1`). Test: `baseRate:1, winRate:0.5` ⇒ `expectedValue≈1.5`, `p50≈2`. Run `npx vitest run lib/math/pity-engine.test.ts`.
- **Task 1.2: Numerical hardening (A2,A10,A11,A12)** — replace `S0*=(1-r)` with log-survival; break CDF at `cumulative >= 1 - 1e-12`; **normalize `pdf` first**, derive `curve`/`EV` from normalized `pdf`; compute thresholds from normalized `curve`; guard `totalMass<=0` (return zeros + `Infinity` thresholds); pad `curve` to 1 only when mass converged. Add CI assertion `expect(1 - totalMass).toBeLessThanOrEqual(1e-9)` for every preset. Run `npx vitest run`.
- **Task 1.3: Confirm best algorithm + MC cross-check oracle** — document algorithm in `notes/architecture/probability-accuracy.md`; implement corrected Monte Carlo as **independent Bernoulli simulation** (N≥1e6, pointwise tol ≥0.015), CI-only, labeled "code-correctness only"; never exposed. Run `npx vitest run`.
- **Task 1.4: Generalize winRate + preset flags (A3,A5)** — `PityCurve` gains `has50/50`, `resetsCounterOnGuarantee`, `modelKind`, `guaranteeType`, `modelVersion`; `resolveWinRate` returns `{pFirst,pGuar,rateUpProb}` from `featuredCount`; gate `winRate===1` short-circuit on `has50/50===false`; use `resetsCounterOnGuarantee` for `f0` offset. Set HoYoverse/WuWa flags `true`; flat-rate ⇒ `has50/50:false, modelKind:'counter'`. Test: FGO `winRate`=1 does NOT report guaranteed.
- **Task 1.5: Define `currentP` contract + serialization (A6)** — document `pullsInput`=from-now; convert in hook if needed; serialize `Infinity` thresholds as `-1` for share links; test both.
- **Task 1.6: Extract `rate-model.ts` seam (no behavior change)** — create `lib/math/rate-model.ts` (`getRate` verbatim); `pity-engine.ts` delegates; delete inline. Assert existing tests green. **Sequence 1.6 BEFORE 1.7; keep MC oracle (1.3) running continuously through 1.7.**
- **Task 1.7: Optimize (A8,A9) + perf guard** — precompute `f0`+`S0` per `PityCurve` (memo keyed by rate-table fingerprint + `modelVersion`); derive `f1[i]=f0[i+offset]/S0[offset-1]`; `Float64Array` fixed-length + index assign + `.fill(1,len)`; memoize `calculatePity` by full signature **excluding `pullsInput`**; **return defensive copies** (never cached buffer); add per-preset invariant tests (`genshin.resetsCounterOnGuarantee===true`, `NIKKE.has50/50===false`, flag matches `guaranteeType`); perf test = median of ≥20 cold-cache runs, `p95 < 5ms`. Run `npx vitest run`.

**Owner:** `core-logic`. **DoD:** engine exact + robust (mass≈1, cached==non-cached 1e-12), best algorithm confirmed + MC oracle green, flags + generalized winRate in place, optimized, all existing + new tests pass.

### Sprint 2 — Ground-truth fixtures + accuracy oracle
**Goal:** Cited per-game rate tables + CI-enforced oracle + source gate.
**Skills:** vitest-testing, typescript-expert, karpathy-guidelines, obsidian-markdown.

- **Task 2.1: Build fixtures (research)** — `lib/math/ground-truth.fixtures.ts`: per ramping preset `realPerPullRate[k]={value,uncertainty}` from ≥2 cited datamines; per guarantee preset `guarantee={type,rule,documentedEv,sourceUrl[],lastVerified}`. **CI assertion: every entry has non-empty `sourceUrl[]` + `lastVerified` (source-existence gate).**
- **Task 2.2: Accuracy oracle (hard assertions)** — `pity-engine.accuracy.test.ts`: Test A per-pull rate within `uncertainty`; Test B `curve` vs cited featured-CDF (pointwise max abs CDF diff). Write `accuracy-baseline.json`. **Add a compare-and-fail test: current max-dev must not exceed baseline + drift threshold (no-op guard).**
- **Task 2.3: Fixture sanity suite** — assert rate monotonic in soft-pity window, `rate[hardPity]===1`, `uncertainty>0`, no empty/padded fixture.
- **Task 2.4: Capture baseline** — record per-preset max deviation + threshold pull-shift. **Re-run S1.3 MC oracle after fixtures land (S2 fixtures may correct S1's synthetic params).**

**Owner:** `analysis` + `core-logic`. Research = critical path (flag slip).
**DoD:** oracle runs all 10 presets asserting within stated uncertainty; source gate + sanity suite green; baseline committed + compared.

### Sprint 3 — Per-game rate tables + soft-pity shape + convention
**Goal:** Feed fixtures into `rate-model` as direct per-game tables; fix Endfield; pin off-by-one.
**Skills:** typescript-expert, vitest-testing, karpathy-guidelines.

- **Task 3.1: Failing tests** — per-pull rates for **genshin, hsr, zzz, wuwa, arknights_endfield, sla** within fixture `uncertainty`, every soft-pity pull.
- **Task 3.2: Per-game tables** — `rate-model.ts`: direct cited per-pull table per game (no shared global exponential); WuWa own datamine; **fix Endfield** (`softPityStart` w/o `rampRate` ⇒ fill from fixture). Run accuracy tests. **Add test: mutating a preset's `rampRate` changes output within 1e-12 (cache invalidation).**
- **Task 3.3: Pin off-by-one (B4)** — unit tests at `k=softPityStart`, `k=hardPity-1`, `k=hardPity`; post-loss counter reset per `resetsCounterOnGuarantee`.
- **Task 3.4: Update existing bounds** — re-derive `pity-engine.test.ts:67-72,127-128` from fixture; update same PR.

**Owner:** `core-logic`. **DoD:** all six ramping presets within stated uncertainty; `pity-engine.test.ts` green; Endfield soft pity active; cache-invalidation test green.

### Sprint 4 — 50/50 featured + compound `resolveWinRate` + versioning
**Goal:** Validate featured probability with the generalized multi-featured model; add versioning + tamper guard.
**Skills:** typescript-expert, vitest-testing, karpathy-guidelines.

- **Task 4.1: Featured CDF tests** — cited "P(character within N pulls)" ⇒ assert `curve` within stated uncertainty (pointwise max abs CDF diff).
- **Task 4.2: Re-anchor params** — `presets.ts` from fixture sources; keep `PityCurve` shape.
- **Task 4.3: Generalized `resolveWinRate` (A4,A14)** — return `{pFirst: rateUpProb*(1/M), pGuar: 1/M, rateUpProb}`; engine uses `pdf[n]=pFirst*f1[n]+(1-rateUpProb)*pGuar*Σ f1[i]*f0[n-i]`. **Closed-form test: 2 rate-ups ⇒ P(target) is half the single-rate-up value.** Document residual limitation for true ≥3-state chains. Update `resolve-win-rate.test.ts`.
- **Task 4.4: Version + tamper guard** — `modelVersion` in `PityCurve`; test `winRate<=1`, `hardPity` bounded, and `Σ featured.rate ≈ rateUpProb*baseRate` (catches wrong rate-up data). Include `modelVersion` in the S1.7 memo key.

**Owner:** `core-logic`. **DoD:** HoYoverse+WuWa featured CDF within stated uncertainty; generalized formula tested (M=2 ⇒ half); tamper-guard + rate-up-sum test present.

### Sprint 5 — Guarantee mechanics (all 5) + `GuaranteeCost` + CI hardening
**Goal:** Model BA spark, NIKKE mileage, FGO story-bond, Epic Seven, SLA correctly via distinct output; harden CI. Structured internally as 5a/5b but ONE sprint (keeps total at 8 with frontend 6–8).
**Skills:** codebase-design, typescript-expert, vitest-testing, karpathy-guidelines, obsidian-markdown.

- **Task 5a (BA spark + NIKKE mileage, low risk):** add `GuaranteeCost` to `CalculationResult` (`types/pity.ts`): `{ pullsToGuarantee, evCost, currencyNote }`. Deterministic counter models; assert documented pulls-to-guarantee/EV. Set `modelKind:'counter'`; **suppress probabilistic `curve` for these** (S6 renders `GuaranteeCost` only).
- **Task 5b (FGO story-bond + Epic Seven + SLA, may need structural change):** resolve FGO model first (A15 — not a true guarantee); SLA combined display (A16: curve + `GuaranteeCost`). Distinct counter/coupon logic; assert `evCost` equals documented (never read `expectedValue`). If a game needs structural change beyond `guaranteeType`, defer with noted follow-up.
- **Task 5.4: CI hardening** — tighten `pity-engine.accuracy.test.ts` to hard-fail on exceedance; staleness guard (fixture `lastVerified` older than one game-version ⇒ fail). **Add Web Worker guard: fail CI if any preset `hardPity`/`maxTotalPulls` exceeds the sub-ms threshold.**
- **Task 5.5: Docs** — mark `notes/architecture/design-review.md` smell #1 resolved; update `notes/architecture/probability-accuracy.md`; update `notes/index.md`.

**Owner:** `core-logic` + `architecture`. **DoD (per sub-task):** 5a — BA+NIKKE correct via `GuaranteeCost`, curve suppressed; 5b — FGO/E7/SLA resolved + tested; CI hardening + Worker guard green; docs updated. (Largest sprint; if structurally blocked, defer the blocking game with follow-up.)

### Sprint 6 — Frontend: accuracy display & data provenance
**Goal:** Show improved accuracy honestly — uncertainty, source/version badges, versioned share links; respect `modelKind`.
**Skills:** ui-ux-pro-max, web-design-guidelines, high-end-visual-design, anti-ui-slop.

- **Task 6.1: Uncertainty bands** — render fixture confidence band around `curve`/thresholds in `GrowthCurveChart.tsx`, `ThresholdCards.tsx` (only for `modelKind:'bernoulli'`).
- **Task 6.2: "Last checked" badge** — show `lastVerified` + source, worded "last checked", never "verified correct"; render uncertainty as "± sampling error", not a tight CI.
- **Task 6.3: Versioned share links** — embed `modelVersion`; stale ⇒ "rates updated since saved" (deserialize `-1` sentinel for thresholds).
- **Task 6.4: Counter-game rendering** — for `modelKind:'counter'`, show `GuaranteeCost` only; relabel any remaining `curve` as "chance of any 5-star, not the target."
- **Task 6.5: Limitations disclaimer** — surface known limits (cross-banner shared pity, 3-state chains) in UI, naming affected games.

**Owner:** `frontend`. **DoD:** band + "last checked" badge shown; stale link flagged; counter games show `GuaranteeCost` only; limitations listed.

### Sprint 7 — Frontend: honest probability communication (anti-misuse)
**Goal:** Prevent misinterpretation (p50 as guarantee, selection gaming).
**Skills:** ui-ux-pro-max, web-design-guidelines, high-end-visual-design, anti-ui-slop, frontend-design.

- **Task 7.1: Relabel thresholds** — "median / 80th / 95th percentile (not guaranteed)."
- **Task 7.2: Percentile band in budget** — p20/p80 band; budget = p50 marked "expected, not certain."
- **Task 7.3: Redesign `SuccessGauge`** — confidence band, not a single needle.
- **Task 7.4: Guard selection perception** — no "boost" framing (math fixed in S4).

**Owner:** `frontend` + `design`. **DoD (measurable):** zero occurrences of `/guaranteed/i` as a claim about a threshold in rendered output; band in budget; gauge shows band.

### Sprint 8 — Frontend: integration, polish & verification
**Goal:** Wire new outputs; responsive/a11y; final verification.
**Skills:** ui-ux-pro-max, web-design-guidelines, anti-ui-slop, playwright.

- **Task 8.1: Feed new outputs** — `curve`, `expectedValue`, threshold band, uncertainty, `GuaranteeCost`, `modelKind` into dashboard + budget calculator without layout regression.
- **Task 8.2: Responsive + a11y** — mobile, ARIA, reduced-motion.
- **Task 8.3: Playwright smoke (with TEXT assertions)** — all 10 presets, accuracy UI; **assert exact text "not guaranteed" present and no "guaranteed by then" phrasing**; counter games assert `GuaranteeCost` shown and no probabilistic curve.
- **Task 8.4: Final regression** — `npx vitest run` + `npm run build`.

**Owner:** `frontend`. **DoD:** all presets render accurate probabilities (or `GuaranteeCost`) with bands; Playwright passes incl. text assertions; build green.

> **GATE before S6:** the frontend must get its own verification + red-team pass (the 8 passes below covered algorithm, not S6–S8). Do not start S6 until that pass is done and P7/S8 text assertions are specified.

---

## Part 3 — Verification (8 passes: 3 plan-level + 3 algorithm-level + 5 overall)

### 3a. Plan-level (3)
- **V1 feasibility:** `PityCurve` in `presets.ts`; `monte-carlo.ts` deleted (B7 reframed); data must be researched (S2 critical path); `getRate` exported in S1.6; S4 edits `usePityCalculation.ts`; success metric for spark = EV/pulls-to-guarantee.
- **V2 math:** caught overstated B1; confirmed EV=75 + convolution correct; replaced conflicting tolerances with pointwise max abs CDF diff; per-game tables.
- **V3 scope:** research understated ⇒ flagged; added Endfield+sla to ramping set; split guarantees; S1 CI-observable.

### 3b. Algorithm-level (3, prior request)
- **V1 exactness:** convolution exact given `r_k`; found A1 (`baseRate===1` bug).
- **V2 numerical:** `S0<=0` break harmless for configured N; `0.9999999999` clamp truncates ~1e-10 (negligible); padding doesn't hide mass; adopt log-survival + normalize.
- **V3 best algorithm:** exact discrete convolution is PRIMARY; reject FFT/GF/ML; MC test-only.

### 3c. Overall sprint (5, THIS request)
- **V1 end-to-end correctness:** after all sprints, ramping + `GuaranteeCost` correctly architected and A1–A7 fixed; BUT plan overstated "exact" for multi-featured (A4 formula unpinned) and guarantee games' `curve` omits the currency guarantee (A7/A13). → Fixed: generalized formula pinned + `modelKind` suppression.
- **V2 numerical robustness:** plan intent sound but S1.7 `Float64Array.push` invalid (A9), aliasing, break+normalize interaction, `totalMass=0` (A10) → all fixed in S1.2/S1.7.
- **V3 optimization soundness:** `f1` bare shift is **wrong** (A8); key too narrow; `1e-12` check insufficient for aliasing → fixed (divide by `S0[offset-1]`, full-fingerprint key, defensive copies). Bigger win = dedupe `usePityCalculation` double-call (design-review smell #2). Perf test hardened (median/p95).
- **V4 sequencing:** feasible; S1 "no fixtures" valid; S5 size risk → kept as one sprint with 5a/5b sub-tasks + per-sub-task DoD; added S2→S5 fixture dependency note; added `modelVersion` to memo key.
- **V5 test/oracle adequacy:** found A1 test contradiction (`pity-engine.test.ts` row 2 asserts buggy behavior) → fixed in S1.1; MC must be independent Bernoulli sim with stated N/tol; `baseline.json` made a compare-and-fail gate; added fixture sanity + source-existence gate; perf test median/p95.

## Part 4 — Red-Team (8 passes: 3 plan-level + 3 algorithm-level + 5 overall)

### 4a. Plan-level (3)
- **R1 wrong probs:** per-game tables; all six ramping games; tolerances ≥ uncertainty; hard assertions; `+1` pinned; WuWa own datamine; `resolveWinRate` hard-asserted.
- **R2 breakage:** real assertions + artifact; extraction with exported accessor; bounds re-derived; `modelVersion`+badge; `guaranteeType` optional/additive; `resolveWinRate` test updated.
- **R3 misuse:** `lastVerified`+badge+staleness; tamper-guard; `winRate` no longer 1 via selection; p50 relabeled + p20/p80 band; uncertainty displayed.

### 4b. Algorithm-level (3, prior request)
- **R1 modeling:** A4 compound winRate, A3 mis-flag, A5 counter-reset → fixed S1.4/S4.
- **R2 edge:** A6 currentP contract → fixed S1.5.
- **R3 model limits:** A7 spark-not-Bernoulli → `GuaranteeCost` (S5); winRate conflates 5-star vs rate-up → split branch (S4); cross-banner noted; MC only code-bug catch.

### 4c. Overall sprint (5, THIS request)
- **R1 optimization regressions:** memo key collisions (stale featured PDF) → full-fingerprint key excluding `pullsInput`; f0-cache staleness across S3 re-anchor → `modelVersion`/content-hash key + test; Float64Array aliasing → defensive copies; `f1` shift bounds → correct `f0[i+offset]/S0[offset-1]`; perf flakiness → median/p95.
- **R2 wrong probabilities (modeling):** 75/25 & M>1 need ≥3 five-stars (A14) → generalized formula + documented limitation; `resolveWinRate` compound wrong for M rate-ups → divide by M (S4.3); weapon/chronicled banners unsupported → `guaranteeType` discriminant + "modeled as standard 50/50, may differ" warning; preset flag misconfig → per-preset invariant tests; `GuaranteeCost` vs Bernoulli `expectedValue` commensurability → label clearly.
- **R3 numerical edge:** `GuaranteeCost` EV must be computed by counter logic, never `expectedValue` (A7); `winRate===1`+`has50/50===false` still emits misleading curve → suppress via `modelKind` (A13); `baseRate=0` divide-by-zero → guard (A10); `Infinity` thresholds unserializable → sentinel `-1` (A6); currentP overstated for non-converging dist → pad only if converged (A12); normalization consistency → normalize `pdf` first (A2/A11); Float64Array sizing low risk.
- **R4 model limits / over-claim:** probabilistic curve for counter games suppressed (A13); "verified for patch X.Y" badge → "last checked" + ± sampling error (never exact); cross-banner shared pity surfaced in UI limitations; `resolveWinRate` compound trusts rate-up data → add `Σ featured.rate ≈ rateUpProb*baseRate` test; MC oracle labeled code-correctness-only.
- **R5 sprint coherence:** S5 split into 5a/5b sub-tasks with separate DoD; S2 source-existence gate added; **frontend red-team made a hard gate before S6** with Playwright text assertions; Web Worker CI guard added; per-sprint measurable DoD added (e.g., S7 zero `/guaranteed/i`; S5b `GuaranteeCost` within documented EV ±1 pull); S1 sequencing 1.6→1.7 with continuous MC oracle; re-run S1.3 after S2 fixtures.

---

## Global Constraints
- **No database:** client-only, static presets + static fixtures (decision 1).
- **No ML:** exact algorithmic methods only; MC is test-only cross-check, never rendered.
- **Best algorithm:** exact discrete convolution of empirical per-pull rate tables; guarantee/currency systems use separate `GuaranteeCost` + `modelKind:'counter'`.
- **Optimization (bounded):** precompute `f0`+`S0` (derive `f1=f0[i+offset]/S0[offset-1]`), memoize by full signature excluding `pullsInput`, `Float64Array` fixed-length + defensive copies, perf `p95<5ms` (median of ≥20 cold runs). Web Worker future-only (CI-guarded).
- Pure math engine stays free of React/Next imports (decision 3).
- No new runtime dependencies (decision 7).
- Keep no-target winRate honesty rule (decision 6).
- PHP-only money (decision 9) — unaffected, must not regress.
- Fixtures approximate; tolerances ≥ published uncertainty; ≥2 sources; source-existence + sanity gates in CI.
- `guaranteeType`/`has50/50`/`resetsCounterOnGuarantee` absent must reproduce today's behavior exactly.
- Forum feature (prof's request) is a separate, future consumer — out of scope.
