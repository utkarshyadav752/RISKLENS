# Days 01–02: Research, Threat Modeling & Architecture

## 1. Executive Context & Industry Problem Space
Financial risk management systems at quantitative trading firms operate under rigorous latency constraints, multi-billion-dollar capital exposures, and stringent statutory mandates (SEC Rule 15c3-5, MiFID II RTS 27/28, Basel III Internal Models Approach, Solvency II). When market dislocations occur—such as flash crashes, algorithmic feedback loops, or sudden sovereign rate shifts—operations teams face critical cognitive overload. Traditional dashboards often default to unstructured data dumps, uniform color tables, and sluggish single-persona layouts.

RiskLens was engineered by ZeTheta Algorithms as an **Adaptive Real-Time Financial Risk Monitoring Console**. The system dynamically restructures its information density, layout composition, and telemetry hierarchy according to four distinct user roles while enforcing strict WCAG 2.2 Level AA accessibility.

---

## 2. Persona Role Taxonomy & Cognitive Workload Mapping

| Persona | Role | Department | Layout Density | Primary Cognitive Need |
| :--- | :--- | :--- | :--- | :--- |
| **Elena Vance** | Chief Risk Officer | Executive Risk Office | `comfortable` | Macro capital preservation, CET1 adequacy, Solvency II buffer, board sign-off. |
| **Marcus Chen** | Senior Quantitative Analyst | Model Risk & Quant Research | `compact` | Stochastic tail distributions, fat-tail indices, Monte Carlo quantiles, portfolio Greeks. |
| **Sarah Al-Mansoor** | Compliance & Audit Lead | Regulatory Surveillance | `standard` | Statutory SLA timer queues, immutable audit logs (SHA-256), SEC 15c3-5 attestations. |
| **Liam O'Connor** | Trading Floor Ops Lead | HFT Execution & Algorithmic Desks | `compact` | Sub-second margin telemetry, execution slippage spikes, slide-to-confirm emergency freeze. |

---

## 3. WCAG 2.2 Level AA Dual-Signifier Design System
Never rely solely on color. Every critical alert level couples color, shape glyph, text label, and icon:

- **Critical (`#FF6B6B`)**: `🛑 Octagon` (`OctagonAlert` icon), Contrast: 6.22:1 against Obsidian Base (`#0B0E14`).
- **High (`#FF922B`)**: `⚠️ Triangle` (`TriangleAlert` icon), Contrast: 7.72:1 against Obsidian Base.
- **Medium (`#FCC419`)**: `🔶 Diamond` (`Diamond` icon), Contrast: 10.73:1 against Obsidian Base.
- **Safe (`#51CF66`)**: `🟢 Circle` (`CheckCircle2` icon), Contrast: 8.60:1 against Obsidian Base.
- **Info (`#4DABF7`)**: `ℹ️ Square` (`Info` icon), Contrast: 6.97:1 against Obsidian Base.

### Surface Color Contrast Matrix
- Obsidian Canvas Base: `#0B0E14`
- Surface Card: `#151B26`
- Surface Elevated: `#1F2736`
- Surface Border: `#273142`
- Text Primary: `#F1F3F5` (Contrast 15.52:1 against Base Canvas)
- Text Secondary: `#94A3B8` (Contrast 6.84:1 against Base Canvas)
