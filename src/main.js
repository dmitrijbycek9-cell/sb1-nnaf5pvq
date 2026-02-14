import './style.css';

const DEFAULT_TILES = [
  { emoji: '🍎', text: 'Essen', color: '#FF9800', image: null },
  { emoji: '🥛', text: 'Trinken', color: '#2196F3', image: null },
  { emoji: '🚽', text: 'WC', color: '#FFEB3B', image: null },
  { emoji: '🛁', text: 'Baden', color: '#03A9F4', image: null },
  { emoji: '🧸', text: 'Spielen', color: '#4CAF50', image: null },
  { emoji: '👩', text: 'Mama', color: '#E91E63', image: null }
];

const DEFAULT_SETTINGS = {
  tileSize: 150,
  fontSize: 24,
  borderRadius: 20,
  tileCount: 6,
  tiles: DEFAULT_TILES,
  pin: '1234'
};

let settings = loadSettings();
let deferredPrompt = null;

function loadSettings() {
  try {
    const saved = localStorage.getItem('kommunikations-app-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SETTINGS, ...parsed, tiles: parsed.tiles || DEFAULT_TILES };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings() {
  try {
    localStorage.setItem('kommunikations-app-settings', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

function renderTiles() {
  const container = document.getElementById('tiles-container');
  container.innerHTML = '';
  container.className = `grid-${settings.tileCount}`;

  const tilesToShow = settings.tiles.slice(0, settings.tileCount);

  tilesToShow.forEach((tile, index) => {
    const tileElement = document.createElement('div');
    tileElement.className = 'tile';
    tileElement.style.backgroundColor = tile.color;
    tileElement.style.width = `${settings.tileSize}px`;
    tileElement.style.height = `${settings.tileSize}px`;
    tileElement.style.borderRadius = `${settings.borderRadius}px`;

    if (tile.image) {
      const img = document.createElement('img');
      img.className = 'tile-image';
      img.src = tile.image;
      img.alt = tile.text;
      tileElement.appendChild(img);
    } else {
      const emoji = document.createElement('div');
      emoji.className = 'tile-emoji';
      emoji.textContent = tile.emoji;
      tileElement.appendChild(emoji);
    }

    const text = document.createElement('div');
    text.className = 'tile-text';
    text.textContent = tile.text;
    text.style.fontSize = `${settings.fontSize}px`;
    tileElement.appendChild(text);

    tileElement.addEventListener('click', () => {
      speakText(tile.text);
    });

    container.appendChild(tileElement);
  });
}

function openSettings() {
  const overlay = document.getElementById('settings-overlay');
  const pinSection = document.getElementById('pin-section');
  const settingsMain = document.getElementById('settings-main');
  const pinInput = document.getElementById('pin-input');

  pinSection.classList.remove('hidden');
  settingsMain.classList.add('hidden');
  pinInput.value = '';
  overlay.classList.remove('hidden');
}

function closeSettings() {
  const overlay = document.getElementById('settings-overlay');
  overlay.classList.add('hidden');
}

function verifyPin() {
  const pinInput = document.getElementById('pin-input');
  const enteredPin = pinInput.value;

  if (enteredPin === settings.pin) {
    document.getElementById('pin-section').classList.add('hidden');
    document.getElementById('settings-main').classList.remove('hidden');
    loadSettingsUI();
  } else {
    alert('Falsche PIN');
    pinInput.value = '';
  }
}

function loadSettingsUI() {
  const tileSizeSlider = document.getElementById('tile-size-slider');
  const tileSizeValue = document.getElementById('tile-size-value');
  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  const borderRadiusSlider = document.getElementById('border-radius-slider');
  const borderRadiusValue = document.getElementById('border-radius-value');
  const tileCountSelect = document.getElementById('tile-count-select');

  tileSizeSlider.value = settings.tileSize;
  tileSizeValue.textContent = `${settings.tileSize}px`;

  fontSizeSlider.value = settings.fontSize;
  fontSizeValue.textContent = `${settings.fontSize}px`;

  borderRadiusSlider.value = settings.borderRadius;
  borderRadiusValue.textContent = `${settings.borderRadius}px`;

  tileCountSelect.value = settings.tileCount;

  renderTileEditor();
}

function renderTileEditor() {
  const editor = document.getElementById('tile-editor');
  editor.innerHTML = '';

  settings.tiles.forEach((tile, index) => {
    const item = document.createElement('div');
    item.className = 'tile-edit-item';

    item.innerHTML = `
      <h4>Kachel ${index + 1}</h4>
      <label>
        Emoji
        <input type="text" value="${tile.emoji}" data-index="${index}" data-field="emoji" maxlength="4" />
      </label>
      <label>
        Text
        <input type="text" value="${tile.text}" data-index="${index}" data-field="text" />
      </label>
      <label>
        Farbe
        <input type="color" value="${tile.color}" data-index="${index}" data-field="color" />
      </label>
      <label>
        Bild hochladen
        <input type="file" accept="image/*" data-index="${index}" data-field="image" />
      </label>
      ${tile.image ? `<img src="${tile.image}" class="image-preview visible" data-index="${index}" />` : '<img class="image-preview" data-index="${index}" />'}
    `;

    editor.appendChild(item);
  });

  editor.querySelectorAll('input[data-field="emoji"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      settings.tiles[index].emoji = e.target.value;
    });
  });

  editor.querySelectorAll('input[data-field="text"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      settings.tiles[index].text = e.target.value;
    });
  });

  editor.querySelectorAll('input[data-field="color"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      settings.tiles[index].color = e.target.value;
    });
  });

  editor.querySelectorAll('input[data-field="image"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          settings.tiles[index].image = event.target.result;
          const preview = document.querySelector(`img.image-preview[data-index="${index}"]`);
          if (preview) {
            preview.src = event.target.result;
            preview.classList.add('visible');
          }
        };
        reader.readAsDataURL(file);
      }
    });
  });
}

function resetSettings() {
  if (confirm('Alle Einstellungen zurücksetzen?')) {
    settings = { ...DEFAULT_SETTINGS, tiles: JSON.parse(JSON.stringify(DEFAULT_TILES)) };
    saveSettings();
    loadSettingsUI();
    renderTiles();
  }
}

function saveAndClose() {
  saveSettings();
  renderTiles();
  closeSettings();
}

function initEventListeners() {
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('close-settings-btn').addEventListener('click', closeSettings);
  document.getElementById('pin-submit-btn').addEventListener('click', verifyPin);

  document.getElementById('pin-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      verifyPin();
    }
  });

  const tileSizeSlider = document.getElementById('tile-size-slider');
  const tileSizeValue = document.getElementById('tile-size-value');
  tileSizeSlider.addEventListener('input', (e) => {
    settings.tileSize = parseInt(e.target.value);
    tileSizeValue.textContent = `${settings.tileSize}px`;
    renderTiles();
  });

  const fontSizeSlider = document.getElementById('font-size-slider');
  const fontSizeValue = document.getElementById('font-size-value');
  fontSizeSlider.addEventListener('input', (e) => {
    settings.fontSize = parseInt(e.target.value);
    fontSizeValue.textContent = `${settings.fontSize}px`;
    renderTiles();
  });

  const borderRadiusSlider = document.getElementById('border-radius-slider');
  const borderRadiusValue = document.getElementById('border-radius-value');
  borderRadiusSlider.addEventListener('input', (e) => {
    settings.borderRadius = parseInt(e.target.value);
    borderRadiusValue.textContent = `${settings.borderRadius}px`;
    renderTiles();
  });

  const tileCountSelect = document.getElementById('tile-count-select');
  tileCountSelect.addEventListener('change', (e) => {
    settings.tileCount = parseInt(e.target.value);
    renderTiles();
  });

  document.getElementById('reset-btn').addEventListener('click', resetSettings);
  document.getElementById('save-close-btn').addEventListener('click', saveAndClose);

  document.getElementById('settings-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'settings-overlay') {
      closeSettings();
    }
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('Neue Version verfügbar. Jetzt aktualisieren?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

function initInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installPrompt = document.getElementById('install-prompt');
    const installYesBtn = document.getElementById('install-yes-btn');
    const installNoBtn = document.getElementById('install-no-btn');

    const hasSeenPrompt = localStorage.getItem('install-prompt-seen');
    if (!hasSeenPrompt) {
      installPrompt.classList.remove('hidden');
    }

    installYesBtn.addEventListener('click', async () => {
      installPrompt.classList.add('hidden');
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response: ${outcome}`);
        deferredPrompt = null;
      }
      localStorage.setItem('install-prompt-seen', 'true');
    });

    installNoBtn.addEventListener('click', () => {
      installPrompt.classList.add('hidden');
      localStorage.setItem('install-prompt-seen', 'true');
    });
  });

  window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    deferredPrompt = null;
  });
}

function init() {
  renderTiles();
  initEventListeners();
  registerServiceWorker();
  initInstallPrompt();
}

init();
