/* ===========================================
   KREEDA-ANKANA — Main App Controller
   Navigation, dialogs, snackbar, splash screen
   =========================================== */

const App = {
  currentView: 'calendar',
  views: ['calendar', 'challenges', 'scores', 'team'],
  snackbarTimeout: null,

  async init() {
    try {
      // Initialize IndexedDB
      await KreedaDB.init();
      console.log('[App] Database ready');

      // Initialize all modules
      CalendarModule.init();
      BookingModule.init();
      ChallengeModule.init();
      ScoreModule.init();
      TeamModule.init();

      // Setup navigation
      this._bindNavigation();
      this._bindDialogOverlay();

      // Setup dark mode toggle
      this._bindDarkMode();

      // Hide splash, show app
      setTimeout(() => {
        document.getElementById('splash-screen').classList.add('fade-out');
        setTimeout(() => {
          document.getElementById('splash-screen').style.display = 'none';
          document.getElementById('app').classList.add('visible');
        }, 600);
      }, 2000);

      console.log('[App] Kreeda-Ankana initialized successfully');
    } catch (err) {
      console.error('[App] Initialization failed:', err);
      document.getElementById('splash-screen').innerHTML = `
        <div style="text-align:center;color:#fff;padding:24px;">
          <span class="material-icons-round" style="font-size:64px;margin-bottom:16px;">error_outline</span>
          <h2>Oops! Something went wrong</h2>
          <p style="margin-top:8px;opacity:0.8;">Please refresh the page and try again.</p>
          <button onclick="location.reload()" style="margin-top:24px;padding:12px 32px;border:2px solid #fff;background:transparent;color:#fff;border-radius:8px;font-size:1rem;cursor:pointer;">Refresh</button>
        </div>`;
    }
  },

  // ===== NAVIGATION =====

  _bindNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (view) this.navigateTo(view);
      });
    });
  },

  navigateTo(viewName) {
    if (!this.views.includes(viewName) && viewName !== 'booking') return;

    this.currentView = viewName;

    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.add('active');

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(n => {
      n.classList.toggle('active', n.dataset.view === viewName);
    });

    // Update top bar title
    const titles = {
      calendar: '🏟️ Ground Calendar',
      booking: '📋 Book a Slot',
      challenges: '⚔️ Challenge Board',
      scores: '🏆 Score Wall',
      team: '👥 Team Profile'
    };
    document.getElementById('bar-title').textContent = titles[viewName] || 'Kreeda-Ankana';

    // Show/hide FABs
    document.getElementById('fab-challenge').style.display = viewName === 'challenges' ? 'flex' : 'none';
    document.getElementById('fab-score').style.display = viewName === 'scores' ? 'flex' : 'none';

    // Refresh data on navigation
    if (viewName === 'calendar') CalendarModule.render();
    if (viewName === 'scores') ScoreModule.loadResults();
    if (viewName === 'team') TeamModule.loadProfile();
  },

  showView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) targetView.classList.add('active');

    // Update top bar
    const titles = {
      calendar: '🏟️ Ground Calendar',
      booking: '📋 Book a Slot',
      challenges: '⚔️ Challenge Board',
      scores: '🏆 Score Wall',
      team: '👥 Team Profile'
    };
    document.getElementById('bar-title').textContent = titles[viewName] || 'Kreeda-Ankana';

    // FABs
    document.getElementById('fab-challenge').style.display = viewName === 'challenges' ? 'flex' : 'none';
    document.getElementById('fab-score').style.display = viewName === 'scores' ? 'flex' : 'none';
  },

  // ===== DIALOG =====

  _bindDialogOverlay() {
    document.getElementById('dialog-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'dialog-overlay') this.closeDialog();
    });
  },

  showDialog(title, bodyHtml, actions = []) {
    const overlay = document.getElementById('dialog-overlay');
    const dialog = document.getElementById('dialog');

    document.getElementById('dialog-title').innerHTML = title;
    document.getElementById('dialog-body').innerHTML = bodyHtml;

    const actionsContainer = document.getElementById('dialog-actions');
    actionsContainer.innerHTML = '';
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.className = `btn ${a.class || 'btn-primary'}`;
      btn.textContent = a.text;
      btn.addEventListener('click', a.action);
      actionsContainer.appendChild(btn);
    });

    overlay.classList.add('open');
  },

  closeDialog() {
    document.getElementById('dialog-overlay').classList.remove('open');
  },

  // ===== SNACKBAR =====

  showSnackbar(message, type = 'success') {
    const snackbar = document.getElementById('snackbar');
    snackbar.textContent = message;
    snackbar.className = `show ${type}`;

    clearTimeout(this.snackbarTimeout);
    this.snackbarTimeout = setTimeout(() => {
      snackbar.className = '';
    }, 3000);
  },

  // ===== DARK MODE =====

  _bindDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    const saved = localStorage.getItem('kreeda_theme');
    if (saved === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      toggle.textContent = 'light_mode';
    }

    toggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        toggle.textContent = 'dark_mode';
        localStorage.setItem('kreeda_theme', 'light');
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggle.textContent = 'light_mode';
        localStorage.setItem('kreeda_theme', 'dark');
      }
    });
  }
};

// ===== LAUNCH APP =====
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
