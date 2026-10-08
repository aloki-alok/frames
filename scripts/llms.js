const origin = (process.argv[2] ?? '').replace(/\/$/, '');
const root = new URL('../public/', import.meta.url);
const html = await Bun.file(new URL('index.html', root)).text();

const demos = [...html.matchAll(/^( *)<div class="demo" data-name="([^"]+)">\n([\s\S]*?)\n\1<\/div>/gm)].map(([, indent, name, body]) => ({
  name,
  markup: body.split('\n').map((line) => line.slice(indent.length + 2)).join('\n'),
}));

const at = (path) => (origin ? `${origin}/${path}` : path);

const text = `# frames

> Framed figures for docs, dashboards and write-ups. Three styles (plot, stub, tui), ten themes, plain CSS and one optional script. No build step, no framework.

## Install

\`\`\`html
<link rel="stylesheet" href="${at('frames.css')}">
<script type="module" src="${at('frames.js')}"></script>
\`\`\`

The stylesheet alone renders every figure. The script adds dragging, punching, zone readouts, row selection and live graphs.

## Options

- Theme: \`data-fr-theme\` on any ancestor. One of paper, graphite, phosphor, blueprint, riso, moss, signal, ultraviolet, rosewater, glacier. Without it, paper in light mode and ultraviolet in dark mode.
- No motion: \`data-fr-static\` on any ancestor. Reduced-motion users get this automatically.
- Values: \`style="--fr-value: .62"\` sets a 0 to 1 value. \`data-fr-input\` makes it draggable. \`data-fr-max\` and \`data-fr-unit\` set the label, written into any \`[data-fr-label]\` in the same figure.
- Events: \`fr-input\` (value), \`fr-toggle\` (hole punched), \`fr-select\` (table row), \`fr-pause\` (graph). All bubble.

## Figures

${demos.map((d) => `### ${d.name}\n\n\`\`\`html\n${d.markup}\n\`\`\``).join('\n\n')}

## More

- [Skill file](${at('skill.md')}): when to use which figure, and the rules.
- [Source](https://github.com/ryu-ryuk/frames)
`;

await Bun.write(new URL('llms.txt', root), text);
console.log(`llms.txt: ${demos.length} figures`);
