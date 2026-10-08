const origin = (process.argv[2] ?? '').replace(/\/$/, '');
const root = new URL('../public/', import.meta.url);
const html = await Bun.file(new URL('index.html', root)).text();

const demos = [...html.matchAll(/^( *)<div class="demo" data-name="([^"]+)">\n([\s\S]*?)\n\1<\/div>/gm)].map(([, indent, name, body]) => ({
  name,
  markup: body.split('\n').map((line) => line.slice(indent.length + 2)).join('\n'),
}));

const at = (path) => (origin ? `${origin}/${path}` : path);

const text = `# tick

> Framed figures for docs, dashboards and write-ups. Three styles (plot, stub, tui), ten themes, plain CSS and one optional script. No build step, no framework.

## Install

\`\`\`html
<link rel="stylesheet" href="${at('tick.css')}">
<script type="module" src="${at('tick.js')}"></script>
\`\`\`

The stylesheet alone renders every figure. The script adds dragging, punching, zone readouts, row selection and live graphs.

## Options

- Theme: \`data-tk-theme\` on any ancestor. One of paper, graphite, phosphor, blueprint, riso, moss, signal, ultraviolet, rosewater, glacier. Without it, paper in light mode and ultraviolet in dark mode.
- No motion: \`data-tk-static\` on any ancestor. Reduced-motion users get this automatically.
- Values: \`style="--tk-value: .62"\` sets a 0 to 1 value. \`data-tk-input\` makes it draggable. \`data-tk-max\` and \`data-tk-unit\` set the label, written into any \`[data-tk-label]\` in the same figure.
- Events: \`tk-input\` (value), \`tk-toggle\` (hole punched), \`tk-select\` (table row), \`tk-pause\` (graph). All bubble.

## Figures

${demos.map((d) => `### ${d.name}\n\n\`\`\`html\n${d.markup}\n\`\`\``).join('\n\n')}

## More

- [Skill file](${at('skill.md')}): when to use which figure, and the rules.
- [Source](https://github.com/aloki-alok/tick)
`;

await Bun.write(new URL('llms.txt', root), text);
console.log(`llms.txt: ${demos.length} figures`);
