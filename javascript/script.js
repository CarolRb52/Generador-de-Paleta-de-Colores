// Color Palette Generator
// This script provides functionality for generating color harmonies

const colorSwatch = document.getElementById('colorSwatch');
const hexInput = document.getElementById('hexInput');
const harmonySelect = document.getElementById('harmonySelect');
const generateBtn = document.getElementById('generateBtn');
const paletteGrid = document.getElementById('paletteGrid');
const copyToast = document.getElementById('copyToast');
const modalOverlay = document.getElementById('modalOverlay');
const exportCode = document.getElementById('exportCode');
const modalTitle = document.getElementById('modalTitle');

let currentPalette = [];

// Initialize
generateBtn.addEventListener('click', generatePalette);
colorSwatch.addEventListener('change', updateHexInput);
hexInput.addEventListener('change', updateColorSwatch);

document.getElementById('exportJSON').addEventListener('click', () => exportPalette('json'));
document.getElementById('exportCSS').addEventListener('click', () => exportPalette('css'));
document.getElementById('exportSASS').addEventListener('click', () => exportPalette('sass'));
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('copyCodeBtn').addEventListener('click', copyCode);

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
                                                btn.addEventListener('click', switchTab);
});

function updateHexInput() {
    hexInput.value = colorSwatch.value.toUpperCase();
}

function updateColorSwatch() {
    if (hexInput.value.match(/^#[0-9A-F]{6}$/i)) {
          colorSwatch.value = hexInput.value;
    }
}

function generatePalette() {
    const baseColor = colorSwatch.value;
    const harmony = harmonySelect.value;

  currentPalette = generateHarmony(baseColor, harmony);
    displayPalette();
    updatePreviews();
}

function generateHarmony(baseColor, harmonyType) {
    const hsl = hexToHsl(baseColor);
    const palette = [hsl];

  switch(harmonyType) {
    case 'complementary':
            palette.push([(hsl[0] + 180) % 360, hsl[1], hsl[2]]);
            break;
    case 'triadic':
            palette.push([(hsl[0] + 120) % 360, hsl[1], hsl[2]]);
            palette.push([(hsl[0] + 240) % 360, hsl[1], hsl[2]]);
            break;
    case 'tetradic':
            palette.push([(hsl[0] + 90) % 360, hsl[1], hsl[2]]);
            palette.push([(hsl[0] + 180) % 360, hsl[1], hsl[2]]);
            palette.push([(hsl[0] + 270) % 360, hsl[1], hsl[2]]);
            break;
    case 'analogous':
            palette.push([(hsl[0] + 30) % 360, hsl[1], hsl[2]]);
            palette.push([(hsl[0] - 30 + 360) % 360, hsl[1], hsl[2]]);
            break;
    case 'split-complementary':
            palette.push([(hsl[0] + 150) % 360, hsl[1], hsl[2]]);
            palette.push([(hsl[0] + 210) % 360, hsl[1], hsl[2]]);
            break;
  }

  return palette;
}

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

  if (max === min) {
        h = s = 0;
  } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
        h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function displayPalette() {
    paletteGrid.innerHTML = '';

  currentPalette.forEach((hsl, index) => {
                             const hex = hslToHex(hsl[0], hsl[1], hsl[2]);
      const card = document.createElement('div');
      card.className = 'color-card';
      card.innerHTML = `
              <div class="color-swatch" style="background-color: ${hex}"></div>
              <div class="color-info">
                <div class="color-hex">${hex}</div>
                <div class="color-name">Color ${index + 1}</div>
              </div>
            `;

    card.addEventListener('click', () => copyColor(hex));
      paletteGrid.appendChild(card);
});
}

function copyColor(color) {
    navigator.clipboard.writeText(color).then(() => {
                                                  showToast(`${color} copiado!`);
});
}

function showToast(message) {
    copyToast.textContent = message;
    copyToast.classList.add('show');
    setTimeout(() => copyToast.classList.remove('show'), 2000);
}

function exportPalette(format) {
    let code = '';

  if (format === 'json') {
        const colors = currentPalette.map((hsl, i) => ({
                                                name: `Color ${i + 1}`,
                                                hex: hslToHex(hsl[0], hsl[1], hsl[2])
          }));
      code = JSON.stringify(colors, null, 2);
} else if (format === 'css') {
      code = ':root {\n';
      currentPalette.forEach((hsl, i) => {
                                   code += `  --color-${i + 1}: ${hslToHex(hsl[0], hsl[1], hsl[2])};\n`;
});
    code += '}';
} else if (format === 'sass') {
      currentPalette.forEach((hsl, i) => {
                                   code += `$color-${i + 1}: ${hslToHex(hsl[0], hsl[1], hsl[2])}\n`;
});
}

  modalTitle.textContent = `Exportar ${format.toUpperCase()}`;
  exportCode.textContent = code;
  modalOverlay.classList.add('show');
}

function closeModal() {
    modalOverlay.classList.remove('show');
}

function copyCode() {
    navigator.clipboard.writeText(exportCode.textContent).then(() => {
                                                                   showToast('Código copiado!');
});
}

function switchTab(e) {
    const tabName = e.target.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
                                                      btn.classList.toggle('active', btn.dataset.tab === tabName);
});
  document.querySelectorAll('.preview-card').forEach(card => {
                                                         card.style.display = card.id === `${tabName}Preview` ? 'flex' : 'none';
});
}

function updatePreviews() {
    const cssCode = generateCSS();
    const sassCode = generateSASS();
    const jsonCode = generateJSON();

  document.getElementById('cssPreview').textContent = cssCode;
    document.getElementById('sassPreview').textContent = sassCode;
    document.getElementById('jsonPreview').textContent = jsonCode;
}

function generateCSS() {
    let code = ':root {\n';
    currentPalette.forEach((hsl, i) => {
                               code += `  --color-${i + 1}: ${hslToHex(hsl[0], hsl[1], hsl[2])};\n`;
});
  code += '}';
  return code;
}

function generateSASS() {
    let code = '';
    currentPalette.forEach((hsl, i) => {
                               code += `$color-${i + 1}: ${hslToHex(hsl[0], hsl[1], hsl[2])}\n`;
});
  return code;
}

function generateJSON() {
    const colors = currentPalette.map((hsl, i) => ({
                                          name: `Color ${i + 1}`,
                                          hex: hslToHex(hsl[0], hsl[1], hsl[2])
      }));
  return JSON.stringify(colors, null, 2);
}

// Generate initial palette
generatePalette();
