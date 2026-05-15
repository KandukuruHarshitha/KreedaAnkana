/* ===========================================
   KREEDA-ANKANA — Challenge Board Module
   Firebase Realtime DB with localStorage fallback
   =========================================== */

const ChallengeModule = {
  challenges: [],
  firebaseAvailable: false,
  dbRef: null,

  init() {
    this._checkFirebase();
    this._bindEvents();
    this.loadChallenges();
  },

  _checkFirebase() {
    try {
      if (typeof firebase !== 'undefined' && firebase.database) {
        this.dbRef = firebase.database().ref('challenges');
        this.firebaseAvailable = true;
        this._listenFirebase();
        console.log('[Challenge] Firebase connected');
      } else {
        throw new Error('Firebase not available');
      }
    } catch (e) {
      this.firebaseAvailable = false;
      console.log('[Challenge] Using localStorage fallback');
    }
  },

  _listenFirebase() {
    if (!this.firebaseAvailable) return;
    this.dbRef.on('value', (snapshot) => {
      const data = snapshot.val();
      this.challenges = data ? Object.entries(data).map(([key, val]) => ({ id: key, ...val })) : [];
      this.challenges.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      this.render();
    });
  },

  _bindEvents() {
    document.getElementById('fab-challenge').addEventListener('click', () => {
      this._showPostDialog();
    });
  },

  // ===== LOCAL STORAGE FALLBACK =====

  _getLocal() {
    try {
      return JSON.parse(localStorage.getItem('kreeda_challenges') || '[]');
    } catch { return []; }
  },

  _saveLocal(challenges) {
    localStorage.setItem('kreeda_challenges', JSON.stringify(challenges));
  },

  // ===== CRUD OPERATIONS =====

  async loadChallenges() {
    if (this.firebaseAvailable) return; // Firebase handles via listener
    this.challenges = this._getLocal();
    this.render();
  },

  async postChallenge(challenge) {
    const data = {
      teamName: challenge.teamName,
      sport: challenge.sport,
      proposedDate: challenge.proposedDate,
      message: challenge.message,
      status: 'Open',
      replies: [],
      createdAt: Date.now()
    };

    if (this.firebaseAvailable) {
      await this.dbRef.push(data);
    } else {
      data.id = 'ch_' + Date.now();
      this.challenges.unshift(data);
      this._saveLocal(this.challenges);
      this.render();
    }
  },

  async replyToChallenge(challengeId, reply) {
    const replyData = {
      responder: reply.responder,
      comment: reply.comment,
      decision: reply.decision,
      timestamp: Date.now()
    };

    if (this.firebaseAvailable) {
      const challengeRef = this.dbRef.child(challengeId);
      const snapshot = await challengeRef.once('value');
      const challenge = snapshot.val();
      const replies = challenge.replies || [];
      replies.push(replyData);

      const newStatus = reply.decision === 'Accept' ? 'Accepted' : challenge.status;
      await challengeRef.update({ replies, status: newStatus });
    } else {
      const challenge = this.challenges.find(c => c.id === challengeId);
      if (challenge) {
        if (!challenge.replies) challenge.replies = [];
        challenge.replies.push(replyData);
        if (reply.decision === 'Accept') challenge.status = 'Accepted';
        this._saveLocal(this.challenges);
        this.render();
      }
    }
  },

  async deleteChallenge(challengeId) {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    if (this.firebaseAvailable) {
      try {
        await this.dbRef.child(challengeId).remove();
        App.showSnackbar('🗑️ Challenge removed', 'success');
      } catch (err) {
        App.showSnackbar('❌ Failed to delete', 'error');
      }
    } else {
      this.challenges = this.challenges.filter(c => c.id !== challengeId);
      this._saveLocal(this.challenges);
      this.render();
      App.showSnackbar('🗑️ Challenge removed', 'success');
    }
  },

  // ===== UI RENDERING =====

  render() {
    const container = document.getElementById('challenges-list');

    if (this.challenges.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons-round icon">sports_kabaddi</span>
          <h3>No Challenges Yet</h3>
          <p>Be the first to post a match challenge! Tap the + button below.</p>
        </div>`;
      return;
    }

    container.innerHTML = this.challenges.map(ch => this._renderCard(ch)).join('');
  },

  _renderCard(ch) {
    const statusClass = ch.status.toLowerCase();
    const sportChip = ch.sport === 'Cricket'
      ? '<span class="chip sport-cricket">🏏 Cricket</span>'
      : '<span class="chip sport-volleyball">🏐 Volleyball</span>';

    let repliesHtml = '';
    if (ch.replies && ch.replies.length > 0) {
      repliesHtml = `<div class="challenge-replies">
        <div style="font-size:0.7rem;font-weight:600;margin-bottom:6px;color:var(--text-hint);">REPLIES</div>
        ${ch.replies.map(r => `
          <div class="reply-item">
            <span class="reply-name">${this._escapeHtml(r.responder)}</span>:
            <span class="reply-decision ${r.decision.toLowerCase()}">${r.decision}</span>
            ${r.comment ? ` — "${this._escapeHtml(r.comment)}"` : ''}
          </div>
        `).join('')}
      </div>`;
    }

    return `
      <div class="card challenge-card status-${statusClass}">
        <div class="card-header">
          <div style="flex:1">
            <div class="card-title">${this._escapeHtml(ch.teamName)}</div>
            <div class="card-subtitle">${ch.proposedDate || 'Date TBD'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${sportChip}
            <button class="btn-icon" style="color:var(--text-hint);background:transparent;border:none;cursor:pointer;" onclick="ChallengeModule.deleteChallenge('${ch.id}')" title="Delete">
              <span class="material-icons-round" style="font-size:18px;">delete</span>
            </button>
          </div>
        </div>
        <div class="challenge-msg">"${this._escapeHtml(ch.message)}"</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span class="challenge-status ${statusClass}">${ch.status}</span>
          ${ch.status === 'Open' ? `
            <button class="btn btn-accent btn-small" onclick="ChallengeModule._showReplyDialog('${ch.id}')">
              <span class="material-icons-round" style="font-size:16px;">reply</span> Reply
            </button>
          ` : ''}
        </div>
        ${repliesHtml}
      </div>`;
  },

  // ===== DIALOGS =====

  _showPostDialog() {
    App.showDialog(
      '⚔️ Post a Challenge',
      `<form id="challenge-post-form">
        <div class="form-group">
          <label class="form-label">Team Name</label>
          <input type="text" class="form-input" id="ch-team" placeholder="Enter your team name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Sport</label>
          <div class="toggle-group" style="margin-top:4px;">
            <button type="button" class="toggle-btn active" data-sport="Cricket" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏏 Cricket</button>
            <button type="button" class="toggle-btn" data-sport="Volleyball" onclick="this.parentElement.querySelectorAll('.toggle-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">🏐 Volleyball</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Proposed Date</label>
          <input type="date" class="form-input" id="ch-date" required>
        </div>
        <div class="form-group">
          <label class="form-label">Message</label>
          <input type="text" class="form-input" id="ch-message" placeholder="e.g., Looking for a friendly cricket match!" required>
        </div>
      </form>`,
      [
        { text: 'Cancel', class: 'btn-outline', action: () => App.closeDialog() },
        { text: 'Post Challenge', class: 'btn-accent', action: () => this._submitChallenge() }
      ]
    );

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('ch-date').min = today;
    document.getElementById('ch-date').value = today;
  },

  async _submitChallenge() {
    const teamName = document.getElementById('ch-team').value.trim();
    const sport = document.querySelector('#dialog .toggle-group .toggle-btn.active')?.dataset.sport || 'Cricket';
    const proposedDate = document.getElementById('ch-date').value;
    const message = document.getElementById('ch-message').value.trim();

    if (!teamName || !proposedDate || !message) {
      App.showSnackbar('⚠️ Please fill all fields', 'error');
      return;
    }

    try {
      await this.postChallenge({ teamName, sport, proposedDate, message });
      App.closeDialog();
      App.showSnackbar('✅ Challenge posted!', 'success');
    } catch (err) {
      App.showSnackbar('❌ Failed to post challenge', 'error');
      console.error('[Challenge] Post error:', err);
    }
  },

  _showReplyDialog(challengeId) {
    App.showDialog(
      '💬 Reply to Challenge',
      `<form id="challenge-reply-form">
        <div class="form-group">
          <label class="form-label">Your Team Name</label>
          <input type="text" class="form-input" id="reply-team" placeholder="Enter your team name" required>
        </div>
        <div class="form-group">
          <label class="form-label">Comment (optional)</label>
          <input type="text" class="form-input" id="reply-comment" placeholder="e.g., We accept! See you on the ground!">
        </div>
        <div class="form-group">
          <label class="form-label">Decision</label>
          <div style="display:flex;gap:8px;margin-top:4px;">
            <button type="button" class="btn btn-primary btn-small reply-decision active" data-decision="Accept" onclick="document.querySelectorAll('.reply-decision').forEach(b=>{b.classList.remove('active');b.style.opacity='0.5'});this.classList.add('active');this.style.opacity='1'">✅ Accept</button>
            <button type="button" class="btn btn-danger btn-small reply-decision" data-decision="Decline" style="opacity:0.5" onclick="document.querySelectorAll('.reply-decision').forEach(b=>{b.classList.remove('active');b.style.opacity='0.5'});this.classList.add('active');this.style.opacity='1'">❌ Decline</button>
          </div>
        </div>
      </form>`,
      [
        { text: 'Cancel', class: 'btn-outline', action: () => App.closeDialog() },
        { text: 'Send Reply', class: 'btn-primary', action: () => this._submitReply(challengeId) }
      ]
    );
  },

  async _submitReply(challengeId) {
    const responder = document.getElementById('reply-team').value.trim();
    const comment = document.getElementById('reply-comment').value.trim();
    const decision = document.querySelector('.reply-decision.active')?.dataset.decision || 'Accept';

    if (!responder) {
      App.showSnackbar('⚠️ Please enter your team name', 'error');
      return;
    }

    try {
      await this.replyToChallenge(challengeId, { responder, comment, decision });
      App.closeDialog();
      App.showSnackbar(`✅ Reply sent — ${decision}ed!`, 'success');
    } catch (err) {
      App.showSnackbar('❌ Failed to send reply', 'error');
      console.error('[Challenge] Reply error:', err);
    }
  },

  _escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};
