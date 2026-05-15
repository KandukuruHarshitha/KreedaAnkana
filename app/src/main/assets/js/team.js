/* ===========================================
   KREEDA-ANKANA — Team Profile Module
   Team creation, stats, and match history
   =========================================== */

const TeamModule = {
  currentTeam: null,
  allTeams: [],

  init() {
    this._bindEvents();
    this.loadProfile();
  },

  _bindEvents() {
    document.getElementById('team-create-btn').addEventListener('click', () => {
      this._showCreateDialog();
    });

    document.getElementById('team-edit-btn').addEventListener('click', () => {
      this._showEditDialog();
    });

    document.getElementById('team-switch-btn').addEventListener('click', () => {
      this._showSwitchDialog();
    });

    document.getElementById('team-delete-btn').addEventListener('click', () => {
      this._confirmDelete();
    });
  },

  async loadProfile() {
    try {
      this.allTeams = await KreedaDB.getAllTeams();

      // Load last selected team from SharedPreferences (localStorage)
      const lastTeamId = localStorage.getItem('kreeda_active_team');

      if (lastTeamId) {
        this.currentTeam = await KreedaDB.getTeamProfile(parseInt(lastTeamId));
      }

      if (!this.currentTeam && this.allTeams.length > 0) {
        this.currentTeam = this.allTeams[0];
        localStorage.setItem('kreeda_active_team', this.currentTeam.id);
      }

      this.render();
    } catch (err) {
      console.error('[Team] Failed to load profile:', err);
    }
  },

  render() {
    const profileView = document.getElementById('team-profile-content');
    const emptyView = document.getElementById('team-empty');
    const profileActions = document.getElementById('team-actions');

    if (!this.currentTeam) {
      profileView.style.display = 'none';
      profileActions.style.display = 'none';
      emptyView.style.display = 'block';
      return;
    }

    emptyView.style.display = 'none';
    profileView.style.display = 'block';
    profileActions.style.display = 'flex';

    const team = this.currentTeam;
    const sportIcon = team.sport === 'Cricket' ? '🏏' : '🏐';

    document.getElementById('profile-avatar-icon').textContent = sportIcon;
    document.getElementById('profile-team-name').textContent = team.teamName;
    document.getElementById('profile-captain').textContent = `Captain: ${team.captainName}`;
    document.getElementById('profile-sport-chip').innerHTML =
      team.sport === 'Cricket'
        ? '<span class="chip sport-cricket">🏏 Cricket</span>'
        : '<span class="chip sport-volleyball">🏐 Volleyball</span>';
    document.getElementById('profile-players').textContent = `${team.playerCount} Players`;

    // Stats
    document.getElementById('stat-total').textContent = team.totalMatches || 0;
    document.getElementById('stat-wins').textContent = team.wins || 0;
    document.getElementById('stat-losses').textContent = team.losses || 0;

    // Team count badge
    const switchBtn = document.getElementById('team-switch-btn');
    if (this.allTeams.length > 1) {
      switchBtn.style.display = 'inline-flex';
      switchBtn.innerHTML = `<span class="material-icons-round" style="font-size:16px;">swap_horiz</span> Switch Team (${this.allTeams.length})`;
    } else {
      switchBtn.style.display = 'none';
    }
  },

  _showCreateDialog() {
    App.showDialog(
      '👥 Create Team Profile',
      `<form id="team-create-form">
        <div class="form-group">
          <label class="form-label">Team Name</label>
          <input type="text" class="form-input" id="team-name-input" placeholder="e.g., Village Warriors" required>
        </div>
        <div class="form-group">
          <label class="form-label">Captain Name</label>
          <input type="text" class="form-input" id="team-captain-input" placeholder="e.g., Ravi Kumar" required>
        </div>
        <div class="form-group">
          <label class="form-label">Sport</label>
          <div class="toggle-group" style="margin-top:4px;">
            <button type="button" class="toggle-btn active" data-sport="Cricket" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏏 Cricket</button>
            <button type="button" class="toggle-btn" data-sport="Volleyball" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏐 Volleyball</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Number of Players</label>
          <input type="number" class="form-input" id="team-players-input" placeholder="11" min="2" max="30" required>
        </div>
      </form>`,
      [
        { text: 'Cancel', class: 'btn-outline', action: () => App.closeDialog() },
        { text: 'Create Team', class: 'btn-primary', action: () => this._submitCreate() }
      ]
    );
  },

  async _submitCreate() {
    const teamName = document.getElementById('team-name-input').value.trim();
    const captainName = document.getElementById('team-captain-input').value.trim();
    const sport = document.querySelector('#dialog .toggle-group .toggle-btn.active')?.dataset.sport || 'Cricket';
    const playerCount = document.getElementById('team-players-input').value;

    if (!teamName || !captainName || !playerCount) {
      App.showSnackbar('⚠️ Please fill all fields', 'error');
      return;
    }

    try {
      const team = await KreedaDB.addTeamProfile({ teamName, captainName, sport, playerCount });
      this.currentTeam = team;
      localStorage.setItem('kreeda_active_team', team.id);
      this.allTeams = await KreedaDB.getAllTeams();
      this.render();
      App.closeDialog();
      App.showSnackbar('✅ Team created!', 'success');
    } catch (err) {
      if (err.message === 'TEAM_EXISTS') {
        App.showSnackbar('⚠️ A team with this name already exists', 'error');
      } else {
        App.showSnackbar('❌ Failed to create team', 'error');
        console.error('[Team] Create error:', err);
      }
    }
  },

  _showEditDialog() {
    if (!this.currentTeam) return;
    const t = this.currentTeam;

    App.showDialog(
      '✏️ Edit Team Profile',
      `<form id="team-edit-form">
        <div class="form-group">
          <label class="form-label">Team Name</label>
          <input type="text" class="form-input" id="edit-team-name" value="${this._escapeAttr(t.teamName)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Captain Name</label>
          <input type="text" class="form-input" id="edit-captain" value="${this._escapeAttr(t.captainName)}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Sport</label>
          <div class="toggle-group" style="margin-top:4px;">
            <button type="button" class="toggle-btn ${t.sport === 'Cricket' ? 'active' : ''}" data-sport="Cricket" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏏 Cricket</button>
            <button type="button" class="toggle-btn ${t.sport === 'Volleyball' ? 'active' : ''}" data-sport="Volleyball" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏐 Volleyball</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Number of Players</label>
          <input type="number" class="form-input" id="edit-players" value="${t.playerCount}" min="2" max="30" required>
        </div>
      </form>`,
      [
        { text: 'Cancel', class: 'btn-outline', action: () => App.closeDialog() },
        { text: 'Save Changes', class: 'btn-primary', action: () => this._submitEdit() }
      ]
    );
  },

  async _submitEdit() {
    const teamName = document.getElementById('edit-team-name').value.trim();
    const captainName = document.getElementById('edit-captain').value.trim();
    const sport = document.querySelector('#dialog .toggle-group .toggle-btn.active')?.dataset.sport || 'Cricket';
    const playerCount = document.getElementById('edit-players').value;

    if (!teamName || !captainName || !playerCount) {
      App.showSnackbar('⚠️ Please fill all fields', 'error');
      return;
    }

    try {
      this.currentTeam.teamName = teamName;
      this.currentTeam.captainName = captainName;
      this.currentTeam.sport = sport;
      this.currentTeam.playerCount = parseInt(playerCount);
      await KreedaDB.updateTeamProfile(this.currentTeam);
      this.allTeams = await KreedaDB.getAllTeams();
      this.render();
      App.closeDialog();
      App.showSnackbar('✅ Team updated!', 'success');
    } catch (err) {
      App.showSnackbar('❌ Failed to update team', 'error');
      console.error('[Team] Edit error:', err);
    }
  },

  _showSwitchDialog() {
    if (this.allTeams.length <= 1) return;

    const teamList = this.allTeams.map(t => `
      <div class="card" style="cursor:pointer;${t.id === this.currentTeam?.id ? 'border-color:var(--primary);background:var(--primary-surface);' : ''}"
           onclick="TeamModule._switchToTeam(${t.id})">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="font-size:24px;">${t.sport === 'Cricket' ? '🏏' : '🏐'}</div>
          <div>
            <div class="card-title">${this._escapeHtml(t.teamName)}</div>
            <div class="card-subtitle">${this._escapeHtml(t.captainName)} · ${t.playerCount} players</div>
          </div>
        </div>
      </div>
    `).join('');

    App.showDialog(
      '🔄 Switch Team',
      teamList,
      [{ text: 'Close', class: 'btn-outline', action: () => App.closeDialog() }]
    );
  },

  async _switchToTeam(id) {
    this.currentTeam = await KreedaDB.getTeamProfile(id);
    localStorage.setItem('kreeda_active_team', id);
    this.render();
    App.closeDialog();
    App.showSnackbar(`✅ Switched to ${this.currentTeam.teamName}`, 'success');
  },

  _confirmDelete() {
    if (!this.currentTeam) return;
    App.showDialog(
      '🗑️ Delete Team?',
      `<p>Are you sure you want to delete <strong>${this._escapeHtml(this.currentTeam.teamName)}</strong>?</p>
       <p style="margin-top:8px;color:var(--text-hint);font-size:0.85rem;">This action cannot be undone.</p>`,
      [
        { text: 'Cancel', class: 'btn-outline', action: () => App.closeDialog() },
        { text: 'Delete', class: 'btn-danger', action: () => this._deleteTeam() }
      ]
    );
  },

  async _deleteTeam() {
    try {
      await KreedaDB.deleteTeam(this.currentTeam.id);
      localStorage.removeItem('kreeda_active_team');
      this.currentTeam = null;
      this.allTeams = await KreedaDB.getAllTeams();
      if (this.allTeams.length > 0) {
        this.currentTeam = this.allTeams[0];
        localStorage.setItem('kreeda_active_team', this.currentTeam.id);
      }
      this.render();
      App.closeDialog();
      App.showSnackbar('✅ Team deleted', 'success');
    } catch (err) {
      App.showSnackbar('❌ Failed to delete team', 'error');
    }
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  _escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
};
