---
name: tick
description: Place framed figures (tick.css) in HTML docs, dashboards, reports and write-ups. Three styles (plot, stub, tui), ten themes, no build step. Use when a page needs a figure that scans faster than prose, or when the user mentions tick, framed figures, plot, stub or tui panels.
---

# tick

Framed figures for HTML pages. The markup for every figure lives in `llms.txt` next to this file. Copy it from there, change the labels and values, and keep the structure.

## Setup

```html
<link rel="stylesheet" href="tick.css">
<script type="module" src="tick.js"></script>
```

The stylesheet renders everything and loads its own fonts. The script is optional and adds the interactive parts.

## Pick a style

| The page is about | Style | Why |
|---|---|---|
| A design, a spec, an architecture, a measured result | plot | Reads like an engineering drawing: precise, annotated, dimensioned |
| A launch, a checklist, a quota, anything counted or punched | stub | Reads like a ticket: discrete, physical, done or not done |
| Live systems, services, latency, logs, anything monitored | tui | Reads like a terminal monitor: dense, current, keyboard-first |

Keep one style per page unless the page compares them.

## Pick a figure

| Data | Figure |
|---|---|
| Ordered stages with a value each | `plot-callouts` |
| One value against a budget or a maximum | `plot-dimension`, `stub-punch`, or the tui gauge |
| A list of things that are done or not | `stub-checklist` |
| Rows of named numbers with a trend | `tui-table` |
| A value over time | `tui-graph` |

## Rules

- Write labels in lowercase plain words. Keep titles to one to three words.
- Put the claim in prose next to the figure. A figure supports the text, it does not replace it.
- Use at most two figures per section.
- Set values with `--tk-value` (0 to 1) and the visible label with `data-tk-max` and `data-tk-unit`. Keep the label and the value in agreement.
- Pick a theme with `data-tk-theme` on a wrapper. Do not restyle the figures with extra borders, shadows or radii.
- Use `data-tk-static` for print, screenshots and anywhere motion would distract.
- Do not invent class names. Every class starts with `tk-` and appears in `llms.txt`.
