---
name: HydroMetric Pro
colors:
  surface: '#0e141e'
  surface-dim: '#0e141e'
  surface-bright: '#333945'
  surface-container-lowest: '#080e18'
  surface-container-low: '#161c26'
  surface-container: '#1a202a'
  surface-container-high: '#242a35'
  surface-container-highest: '#2f3540'
  on-surface: '#dde2f1'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#dde2f1'
  inverse-on-surface: '#2b313c'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#59dbc7'
  on-secondary: '#003731'
  secondary-container: '#00a694'
  on-secondary-container: '#00332c'
  tertiary: '#dcfff0'
  on-tertiary: '#00382a'
  tertiary-container: '#5bf3c7'
  on-tertiary-container: '#006d55'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#79f7e3'
  secondary-fixed-dim: '#59dbc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#65fbcf'
  tertiary-fixed-dim: '#40deb3'
  on-tertiary-fixed: '#002117'
  on-tertiary-fixed-variant: '#00513e'
  background: '#0e141e'
  on-background: '#dde2f1'
  surface-variant: '#2f3540'
  status-running: '#00FF41'
  status-stopped: '#94A3B8'
  status-fault: '#FF3131'
  status-warning: '#F59E0B'
  surface-card: '#161E2D'
  chart-cyan: '#00F2FF'
  chart-teal: '#00A896'
  chart-blue: '#3B82F6'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-padding: 24px
  widget-gap: 16px
  internal-padding: 20px
  grid-columns: '12'
  breakpoint-desktop: 1440px
  breakpoint-tablet: 1024px
---

## Brand & Style

The design system is engineered for the mission-critical environment of rural water infrastructure monitoring. It strikes a balance between high-tech "Command Center" aesthetics and practical, utilitarian clarity. The brand personality is **vigilant, precise, and sophisticated**, designed to instill confidence in technical operators managing vital public resources.

The visual style is a hybrid of **Modern Corporate** and **Technological Minimalism**. It utilizes a deep-sea dark mode foundation to reduce eye strain during extended monitoring sessions, accented by luminous teal and cyan "glow" effects that simulate light-emitting hardware indicators. Every pixel is dedicated to data legibility, using subtle gradients and glassmorphic depth to organize complex information hierarchies without visual clutter.

## Colors

The palette is optimized for a dark-room dashboard environment. 

- **Primary & Secondary:** A range of cyans and teals represent the "water tech" identity. These are used for primary data points, active states, and glowing accents.
- **Backgrounds:** The primary background is a deep navy-black (`#0B111B`) to maximize contrast for luminous elements.
- **Semantic Colors:** Critical for status monitoring. 
    - **Running:** A high-vibrancy green.
    - **Fault:** A sharp, urgent red for immediate attention.
    - **Warning:** Amber for threshold alerts (e.g., pH limits).
    - **Stopped:** A neutral gray for inactive but healthy hardware.
- **Gradients:** Use subtle top-down linear gradients on cards (from `#1E293B` to `#161E2D`) to provide a sense of physical structure.

## Typography

This design system utilizes **Hanken Grotesk** for its clean, geometric, and modern feel, ensuring high legibility in headings and descriptive text. For technical data—specifically numerical values like flow rates (m³/h), pH levels, and coordinates—**JetBrains Mono** is employed. The monospaced nature of JetBrains Mono prevents layout shifting when numbers fluctuate in real-time.

**Key Rules:**
- **Units:** Always display units (e.g., NTU, mg/L) in a smaller `label-sm` style immediately following the data value.
- **Hierarchy:** Use FontWeight 600+ for labels to ensure they stand out against the dark background.
- **Contrast:** Titles use High-Emphasis White (90% opacity), while secondary labels use Medium-Emphasis Cyan (60% opacity).

## Layout & Spacing

The layout follows a **Fixed Dashboard Grid** optimized for 16:9 large-format displays (Command Center screens). 

- **Primary Zone (Top-Left):** Spans 7 columns. Reserved for the 3D Map visualization of the rural water network.
- **Secondary Widgets (Right/Bottom):** Standardized 1, 2, or 3-column width cards that wrap around the map.
- **Rhythm:** A strict 8px base grid is used for all internal component spacing.
- **Density:** High information density is required. Gutters are kept tight at 16px to maximize the screen real estate for data widgets.
- **Responsiveness:** On tablets, the layout reflows into a single column with the map pinned to the top, maintaining full widget width.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Glassmorphism**, rather than traditional heavy shadows which get lost on dark backgrounds.

- **Base Layer:** The "Ground" (`#0B111B`).
- **Surface Layer:** Dashboard widgets use a semi-transparent dark navy (`rgba(22, 30, 45, 0.8)`) with a 1px "inner-glow" stroke in Cyan at 10% opacity.
- **Overlay Layer:** Modals or tooltips use a background blur (12px) to lift the content above the data charts.
- **Active State Glow:** Primary buttons and active status indicators use an outer glow (0px 0px 12px) using their respective semantic color to simulate an illuminated hardware LED.

## Shapes

The design system adopts a **Soft** shape language. 

- **Widgets & Cards:** 0.25rem (4px) corner radius. This sharp-but-not-harsh aesthetic feels professional and "engineered."
- **Status Indicators:** Circular indicators for "Running/Fault" states.
- **Progress Bars:** Use square ends for linear charts and 4px rounded caps for circular gauges to maintain a technical, precision-tool look.

## Components

### Data Cards
Each card must feature a header with a 2px vertical "accent bar" in Cyan on the left. The content area should contain the primary value in `data-display` style and a small sparkline showing the 24-hour trend.

### Circular Progress Bars (Water Levels)
Used for tank and reservoir levels. The center of the circle displays the percentage. The track should be a dark-muted teal, and the active indicator should be a glowing Primary Cyan.

### Real-time Trend Charts
Area charts with a gradient fill (Primary Cyan to Transparent). Grid lines should be faint (`#ffffff` at 5% opacity). No data points/dots unless the user hovers over the line.

### Status Indicators
Small horizontal pills for "Pumping Station Status." 
- Text is `label-sm`.
- Icon is a solid circle with a soft glow in the respective semantic color.

### Specialized Water Widgets
- **pH Meter:** A horizontal gauge with safe-range markers (6.5-8.5 highlighted).
- **Pump Toggle:** A high-contrast switch that uses the Primary Cyan for "Manual/Remote" mode selection.
- **Valve Indicator:** A 0-100% dial with an icon of a rotating valve in the center.

### Input Fields
Dark-themed inputs with high-contrast borders (1px solid `#334155`). On focus, the border glows Primary Cyan and the label floats.