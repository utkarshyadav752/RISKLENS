# Days 11–12: Dashboard Integration & Cross-Persona State Management

## 1. Centralized State Architecture (`DashboardContext.tsx`)
A unified React Context manages cross-cutting concerns across the four views:
- **Active Persona & Density**: Automatic density synchronization on persona selection, while maintaining manual override capabilities.
- **Threat Level & Simulation Mutators**: Immediate state broadcast across all metric callouts, charts, and table rows when stress tests or crisis levels toggle.
- **Circuit Breaker Coordination**: Halting an individual desk or tripping the global breaker propagates instantaneously to order routing tables and status badges.
- **WORM Audit Trail**: Every user action (acknowledging an SLA breach, modifying a threshold, tripping a breaker) is recorded as a cryptographically hashed log entry (`AuditLogEntry`) with SHA-256 signatures.

---

## 2. Telemetry Jitter Simulation
To simulate high-frequency production market feeds:
- Background intervals introduce micro-jitter to the WebSocket heartbeat indicator (10ms–15ms range).
- Real-time SLA timers decrement once per second, updating visual urgency for open regulatory breaches.
- Monospace tabular figures prevent numeric layout shift during ticker updates.

---

## 3. High-Density Financial Data Table (`DataTable.tsx`)
- Multi-column sorting (`SortHeader.tsx`) with clear `aria-sort` indicators.
- Live client-side text filtering and severity segmentation.
- Dynamic column visibility toggles (`ColumnVisibilityDropdown.tsx`).
- Monospace numeric cells with currency, basis point, and percentage formatters (`TableCellMono.tsx`).
- Contextual row actions for audit ledger inspection and incident escalation.
