(function () {
  const storageKey = 'calculatorHubTheme';
  const defaults = {
    mode: 'dark',
    accent: '#6ea8fe',
    accent2: '#8b5cf6'
  };
  const presets = [
    ['#6ea8fe', '#8b5cf6'],
    ['#14b8a6', '#0ea5e9'],
    ['#f97316', '#ef4444'],
    ['#22c55e', '#84cc16'],
    ['#ec4899', '#f43f5e']
  ];

  function readTheme() {
    try {
      return Object.assign({}, defaults, JSON.parse(localStorage.getItem(storageKey)) || {});
    } catch (error) {
      return Object.assign({}, defaults);
    }
  }

  function saveTheme(theme) {
    localStorage.setItem(storageKey, JSON.stringify(theme));
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme.mode;
    document.documentElement.style.setProperty('--accent', theme.accent);
    document.documentElement.style.setProperty('--accent-2', theme.accent2);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.mode === 'light' ? '#f6f8fc' : '#0b1020');
  }

  function setActiveMode(panel, mode) {
    panel.querySelectorAll('.theme-mode').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.mode === mode);
    });
  }

  function buildCustomizer() {
    const customizer = document.createElement('div');
    customizer.className = 'theme-customizer';
    customizer.innerHTML = `
      <button class="theme-toggle" type="button" aria-label="Customize theme" aria-expanded="false">
        <span class="theme-toggle-mark" aria-hidden="true"></span>
      </button>
      <section class="theme-panel" aria-label="Theme customizer">
        <h2>Theme</h2>
        <div class="theme-section">
          <div class="theme-label">Mode</div>
          <div class="theme-modes">
            <button class="theme-mode" type="button" data-mode="dark">Dark</button>
            <button class="theme-mode" type="button" data-mode="light">Light</button>
          </div>
        </div>
        <div class="theme-section">
          <div class="theme-label">Colors</div>
          <div class="theme-colors">
            <label class="theme-color"><span>Primary</span><input type="color" data-color="accent"></label>
            <label class="theme-color"><span>Secondary</span><input type="color" data-color="accent2"></label>
          </div>
        </div>
        <div class="theme-section">
          <div class="theme-label">Presets</div>
          <div class="theme-swatches"></div>
        </div>
        <div class="theme-section">
          <button class="theme-reset" type="button">Reset Theme</button>
        </div>
      </section>
    `;

    const swatches = customizer.querySelector('.theme-swatches');
    presets.forEach(([accent, accent2]) => {
      const swatch = document.createElement('button');
      swatch.className = 'theme-swatch';
      swatch.type = 'button';
      swatch.style.background = `linear-gradient(135deg, ${accent}, ${accent2})`;
      swatch.setAttribute('aria-label', `Use ${accent} and ${accent2}`);
      swatch.addEventListener('click', () => {
        theme.accent = accent;
        theme.accent2 = accent2;
        syncControls();
        applyTheme(theme);
        saveTheme(theme);
      });
      swatches.appendChild(swatch);
    });

    document.body.appendChild(customizer);

    const toggle = customizer.querySelector('.theme-toggle');
    const panel = customizer.querySelector('.theme-panel');
    const colorInputs = customizer.querySelectorAll('input[type="color"]');

    function syncControls() {
      setActiveMode(panel, theme.mode);
      customizer.querySelector('[data-color="accent"]').value = theme.accent;
      customizer.querySelector('[data-color="accent2"]').value = theme.accent2;
    }

    toggle.addEventListener('click', () => {
      const isOpen = customizer.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!customizer.contains(event.target)) {
        customizer.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });

    panel.querySelectorAll('.theme-mode').forEach((button) => {
      button.addEventListener('click', () => {
        theme.mode = button.dataset.mode;
        syncControls();
        applyTheme(theme);
        saveTheme(theme);
      });
    });

    colorInputs.forEach((input) => {
      input.addEventListener('input', () => {
        theme[input.dataset.color] = input.value;
        applyTheme(theme);
        saveTheme(theme);
      });
    });

    customizer.querySelector('.theme-reset').addEventListener('click', () => {
      theme = Object.assign({}, defaults);
      syncControls();
      applyTheme(theme);
      saveTheme(theme);
    });

    syncControls();
  }

  let theme = readTheme();
  applyTheme(theme);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildCustomizer);
  } else {
    buildCustomizer();
  }
})();
