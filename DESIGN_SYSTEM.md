# CivicTwin — Design System Reference

> **Status:** Finalized v1.0  
> **Last Updated:** 2026-08-30  
> **Application:** Municipal Command-Center Dashboard

---

## 1. Design Philosophy

**"Data as Infrastructure"** — The visual language of CivicTwin is modeled on technical blueprints and control-room interfaces. Every design decision is functional:

- **No decoration.** No gradients, no shadows, no rounded corners on structural elements.
- **Color = severity.** Red is reserved exclusively for genuine alerts. Never decorative.
- **Mono for data.** All sensor readings, IDs, coordinates, timestamps use JetBrains Mono.
- **Dark for context, light for content.** The default theme is Light Mode for maximum legibility on dense data canvases, while the sidebar remains dark for authority and focus.

---

## 2. Color Palette

### Structural Colors

| Token | Hex | Usage |
|---|---|---|
| `sidebar-bg` | `#111318` | Left sidebar background |
| `sidebar-border` | `#2a2d35` | Sidebar internal dividers |
| `sidebar-active-bg` | `#1e2028` | Active nav item fill |
| `topbar-bg` | `#ffffff` | Top bar background |
| `page-bg` | `#f0f2f5` | Main canvas background |
| `panel-bg` | `#ffffff` | Card / panel fill |
| `panel-border` | `#e5e7eb` | Card borders, dividers |
| `panel-header-bg` | `#f9fafb` | Panel header strip fill |
| `decision-rail-bg` | `#f8f9fb` | Right rail background |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#111318` | Headings, values, labels |
| `text-secondary` | `#6b7280` | Body copy, descriptions |
| `text-muted` | `#9ca3af` | Timestamps, metadata, placeholders |
| `text-on-dark` | `#ffffff` | Text on dark/colored surfaces |
| `text-on-sidebar` | `#9ca3af` | Inactive nav items |

### Semantic / Status Colors

| Token | Hex | Usage |
|---|---|---|
| `critical-red` | `#b7102a` | Critical alert cards, ALERT badge, anomaly markers |
| `critical-red-alt` | `#ef4444` | Pulsing map marker, sparkline alert state |
| `warning-amber` | `#f59e0b` | Warning node markers, warning tab icon |
| `good-cyan` | `#0891b2` | GOOD badge, system-health badge text |
| `system-health-bg` | `#0f1724` | System Health badge container |
| `system-health-border` | `#00b4d8` | System Health badge border (healthy state) |
| `success-green` | `#10b981` | "Engine Online" dot |
| `tech-blue-dark` | `#1e3a5f` | Predictive model card header |

### Interactive Colors

| Token | Hex | Usage |
|---|---|---|
| `btn-primary-bg` | `#b7102a` | Primary action button (critical) |
| `btn-primary-bg-dark` | `#1e293b` | Primary action button (neutral) |
| `btn-secondary-border` | `#e5e7eb` | Ghost/secondary button border |

---

## 3. Typography

### Font Stack

```
Headlines / UI Labels:  "Hanken Grotesk", sans-serif
Monospace / Data:       "JetBrains Mono", monospace
```

> **Install:** `@fontsource/hanken-grotesk` (weights 400, 700, 800) and `@fontsource/jetbrains-mono` (weight 500)

### Type Scale

| Role | Font | Size | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| Logo / Wordmark | Hanken Grotesk | 18px | 800 | -0.01em | "CivicTwin" in TopBar |
| Sidebar Logo | Hanken Grotesk | 14px | 800 | 0.05em | "CIVICTWIN" in Sidebar |
| Section Title | Hanken Grotesk | 15px | 700 | – | Alert card titles |
| KPI Value | Hanken Grotesk | 40px | 800 | – | Big metric numbers (72, 87, 68) |
| KPI Suffix | Hanken Grotesk | 14px | 400 | – | "/100" suffix |
| Body / Description | Hanken Grotesk | 10–11px | 400 | – | Alert descriptions, body text |
| Nav Label | Hanken Grotesk | 10px | 400/700 | 0.04em | Sidebar nav items (uppercase) |
| Panel Header | Hanken Grotesk | 11px | 700 | 0.05em | "JAIPUR GRID TOPOLOGY" etc. |
| Data / Mono | JetBrains Mono | 10–12px | 500 | 0.05em | Coordinates, IDs, %, readings |
| Micro Label | Hanken Grotesk | 8–9px | 700 | 0.06–0.08em | "PHYSICAL INFRASTRUCTURE", badges |

### Typographic Rules

1. **ALL CAPS** for: nav items, panel headers, badge labels, button text, section labels.
2. **Flush-left** always. No centering of data text.
3. **Tight leading** (1.0–1.2) for KPI values and alert titles.
4. **1.5 leading** for body/description copy.

---

## 4. Layout & Spacing

### Grid

```
Layout type: Fixed-Fluid-Fixed (3-column)

├── Sidebar      : 130px  fixed
├── Main Content : flex-1 fluid (min-width: 0)
│   ├── TopBar   : 46px   fixed height
│   └── Canvas   : flex-1 scrollable
│       ├── KPI Strip     : auto height, 3 equal columns
│       └── Row           : flex, gap 12px
│           ├── Map Panel : flex-[2]  (≈ 2/3 width)
│           └── Intelligence Panel : 200px fixed
└── Decision Rail: 230px  fixed
```

### Spacing Scale

| Name | Value | Usage |
|---|---|---|
| `baseline` | 4px | Minimum gap between inline elements |
| `gap-sm` | 6–8px | Internal card gaps, badge padding |
| `gap-md` | 10–12px | Section gaps, card padding |
| `gap-lg` | 16px | Panel internal padding |
| `panel-gap` | 12px | Gap between major panels |
| `page-padding` | 12px 14px | Canvas outer padding |

### Borders

- **All borders:** `1px solid #e5e7eb` (light) or `1px solid #2a2d35` (dark sidebar)
- **No drop shadows anywhere.** Depth is created by tonal layers only.
- **No border-radius** on structural elements (panels, cards, buttons). Sharp corners.
- **Exception:** Status dot indicators use `border-radius: 50%` (circles only).

---

## 5. Component Patterns

### Sidebar

```
Width:        130px
Background:   #111318
Border-right: none (edge of viewport)
Logo area:    16px padding, border-bottom #2a2d35
Nav item:     full width, 10px 12px padding
Active state: background #1e2028, border-left 3px solid #ffffff
Badges:       Single right-aligned dynamic badge for active incidents. Red (#ea3b1b) if domain has critical anomalies, neutral gray otherwise.
```

### TopBar

```
Height:       46px
Background:   #ffffff
Border-bottom: 1px solid #e5e7eb
Wordmark:     18px / 800 weight / #111318
System Health badge:
  background: #0f1724
  border:     1px solid #00b4d8 (healthy) | #f59e0b (warning) | #ef4444 (critical)
  text:       matching border color, JetBrains Mono 11px
```

### KPI Card

```
Background:   #ffffff
No border-radius
Header row:   label (10px, muted, uppercase) + trend (JetBrains Mono, colored)
Value:        40px / 800 / tight leading
Suffix:       14px / 400 / muted
Badge:        9px / 700 / uppercase
  GOOD  → background #0891b2, text white
  ALERT → background #ef4444, text white
Sparkline:    10 bars, flex layout, height 28px
  Color → #374151 (normal) | #f59e0b (warning) | #ef4444 (alert)
```

### Map Panel (Grid Topology)

```
Header:       PANEL_HEADER_BG + 1px border-bottom
  "LIVE" badge: #111318 bg (normal) | #ef4444 bg with rhythmicPulse animation (anomaly)
  Coordinates: JetBrains Mono 10px, muted
Node markers:
  Normal:  10px circle, #3b82f6 fill, white border
  Warning: 10px circle, #f59e0b fill, white border
  Anomaly: 10px circle, #ef4444 fill + 20px pulsing ring at opacity 0.3
```

### Intelligence Panel

```
Width:        200px (fixed right of map)
Header:       PANEL_HEADER_BG, "INTELLIGENCE" + pin icon
Anomaly label: 9px / 700 / #b7102a / uppercase / "DETECTED ANOMALY"
Title:        15px / 700 / #111318
Description:  11px / 400 / #6b7280 / line-height 1.5
IMPACT row:   #fef2f2 bg / #fecaca border / "+X% Risk" in #b7102a mono
CONFIDENCE:   #111318 bg / white mono text
Interaction Loop footer:
  background: #111318
  active stage: #ffffff, inactive: #4b5563
  arrows: #4b5563
```

### Alert Card (Decision Rail)

```
Critical:
  Header bg:    #b7102a
  Category label: 8px / 700 / rgba(255,255,255,0.7) / "⚠ PHYSICAL INFRASTRUCTURE"
  Title:        12px / 700 / white
  Meta Data:    Relative timestamp (e.g. "12 min ago") and "REPORTED BY: [N]" corroboration count
  Body bg:      #ffffff
  Buttons:      full-width split, primary = #b7102a bg, secondary = ghost border

Predictive:
  Header bg:    #1e3a5f
  Category:     "⚡ PREDICTIVE MODEL"
  Button:       ghost, full width
```

### Decision Rail

```
Width:         230px
Background:    #f8f9fb
Border-left:   1px solid #e5e7eb
Header:        white bg, "DECISION RAIL" 12px/800, "AI Incident Alerts" 10px/muted
Tabs:          9px / uppercase, active underline = tab color
  Critical   → #b7102a
  Warnings   → #f59e0b
  Insights   → #6b7280
Log:           "RESOLVED TODAY" section at bottom to show actively cleared incidents
Footer:        white bg, 20px dark square "AI" badge + "Engine Online" + green dot
```

---

## 6. Animation

All animations must be disabled under `prefers-reduced-motion: reduce`.

| Name | Definition | Usage |
|---|---|---|
| `rhythmicPulse` | scale 1↔1.02, opacity 1↔0.8, 2s ease-in-out infinite | LIVE badge when anomaly active |
| `markerPulse` | scale 0.8→1, box-shadow 0→10px transparent, 1.5s infinite | Red anomaly node marker ring |
| `slideUpFade` | translateY 16px→0, opacity 0→1, 0.4s ease-out | Alert cards entering Decision Rail |

```css
@keyframes rhythmicPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.02); }
}

@keyframes markerPulse {
  0%   { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(239,68,68,0.7); }
  70%  { transform: scale(1);   box-shadow: 0 0 0 10px rgba(239,68,68,0); }
  100% { transform: scale(0.8); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
}

@keyframes slideUpFade {
  0%   { opacity: 0; transform: translateY(16px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

---

## 7. Icon Set

**Library:** `lucide-react`  
**Stroke weight:** 1.5–2px  
**Size:** 13–20px depending on context  
**Color:** inherits from parent text color

Key icons used:

| Icon | Component | Purpose |
|---|---|---|
| `LayoutDashboard` | Sidebar | Overview nav |
| `RadioReceiver` | Sidebar | Infrastructure nav |
| `BrainCircuit` | Sidebar | Intelligence nav |
| `Activity` | Sidebar | System Health nav |
| `Bell` | TopBar | Notifications |
| `User` | TopBar | Account |
| `Map` | GridTopologyPanel | Panel header |
| `Database` | IntelligencePanel | Panel header |
| `ShieldAlert` | DecisionRail | Critical alert |
| `Zap` | DecisionRail | Predictive alert |
| `Cpu` | DecisionRail | AI Engine footer |

---

## 8. State → Visual Mapping

| Store State | Visual Effect |
|---|---|
| `node.status = "anomaly"` | Red pulsing dot on map, LIVE badge turns red + pulses, map flies to node |
| `incident.status = "open"` | Card appears in Decision Rail, Intelligence Panel populates |
| `interactionLoop.stage = "act"` | "ACT" step highlighted white in Interaction Loop footer |
| `kpi.status = "alert"` | KPI value turns red, sparkline turns red, ALERT badge appears |
| `incident.status = "resolved"` | Card fades from rail, node returns to blue dot, KPIs restore |

---

## 9. Do's and Don'ts

### ✅ Do
- Use `#b7102a` red only for genuine alerts and critical states
- Use `JetBrains Mono` for all numeric/data values
- Keep all corners sharp (0px border-radius) on cards, buttons, panels
- Use `1px solid` borders to define panel hierarchy — never shadows
- Pair every status color with a text label or icon (accessibility)
- Keep the Interaction Loop visible even when no incident is active

### ❌ Don't
- Use gradients anywhere
- Add drop shadows to panels or cards
- Round panel corners (only status dots may be circular)
- Use red for non-alert decorative elements
- Center-align dashboard data (always flush-left)
- Mix font families within a single data row
