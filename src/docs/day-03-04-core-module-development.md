# Days 03–04: Core Module Development & Token Architecture

## 1. Design System Token Pipeline
RiskLens enforces a unified token abstraction located in `src/design-system/tokens.ts`. All interactive primitives consume programmatic severity mappings guaranteeing:
- Mathematically calculated luminance and relative contrast ratios.
- Shape glyph identity mapping for non-color dependent status decoding.
- Accessible ARIA role descriptions and assertive live region flags.

```typescript
export const SEVERITY_TOKENS: Record<SeverityLevel, SeverityToken> = {
  critical: {
    level: 'critical',
    label: 'Critical Breached',
    hex: '#FF6B6B',
    glyph: '🛑',
    glyphShape: 'octagon',
    iconName: 'OctagonAlert',
    contrastOnCanvas: 6.22
  },
  // ... high, medium, safe, info
};
```

---

## 2. Tier 1 Foundation Primitives
1. **`Button.tsx`**: Standardized focus visible rings (`focus-visible:ring-2 focus-visible:ring-blue-500`), five semantic variants, keyboard interaction handling, loading spinners, and active scale animations.
2. **`RiskBadge.tsx`**: Combines background tints, border indicators, Lucide SVG icons, shape glyphs, and text labels for universal legibility across all color-vision deficiencies.
3. **`MetricCallout.tsx`**: High-impact card featuring monospace tabular numerals (`tabular-nums`), directional risk delta arrows, and integrated SVG micro-sparklines.
4. **`StatusIndicator.tsx`**: Real-time heartbeat beacon with CSS animation ping for sub-second telemetry feeds.
5. **`Divider.tsx`**: Semantic `<div role="separator">` with optional monospace section markers.
6. **`SkeletonLoader.tsx`**: Shimmer placeholders matching layout geometry to prevent content shift.
