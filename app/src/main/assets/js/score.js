/* ===========================================
   KREEDA-ANKANA — Score Wall Module
   Match results display with winner highlighting
   =========================================== */

const ScoreModule = {
  results: [],

  init() {
    this._bindEvents();
    this.loadResults();
  },

  _bindEvents() {
    document.getElementById('fab-score').addEventListener('click', () => {
      this._showPostDialog();
    });
  },

  async loadResults() {
    try {
      this.results = await KreedaDB.getAllMatchResults();
      this.render();
    } catch (err) {
      console.error('[Score] Failed to load results:', err);
    }
  },

  async deleteResult(id) {
    if (!confirm('Are you sure you want to delete this match result?')) return;
    try {
      await KreedaDB.deleteMatchResult(id);
      await this.loadResults();
      App.showSnackbar('🗑️ Result removed', 'success');
    } catch (err) {
      App.showSnackbar('❌ Failed to delete', 'error');
    }
  },

  render() {
    const container = document.getElementById('scores-list');

    if (this.results.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons-round icon">emoji_events</span>
          <h3>No Match Results Yet</h3>
          <p>Post your first match result using the + button below.</p>
        </div>`;
      return;
    }

    container.innerHTML = this.results.map(r => this._renderCard(r)).join('');
  },

  _renderCard(result) {
    const isWinnerA = result.winner === result.teamA;
    const isWinnerB = result.winner === result.teamB;
    const isDraw = result.winner === 'Draw';
    const winnerClass = isWinnerA ? 'winner-a' : isWinnerB ? 'winner-b' : '';

    const sportChip = result.sport === 'Cricket'
      ? '<span class="chip sport-cricket">🏏 Cricket</span>'
      : '<span class="chip sport-volleyball">🏐 Volleyball</span>';

    const dateObj = new Date(result.date + 'T00:00:00');
    const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return `
      <div class="card score-card ${winnerClass}">
        <div style="position:absolute;top:12px;left:12px;z-index:10;">
          <button class="btn-icon" style="color:var(--text-hint);background:var(--bg-card);border:none;width:24px;height:24px;cursor:pointer;" onclick="ScoreModule.deleteResult(${result.id})" title="Delete">
            <span class="material-icons-round" style="font-size:18px;">delete</span>
          </button>
        </div>
        ${!isDraw ? `<div class="winner-badge">🏆 ${this._escapeHtml(result.winner)} Wins!</div>` : '<div class="winner-badge" style="background:linear-gradient(135deg,#78909C,#546E7A);">🤝 Draw</div>'}
        <div class="score-teams">
          <div class="score-team">
            <div class="score-team-name" style="${isWinnerA ? 'color:var(--winner-gold);' : ''}">${this._escapeHtml(result.teamA)}</div>
            <div class="score-team-score team-a-score">${result.scoreA}</div>
          </div>
          <div class="score-vs">VS</div>
          <div class="score-team">
            <div class="score-team-name" style="${isWinnerB ? 'color:var(--winner-gold);' : ''}">${this._escapeHtml(result.teamB)}</div>
            <div class="score-team-score team-b-score">${result.scoreB}</div>
          </div>
        </div>
        <div class="score-meta">
          <span><span class="material-icons-round" style="font-size:14px;">calendar_today</span> ${dateStr}</span>
          ${sportChip}
        </div>
      </div>`;
  },

  _showPostDialog() {
    const today = new Date().toISOString().split('T')[0];
    App.showDialog(
      '🏆 Post Match Result',
      `<form id="score-post-form">
        <div class="form-group">
          <label class="form-label">Team A</label>
          <input type="text" class="form-input" id="score-teamA" placeholder="Team A name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Team A Score</label>
          <input type="number" class="form-input" id="score-scoreA" placeholder="0" min="0" required>
        </div>
        <div class="form-group">
          <label class="form-label">Team B</label>
          <input type="text" class="form-input" id="score-teamB" placeholder="Team B name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Team B Score</label>
          <input type="number" class="form-input" id="score-scoreB" placeholder="0" min="0" required>
        </div>
        <div class="form-group">
          <label class="form-label">Sport</label>
          <div class="toggle-group" style="margin-top:4px;">
            <button type="button" class="toggle-btn active" data-sport="Cricket" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏏 Cricket</button>
            <button type="button" class="toggle-btn" data-sport="Volleyball" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏐 Volleyball</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Match Date</label>
          <input type="date" class="form-input" id="score-date" value="${today}" required>
        </div>
      </form>`,
      [
        { text: 'Cancel', class: 'btn-outline', action: () => App.closeDialog() },
        { text: 'Post Result', class: 'btn-accent', action: () => this._submitResult() }
      ]
    );
  },

  async _submitResult() {
    const teamA = document.getElementById('score-teamA').value.trim();
    const teamB = document.getElementById('score-teamB').value.trim();
    const scoreA = document.getElementById('score-scoreA').value;
    const scoreB = document.getElementById('score-scoreB').value;
    const sport = document.querySelector('#dialog .toggle-group .toggle-btn.active')?.dataset.sport || 'Cricket';
    const date = document.getElementById('score-date').value;

    if (!teamA || !teamB || scoreA === '' || scoreB === '' || !date) {
      App.showSnackbar('⚠️ Please fill all fields', 'error');
      return;
    }

    if (teamA.toLowerCase() === teamB.toLowerCase()) {
      App.showSnackbar('⚠️ Team names must be different', 'error');
      return;
    }

    try {
      await KreedaDB.addMatchResult({ teamA, teamB, scoreA, scoreB, sport, date });
      await this.loadResults();
      App.closeDialog();
      App.showSnackbar('✅ Match result posted!', 'success');
    } catch (err) {
      App.showSnackbar('❌ Failed to post result', 'error');
      console.error('[Score] Post error:', err);
    }
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
