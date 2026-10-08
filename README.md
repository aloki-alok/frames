# tick

**[crwl.tech](https://crwl.tech)**

Framed figures for docs, dashboards and write-ups. Three styles, ten themes, plain CSS and one small optional script.

- **plot**: an engineering drawing sheet with a zoned border, crop marks, a title block and dimension lines.
- **stub**: a perforated ticket with a tear-off stub and holes you punch.
- **tui**: a terminal monitor panel with hotkey titles, key hints and a live braille graph.

Every figure renders with the stylesheet alone. The script adds dragging, punching, zone readouts, row selection and live graphs. Each figure has an animated entrance and a static mode.

## Use

```html
<link rel="stylesheet" href="https://crwl.tech/tick.css">
<script type="module" src="https://crwl.tech/tick.js"></script>
```

Copy a figure from the site or from `llms.txt`, then:

- pick a theme with `data-tk-theme="ultraviolet"` on any ancestor,
- turn motion off with `data-tk-static` on any ancestor.

Themes: paper, graphite, phosphor, blueprint, riso, moss, signal, ultraviolet, rosewater, glacier. With no theme set, figures follow the system: paper in light mode, ultraviolet in dark mode.

## For agents

`llms.txt` holds the markup for every figure. `skill.md` is a skill file that says which figure fits which data.

## Develop

```sh
bun test
bun scripts/llms.js https://crwl.tech
bunx wrangler dev
```

`scripts/fonts.sh` rebuilds the subsetted fonts in `public/fonts` from the source TTF files.

## Credits

Fonts: IBM Plex Mono, Space Mono, JetBrains Mono and Noto Sans Symbols 2, all under the SIL Open Font License. They ship subsetted and renamed, with their licenses in `public/fonts`. The idea of framed figures for agent-written docs came from [mdxcn](https://mdxcn.dev).

## License

MIT
