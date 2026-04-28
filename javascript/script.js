let palette = [];
  let currentTab = 'card';

  // ── Color math ──────────────────────────────────────────────────────────────
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16)/255;
    let g = parseInt(hex.slice(3,5),16)/255;
    let b = parseInt(hex.slice(5,7),16)/255;
    let max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max===min) { h=s=0; }
    else {
      let d = max-min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=((g-b)/d+(g<b?6:0))/6; break;
        case g: h=((b-r)/d+2)/6; break;
        case b: h=((r-g)/d+4)/6; break;
      }
    }
    return [h*360, s*100, l*100];
  }

  function hslToHex(h, s, l) {
    h = ((h%360)+360)%360;
    s = Math.max(0,Math.min(100,s)); l = Math.max(0,Math.min(100,l));
    s/=100; l/=100;
    let a = s*Math.min(l,1-l);
    let f = n => {
      let k=(n+h/30)%12, color=l-a*Math.max(-1,Math.min(k-3,9-k,1));
      return Math.round(255*color).toString(16).padStart(2,'0');
    };
    return '#'+f(0)+f(8)+f(4);
  }

  function getContrastColor(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
    return lum > 0.5 ? '#111111' : '#ffffff';
  }

  function colorName(h, s, l) {
    if (s < 8) return l < 20 ? 'Casi negro' : l > 80 ? 'Casi blanco' : 'Gris';
    const hues = ['Rojo','Naranja','Amarillo','Lima','Verde','Turquesa','Cian','Celeste','Azul','Violeta','Magenta','Rosa'];
    const name = hues[Math.round(h/30) % 12];
    const light = l > 70 ? ' claro' : l < 30 ? ' oscuro' : '';
    return name + light;
  }

  function generateHarmony(h, s, l, type) {
    const pairs = {
      'complementary': [[h,s,l],[h+180,s,l],[h,s,l*0.5],[h+180,s,l*0.5],[h,s*0.4,l*1.4],[h+180,s*0.4,l*1.4]],
      'analogous': [[h,s,l],[h-30,s,l],[h+30,s,l],[h-60,s*0.8,l],[h+60,s*0.8,l],[h,s*0.3,l*1.3]],
      'triadic': [[h,s,l],[h+120,s,l],[h+240,s,l],[h,s*0.5,l*1.3],[h+120,s*0.5,l*1.3],[h+240,s*0.5,l*1.3]],
      'split-complementary': [[h,s,l],[h+150,s,l],[h+210,s,l],[h,s*0.4,l*1.4],[h+150,s*0.6,l*1.2],[h+210,s*0.6,l*1.2]],
      'tetradic': [[h,s,l],[h+90,s,l],[h+180,s,l],[h+270,s,l],[h,s*0.3,l*1.3],[h+180,s*0.3,l*1.3]],
      'monochromatic': [[h,s,l],[h,s,l*0.3],[h,s,l*0.55],[h,s*0.4,l*1.4],[h,s*0.7,l*0.7],[h,s*0.15,l*1.6]]
    };
    return (pairs[type] || pairs['complementary']).map(([hh,ss,ll]) => hslToHex(hh,ss,ll));
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  function generatePalette() {
    const hex = document.getElementById('hexInput').value.trim();
    if (!/^#[0-9a-fA-F]{6}$/.test(hex)) { showToast('Hex inválido'); return; }
    const harmony = document.getElementById('harmonySelect').value;
    const [h,s,l] = hexToHsl(hex);
    palette = generateHarmony(h, s, l, harmony);
    renderPalette();
    renderPreview();
  }

  function renderPalette() {
    const grid = document.getElementById('paletteGrid');
    grid.innerHTML = '';
    palette.forEach((hex, i) => {
      const [h,s,l] = hexToHsl(hex);
      const fg = getContrastColor(hex);
      const card = document.createElement('div');
      card.className = 'color-card editable';
      card.style.animationDelay = (i*0.05)+'s';
      card.innerHTML = `
        <div class="color-swatch" style="background:${hex}">
          <div class="edit-overlay" style="color:${fg}">✎ Editar</div>
          <input type="color" class="edit-color-input" value="${hex}" data-index="${i}">
        </div>
        <div class="color-info">
          <div class="color-hex">${hex.toUpperCase()}</div>
          <div class="color-name">${colorName(h,s,l)}</div>
        </div>`;
      card.querySelector('.color-swatch').addEventListener('click', () => copyToClipboard(hex));
      card.querySelector('.edit-color-input').addEventListener('input', (e) => {
        e.stopPropagation();
        palette[i] = e.target.value;
        renderPalette();
        renderPreview();
      });
      grid.appendChild(card);
    });
  }

  function renderPreview() {
    const frame = document.getElementById('previewFrame');
    const [c0,c1,c2,c3,c4,c5] = [...palette, ...palette];
    if (currentTab === 'card') {
      frame.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:0;min-height:320px;">
          <div style="flex:1.5;min-width:220px;background:${c0};padding:40px 36px;display:flex;flex-direction:column;justify-content:space-between;">
            <div style="font-family:'DM Serif Display',serif;font-size:1.8rem;color:${getContrastColor(c0)};line-height:1.2;">Color & <em>Paleta</em></div>
            <div>
              <div style="width:48px;height:4px;background:${c1};border-radius:2px;margin-bottom:16px;"></div>
              <p style="font-family:'DM Mono',monospace;font-size:0.75rem;color:${getContrastColor(c0)};opacity:0.7;letter-spacing:0.05em;line-height:1.6;">Armonía cromática perfecta para tu siguiente proyecto.</p>
            </div>
          </div>
          <div style="flex:1;min-width:160px;background:${c1};display:flex;flex-direction:column;justify-content:center;align-items:center;padding:30px;">
            <div style="width:64px;height:64px;border-radius:50%;background:${c0};margin-bottom:16px;"></div>
            <div style="font-family:'DM Mono',monospace;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;color:${getContrastColor(c1)};">${c1.toUpperCase()}</div>
          </div>
          <div style="flex:1;min-width:160px;display:flex;flex-direction:column;">
            <div style="flex:1;background:${c2};display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:0.65rem;color:${getContrastColor(c2)};letter-spacing:0.1em;text-transform:uppercase;">${c2.toUpperCase()}</div>
            <div style="flex:1;background:${c3};display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:0.65rem;color:${getContrastColor(c3)};letter-spacing:0.1em;text-transform:uppercase;">${c3.toUpperCase()}</div>
          </div>
        </div>`;
    } else if (currentTab === 'ui') {
      frame.innerHTML = `
        <div style="background:${c5||'#f5f5f5'};padding:36px;min-height:320px;font-family:'DM Mono',monospace;">
          <div style="display:flex;gap:12px;margin-bottom:28px;flex-wrap:wrap;">
            <button style="background:${c0};color:${getContrastColor(c0)};border:none;border-radius:8px;padding:10px 22px;font-family:'DM Mono',monospace;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Primario</button>
            <button style="background:transparent;color:${c0};border:2px solid ${c0};border-radius:8px;padding:10px 22px;font-family:'DM Mono',monospace;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Outline</button>
            <button style="background:${c1};color:${getContrastColor(c1)};border:none;border-radius:8px;padding:10px 22px;font-family:'DM Mono',monospace;font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer;">Acento</button>
          </div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <div style="background:${c0};border-radius:12px;padding:22px;flex:1;min-width:140px;">
              <div style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:${getContrastColor(c0)};opacity:0.6;margin-bottom:6px;">Ventas</div>
              <div style="font-family:'DM Serif Display',serif;font-size:1.8rem;color:${getContrastColor(c0)};">$48.2k</div>
            </div>
            <div style="background:${c1};border-radius:12px;padding:22px;flex:1;min-width:140px;">
              <div style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:${getContrastColor(c1)};opacity:0.6;margin-bottom:6px;">Usuarios</div>
              <div style="font-family:'DM Serif Display',serif;font-size:1.8rem;color:${getContrastColor(c1)};">1,240</div>
            </div>
            <div style="background:${c2};border-radius:12px;padding:22px;flex:1;min-width:140px;">
              <div style="font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;color:${getContrastColor(c2)};opacity:0.6;margin-bottom:6px;">Tasa</div>
              <div style="font-family:'DM Serif Display',serif;font-size:1.8rem;color:${getContrastColor(c2)};">94.7%</div>
            </div>
          </div>
        </div>`;
    } else {
      frame.innerHTML = `
        <div style="background:${c5||'#fff'};padding:48px 40px;min-height:320px;font-family:'DM Mono',monospace;">
          <p style="font-family:'DM Serif Display',serif;font-size:2.4rem;color:${c0};line-height:1.15;margin-bottom:16px;">El color es <em>vida</em>.</p>
          <p style="font-size:0.78rem;color:${getContrastColor(c5||'#fff')};opacity:0.65;line-height:1.9;margin-bottom:24px;max-width:480px;">Una paleta bien construida puede transformar un diseño ordinario en algo verdaderamente memorable.</p>
          <div style="display:flex;gap:6px;align-items:center;">
            <span style="display:inline-block;background:${c0};color:${getContrastColor(c0)};border-radius:6px;padding:4px 12px;font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;">Primario</span>
            <span style="display:inline-block;background:${c1};color:${getContrastColor(c1)};border-radius:6px;padding:4px 12px;font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;">Acento</span>
            <span style="display:inline-block;background:${c2};color:${getContrastColor(c2)};border-radius:6px;padding:4px 12px;font-size:0.68rem;letter-spacing:0.08em;text-transform:uppercase;">Suave</span>
          </div>
        </div>`;
    }
  }

  // ── Tabs ────────────────────────────────────────────────────────────────────
  function switchTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderPreview();
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  function exportCSS() {
    const code = `:root {\n${palette.map((h,i)=>`  --color-${i+1}: ${h};`).join('\n')}\n}`;
    showModal('Exportar — CSS Variables', code);
  }

  function exportTailwind() {
    const inner = palette.map((h,i) => `    palette${i+1}: '${h}',`).join('\n');
    const code = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${inner}\n      }\n    }\n  }\n}`;
    showModal('Exportar — Tailwind Config', code);
  }

  function exportJSON() {
    const obj = {};
    palette.forEach((h,i) => { obj[`color${i+1}`] = h; });
    showModal('Exportar — JSON', JSON.stringify(obj, null, 2));
  }

  function showModal(title, code) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('exportCode').textContent = code;
    document.getElementById('exportModal').classList.add('show');
  }

  function closeModal() {
    document.getElementById('exportModal').classList.remove('show');
  }

  function copyExportCode() {
    navigator.clipboard.writeText(document.getElementById('exportCode').textContent);
    showToast('¡Código copiado!');
    closeModal();
  }

  // ── Utils ───────────────────────────────────────────────────────────────────
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text.toUpperCase());
    showToast(text.toUpperCase() + ' copiado');
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
  }

  function randomColor() {
    const h = Math.floor(Math.random()*360);
    const s = 60 + Math.floor(Math.random()*30);
    const l = 40 + Math.floor(Math.random()*25);
    const hex = hslToHex(h,s,l);
    document.getElementById('colorPicker').value = hex;
    document.getElementById('hexInput').value = hex.toUpperCase();
    generatePalette();
  }

  // ── Sync inputs ──────────────────────────────────────────────────────────────
  document.getElementById('colorPicker').addEventListener('input', e => {
    document.getElementById('hexInput').value = e.target.value.toUpperCase();
  });

  document.getElementById('hexInput').addEventListener('input', e => {
    let v = e.target.value;
    if (!v.startsWith('#')) v = '#'+v;
    if (/^#[0-9a-fA-F]{6}$/.test(v)) document.getElementById('colorPicker').value = v;
  });

  document.getElementById('exportModal').addEventListener('click', e => {
    if (e.target === document.getElementById('exportModal')) closeModal();
  });

  // ── Init ─────────────────────────────────────────────────────────────────────
  generatePalette();
