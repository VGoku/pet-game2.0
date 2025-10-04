// main.js
// Initialize Game
function init() {
  load();
  if (game.init) {
    document.getElementById('intro').style.display = 'none';
    document.getElementById('home-content').style.display = 'block';
    updateAvatar();
    showSection('home');
    renderAllSections();
    setInterval(triggerRandomEvent, 120000);
  } else {
    document.getElementById('intro').style.display = 'block';
    document.getElementById('home-content').style.display = 'none';
    renderStarters();
  }
  updateUI();
  updateServerTime();
  setInterval(updateServerTime, 1000);
  initMusic();
}

// Save/Load Game
function save() {
  try {
    localStorage.setItem('fabledFamiliars', JSON.stringify(game));
  } catch(e) {
    console.warn('Save failed', e);
  }
}

function load() {
  const saved = localStorage.getItem('fabledFamiliars');
  if (saved) {
    try {
      Object.assign(game, JSON.parse(saved));
    } catch(e) {
      console.warn('Load failed', e);
    }
  }
}

function clearSave() {
  if (confirm('Delete all progress?')) {
    localStorage.removeItem('fabledFamiliars');
    location.reload();
  }
}

// Initialize game when page loads
// Background music handling (loop across pages)
const bgMusic = document.getElementById('bg-music');
let musicMuted = false;

function initMusic() {
  if (!bgMusic) return;
  bgMusic.loop = true;
  bgMusic.volume = 0.35;
  bgMusic.play().catch(() => {
    const startOnce = () => {
      bgMusic.play().catch(()=>{});
      window.removeEventListener('pointerdown', startOnce);
      window.removeEventListener('keydown', startOnce);
    };
    window.addEventListener('pointerdown', startOnce, { once: true });
    window.addEventListener('keydown', startOnce, { once: true });
  });
}

function toggleMute() {
  if (!bgMusic) return;
  musicMuted = !musicMuted;
  bgMusic.muted = musicMuted;
  const btn = document.getElementById('mute-btn');
  if (btn) btn.textContent = musicMuted ? 'Unmute' : 'Mute';
}

// Try to resume audio context on user gesture (for WebAudio)
document.addEventListener('pointerdown', () => {
  if (typeof AudioContext !== 'undefined' && window._audioCtx && window._audioCtx.state === 'suspended') {
    window._audioCtx.resume().catch(()=>{});
  }
}, { once: true });

document.addEventListener('DOMContentLoaded', init);