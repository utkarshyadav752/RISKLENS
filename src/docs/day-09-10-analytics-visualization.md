# Days 09–10: Telemetry Visualizations & Analytics Engines

## 1. Semi-Circular Value at Risk (VaR) Gauge (`VaRGauge.tsx`)
- Pure SVG implementation eliminating bulky charting runtime overhead.
- Arc geometry spanning 180 degrees with partitioned safety zones:
  - Green Zone: $0M to $45M (Safe Risk Budget).
  - Orange Warning Zone: $45M to $50M (Caution Boundary).
  - Red Critical Zone: $50M+ (Regulatory Limit Breached).
- Animated needle pointer responding smoothly to simulated market shocks.
- Monospace center readout displaying current VaR alongside confidence intervals.

---

## 2. 100,000-Run Monte Carlo Distribution Histogram (`DistributionHistogram.tsx`)
- Visualizes 25 discrete loss/gain bins across firmwide P&L scenarios (-$75M to +$45M).
- Explicit 99% VaR cutoff threshold line (-$48.65M) and Expected Shortfall (ES -$62.10M) tail region highlighted in red.
- Hover inspection reveals exact iteration frequency and quantile classification.

---

## 3. Cross-Asset Correlation Surface (`CorrelationSurface.tsx`)
- 5×5 interactive matrix covering Equities, FX (G10), Rates, Commodities, and Crypto.
- High-contrast color scales indicating diversifying assets (negative correlation < -0.30 in emerald) versus high-coupling hazards (> +0.50 in crimson/orange).
- Single-cell selection panel showing covariance commentary and systemic tail risk warnings.

---

## 4. Factor Exposure Waterfall & Geo Risk Map
- **Waterfall Chart**: Displays factor exposure attribution against $500M firm capacity.
- **Geographic Risk Map**: Stylized vector continent visualization displaying regional counterparty credit ratings, settlement exposure, and VaR contribution percentages across North America, EMEA, APAC, and LATAM.
