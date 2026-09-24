import fs from 'node:fs';
import path from 'node:path';
const dir = 'dist/button-demo';
let html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
html = html.replace(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const js = fs.readFileSync(path.join(dir, src.replace(/^\//, '')), 'utf8');
  return `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`;
});
html = html.replace(/<link\b[^>]*href="([^"]+\.css)"[^>]*>/g, (_, href) => {
  let css = fs.readFileSync(path.join(dir, href.replace(/^\//, '')), 'utf8');
  css = css.replace(/url\(([^)]+)\)/g, (whole, url) => {
    const cleaned = url.replaceAll(/["']/g, '');
    if (cleaned.startsWith('data:')) return whole;
    const file = path.join(dir, cleaned.replace(/^\//, ''));
    const mime = file.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
    return `url(data:${mime};base64,${fs.readFileSync(file).toString('base64')})`;
  });
  return `<style>${css}</style>`;
});
fs.writeFileSync('button-preview.html', html);
console.log('Wrote self-contained button-preview.html.');
