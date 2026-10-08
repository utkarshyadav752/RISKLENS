# Days 05–06: Primary Features – Shell, Personas & Threat States

## 1. Adaptive Navigation & Grid Shell
The dashboard shell adapts to three layout densities:
- **`comfortable` (24px gap, 24px container padding)**: Used by Elena Vance (CRO) to support macroscopic board reviews without visual clutter.
- **`standard` (16px gap, 20px container padding)**: Used by Sarah Al-Mansoor (Compliance) for incident queues and tabular verification workflows.
- **`compact` (12px gap, 14px container padding)**: Used by Marcus Chen (Quant) and Liam O'Connor (Desk Ops) for maximum information density per square inch.

---

## 2. Global Threat Levels & Defensive Postures
The application coordinates firmwide posture across three threat levels:
1. **Normal (DEFCON 5)**: Standard background monitoring; emerald status beacons.
2. **Elevated (DEFCON 3)**: Orange caution state; triggers heightened surveillance logging.
3. **Crisis (DEFCON 1)**: Red alert state; activates sticky top marquee banner (`BreachAlertMarquee.tsx`), arms algorithmic circuit breakers, and enforces immediate triage dialogs.

---

## 3. "What-If" Stress Simulation Engine
RiskLens provides an interactive **Stress Simulation Toggle** in the global navigation bar. When engaged:
- Firmwide 99% VaR spikes from **$42.8M** to **$68.4M**.
- Execution slippage rises from **11.2 bps** to **18.2 bps**.
- CET1 ratio adjusts from **14.8%** to **11.2%**, simulating a +100bps interest rate shock and severe equity drawdown.
- Triggers active breach queue alerts for immediate triage rehearsal.
