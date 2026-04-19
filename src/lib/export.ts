import type { BrandInputs, BrandOutputs } from '../types';

export function toMarkdown(inputs: BrandInputs, outputs: BrandOutputs): string {
  const lines: string[] = [];

  lines.push(`# Brand Package — ${inputs.name || 'Untitled'}`);
  lines.push('');
  lines.push(`*Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Overview');
  lines.push('');
  lines.push(outputs.overview);
  lines.push('');

  lines.push('## Positioning');
  lines.push('');
  lines.push(outputs.positioning);
  lines.push('');

  lines.push('## Tone & Voice');
  lines.push('');
  lines.push(`**Attributes:** ${outputs.tone.attributes.join(', ')}`);
  lines.push('');
  lines.push(`**Voice:** ${outputs.tone.voiceNotes}`);
  lines.push('');
  if (outputs.tone.avoidList.length > 0) {
    lines.push(`**Avoid:** ${outputs.tone.avoidList.join(', ')}`);
    lines.push('');
  }
  if (outputs.tone.examplePhrases.length > 0) {
    lines.push('**Example phrases:**');
    outputs.tone.examplePhrases.forEach(p => lines.push(`- ${p}`));
    lines.push('');
  }

  lines.push('## Messaging');
  lines.push('');
  lines.push('### Titles');
  outputs.titles.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  lines.push('');
  lines.push('### Subtitles');
  outputs.subtitles.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push('');
  lines.push('### Taglines');
  outputs.taglines.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  lines.push('');

  lines.push('## Color Palette');
  lines.push('');
  outputs.palette.swatches.forEach(s => {
    lines.push(`- **${s.name}** — \`${s.hex}\` *(${s.role})*`);
  });
  lines.push('');

  lines.push('## Typography');
  lines.push('');
  lines.push(`**Primary:** ${outputs.typography.primary}`);
  if (outputs.typography.secondary !== outputs.typography.primary)
    lines.push(`**Secondary:** ${outputs.typography.secondary}`);
  lines.push(`**Monospace:** ${outputs.typography.mono}`);
  lines.push('');
  lines.push(`*${outputs.typography.pairNote}*`);
  lines.push('');
  lines.push('| Style | Size | Weight | Usage |');
  lines.push('|-------|------|--------|-------|');
  outputs.typography.scale.forEach(t => {
    lines.push(`| ${t.label} | ${t.size} | ${t.weight} | ${t.usage} |`);
  });
  lines.push('');

  lines.push('## Visual Direction');
  lines.push('');
  outputs.visualDirections.forEach(dir => {
    lines.push(`### ${dir.name}`);
    lines.push('');
    lines.push(dir.description);
    lines.push('');
    lines.push(`**Palette:** ${dir.palette}`);
    lines.push('');
    lines.push(`**Typography:** ${dir.typography}`);
    lines.push('');
    lines.push(`**References:** ${dir.references}`);
    lines.push('');
  });

  lines.push('## Logo Concepts');
  lines.push('');
  outputs.logoConcepts.forEach(lc => {
    lines.push(`### ${lc.title}`);
    lines.push('');
    lines.push(lc.concept);
    lines.push('');
    lines.push(`**Mark:** ${lc.mark}`);
    lines.push('');
    lines.push(`**Execution:** ${lc.execution}`);
    lines.push('');
  });

  lines.push('## Usage Examples');
  lines.push('');
  outputs.usageExamples.forEach(ex => {
    lines.push(`### ${ex.context}`);
    lines.push('');
    lines.push('```');
    lines.push(ex.text);
    lines.push('```');
    lines.push('');
  });

  lines.push('## Constraints');
  lines.push('');
  outputs.constraints.forEach(c => lines.push(`- ${c}`));
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('*Brand Workbench*');

  return lines.join('\n');
}

export function toJSON(inputs: BrandInputs, outputs: BrandOutputs): string {
  return JSON.stringify(
    {
      project: {
        name: inputs.name,
        category: inputs.category,
        purpose: inputs.purpose,
        audience: inputs.audience,
      },
      brand: outputs,
      meta: {
        generated: new Date().toISOString(),
        version: '1.0',
      },
    },
    null,
    2
  );
}

export function toHTML(inputs: BrandInputs, outputs: BrandOutputs): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const swatchesHtml = outputs.palette.swatches.map(s => `
    <div class="swatch">
      <div class="swatch-color" style="background:${esc(s.hex)}"></div>
      <div class="swatch-name">${esc(s.name)}</div>
      <div class="swatch-hex">${esc(s.hex)}</div>
    </div>`).join('');

  const scaleRows = outputs.typography.scale.map(t => `
    <tr><td>${esc(t.label)}</td><td>${esc(t.size)}</td><td>${esc(t.weight)}</td><td>${esc(t.usage)}</td></tr>`).join('');

  const dirsHtml = outputs.visualDirections.map(d => `
    <div class="card">
      <h3>${esc(d.name)}</h3>
      <p>${esc(d.description)}</p>
      <dl>
        <dt>Palette</dt><dd>${esc(d.palette)}</dd>
        <dt>Typography</dt><dd>${esc(d.typography)}</dd>
        <dt>References</dt><dd>${esc(d.references)}</dd>
      </dl>
    </div>`).join('');

  const logosHtml = outputs.logoConcepts.map(l => `
    <div class="card">
      <h3>${esc(l.title)}</h3>
      <p>${esc(l.concept)}</p>
      <dl>
        <dt>Mark</dt><dd>${esc(l.mark)}</dd>
        <dt>Execution</dt><dd>${esc(l.execution)}</dd>
      </dl>
    </div>`).join('');

  const usageHtml = outputs.usageExamples.map(ex => `
    <div class="usage-item">
      <div class="usage-label">${esc(ex.context)}</div>
      <pre>${esc(ex.text)}</pre>
    </div>`).join('');

  const constraintsHtml = outputs.constraints.map(c => `<li>${esc(c)}</li>`).join('\n');

  const secondaryRow = outputs.typography.secondary !== outputs.typography.primary
    ? `<tr><td>Secondary</td><td>${esc(outputs.typography.secondary)}</td></tr>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(inputs.name || 'Brand')} — Brand Guidelines</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 15px; }
  body { font-family: ui-sans-serif, -apple-system, system-ui, sans-serif; color: #1a1a1a; background: #fff; line-height: 1.6; }
  .guide { max-width: 860px; margin: 0 auto; padding: 60px 40px 100px; }
  .guide-header { border-bottom: 2px solid #111; padding-bottom: 24px; margin-bottom: 48px; }
  .guide-header h1 { font-size: 36px; font-weight: 700; letter-spacing: -0.02em; }
  .guide-header .meta { font-size: 13px; color: #777; margin-top: 6px; }
  h2 { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #999; margin-bottom: 20px; padding-bottom: 8px; border-bottom: 1px solid #e5e5e5; }
  section { margin-bottom: 56px; }
  p { color: #333; margin-bottom: 12px; }
  .font-table, .scale-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px; }
  .font-table td, .scale-table td, .scale-table th { padding: 8px 12px; border-bottom: 1px solid #eee; text-align: left; }
  .scale-table th { font-size: 11px; font-weight: 600; color: #999; text-transform: uppercase; letter-spacing: 0.06em; }
  .font-table td:first-child { color: #999; width: 120px; }
  .pair-note { font-size: 13px; color: #777; font-style: italic; margin-top: 8px; }
  .swatches { display: flex; flex-wrap: wrap; gap: 12px; }
  .swatch { width: 100px; }
  .swatch-color { width: 100px; height: 64px; border-radius: 6px; border: 1px solid rgba(0,0,0,.08); margin-bottom: 6px; }
  .swatch-name { font-size: 12px; font-weight: 500; color: #333; }
  .swatch-hex { font-size: 11px; font-family: ui-monospace, monospace; color: #777; }
  .card { border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
  .card h3 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
  .card p { font-size: 14px; color: #555; margin-bottom: 12px; }
  dl { display: grid; grid-template-columns: 100px 1fr; gap: 4px 16px; font-size: 13px; }
  dt { color: #999; font-weight: 500; }
  dd { color: #444; }
  .usage-item { margin-bottom: 20px; }
  .usage-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #999; margin-bottom: 6px; }
  pre { background: #f5f5f5; border-radius: 6px; padding: 14px 16px; font-size: 13px; font-family: ui-monospace, monospace; white-space: pre-wrap; color: #333; line-height: 1.6; }
  ul { padding-left: 20px; }
  li { font-size: 14px; color: #444; margin-bottom: 6px; }
  .tone-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .tone-pill { background: #f0f0f0; border-radius: 4px; padding: 3px 10px; font-size: 12px; color: #555; }
  .tone-row { font-size: 14px; color: #444; margin-bottom: 8px; }
  .tone-row strong { color: #999; display: inline-block; min-width: 100px; }
  .taglines ol, .titles ol { padding-left: 20px; }
  .taglines li, .titles li { font-size: 15px; color: #333; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="guide">
  <div class="guide-header">
    <h1>${esc(inputs.name || 'Brand')} Guidelines</h1>
    <div class="meta">Generated ${date}${inputs.category ? ` · ${esc(inputs.category)}` : ''}${inputs.audience ? ` · ${esc(inputs.audience)}` : ''}</div>
  </div>

  <section>
    <h2>Overview</h2>
    <p>${esc(outputs.overview)}</p>
  </section>

  <section>
    <h2>Positioning</h2>
    <p>${esc(outputs.positioning)}</p>
  </section>

  <section>
    <h2>Tone &amp; Voice</h2>
    <div class="tone-pills">${outputs.tone.attributes.map(a => `<span class="tone-pill">${esc(a)}</span>`).join('')}</div>
    <div class="tone-row"><strong>Voice</strong>${esc(outputs.tone.voiceNotes)}</div>
    ${outputs.tone.avoidList.length ? `<div class="tone-row"><strong>Avoid</strong>${esc(outputs.tone.avoidList.join(', '))}</div>` : ''}
  </section>

  <section>
    <h2>Messaging</h2>
    <div class="titles">
      <p><strong>Titles</strong></p>
      <ol>${outputs.titles.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
    </div>
    <br>
    <div class="taglines">
      <p><strong>Taglines</strong></p>
      <ol>${outputs.taglines.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
    </div>
  </section>

  <section>
    <h2>Color Palette</h2>
    <div class="swatches">${swatchesHtml}</div>
  </section>

  <section>
    <h2>Typography</h2>
    <table class="font-table">
      <tr><td>Primary</td><td>${esc(outputs.typography.primary)}</td></tr>
      ${secondaryRow}
      <tr><td>Monospace</td><td>${esc(outputs.typography.mono)}</td></tr>
    </table>
    <p class="pair-note">${esc(outputs.typography.pairNote)}</p>
    <br>
    <table class="scale-table">
      <thead><tr><th>Style</th><th>Size</th><th>Weight</th><th>Usage</th></tr></thead>
      <tbody>${scaleRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Visual Direction</h2>
    ${dirsHtml}
  </section>

  <section>
    <h2>Logo Concepts</h2>
    ${logosHtml}
  </section>

  <section>
    <h2>Usage Examples</h2>
    ${usageHtml}
  </section>

  <section>
    <h2>Constraints</h2>
    <ul>${constraintsHtml}</ul>
  </section>
</div>
</body>
</html>`;
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
