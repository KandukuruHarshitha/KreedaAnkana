/* ===========================================
   KREEDA-ANKANA — IndexedDB Database Layer
   Replaces Room DB for web implementation
   =========================================== */

const KreedaDB = {
  DB_NAME: 'kreeda_ankana_db',
  DB_VERSION: 1,
  db: null,

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // Bookings store
        if (!db.objectStoreNames.contains('bookings')) {
          const store = db.createObjectStore('bookings', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by_date', 'date', { unique: false });
          store.createIndex('by_date_slot', ['date', 'timeSlot'], { unique: false });
        }

        // Match Results store
        if (!db.objectStoreNames.contains('matchResults')) {
          const store = db.createObjectStore('matchResults', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by_date', 'date', { unique: false });
        }

        // Team Profiles store
        if (!db.objectStoreNames.contains('teamProfiles')) {
          const store = db.createObjectStore('teamProfiles', { keyPath: 'id', autoIncrement: true });
          store.createIndex('by_name', 'teamName', { unique: true });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('[KreedaDB] Database initialized');
        resolve(this.db);
      };
    });
  },

  _tx(storeName, mode = 'readonly') {
    const tx = this.db.transaction(storeName, mode);
    return tx.objectStore(storeName);
  },

  // ===== BOOKING OPERATIONS =====

  async checkSlotAvailable(date, timeSlot) {
    return new Promise((resolve, reject) => {
      const store = this._tx('bookings');
      const index = store.index('by_date_slot');
      const request = index.getAll([date, timeSlot]);
      request.onsuccess = () => resolve(request.result.length === 0);
      request.onerror = () => reject(request.error);
    });
  },

  async addBooking(booking) {
    const available = await this.checkSlotAvailable(booking.date, booking.timeSlot);
    if (!available) {
      throw new Error('SLOT_TAKEN');
    }
    return new Promise((resolve, reject) => {
      const store = this._tx('bookings', 'readwrite');
      const data = {
        teamName: booking.teamName,
        sport: booking.sport,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: 'Booked',
        createdAt: new Date().toISOString()
      };
      const request = store.add(data);
      request.onsuccess = () => resolve({ ...data, id: request.result });
      request.onerror = () => reject(request.error);
    });
  },

  async getBookingsForDateRange(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const store = this._tx('bookings');
      const index = store.index('by_date');
      const range = IDBKeyRange.bound(startDate, endDate);
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllBookings() {
    return new Promise((resolve, reject) => {
      const store = this._tx('bookings');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteBooking(id) {
    return new Promise((resolve, reject) => {
      const store = this._tx('bookings', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // ===== MATCH RESULT OPERATIONS =====

  async addMatchResult(result) {
    return new Promise((resolve, reject) => {
      const store = this._tx('matchResults', 'readwrite');
      const data = {
        teamA: result.teamA,
        teamB: result.teamB,
        scoreA: parseInt(result.scoreA),
        scoreB: parseInt(result.scoreB),
        sport: result.sport,
        date: result.date,
        winner: parseInt(result.scoreA) > parseInt(result.scoreB) ? result.teamA :
                parseInt(result.scoreB) > parseInt(result.scoreA) ? result.teamB : 'Draw',
        createdAt: new Date().toISOString()
      };
      const request = store.add(data);
      request.onsuccess = () => {
        resolve({ ...data, id: request.result });
        // Update team stats
        this._updateTeamStats(data);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async getAllMatchResults() {
    return new Promise((resolve, reject) => {
      const store = this._tx('matchResults');
      const request = store.getAll();
      request.onsuccess = () => {
        const results = request.result.sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async deleteMatchResult(id) {
    return new Promise((resolve, reject) => {
      const store = this._tx('matchResults', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // ===== TEAM PROFILE OPERATIONS =====

  async addTeamProfile(profile) {
    return new Promise((resolve, reject) => {
      const store = this._tx('teamProfiles', 'readwrite');
      const data = {
        teamName: profile.teamName,
        captainName: profile.captainName,
        sport: profile.sport,
        playerCount: parseInt(profile.playerCount),
        wins: 0,
        losses: 0,
        totalMatches: 0,
        createdAt: new Date().toISOString()
      };
      const request = store.add(data);
      request.onsuccess = () => resolve({ ...data, id: request.result });
      request.onerror = () => {
        if (request.error.name === 'ConstraintError') {
          reject(new Error('TEAM_EXISTS'));
        } else {
          reject(request.error);
        }
      };
    });
  },

  async updateTeamProfile(profile) {
    return new Promise((resolve, reject) => {
      const store = this._tx('teamProfiles', 'readwrite');
      const request = store.put(profile);
      request.onsuccess = () => resolve(profile);
      request.onerror = () => reject(request.error);
    });
  },

  async getTeamProfile(id) {
    return new Promise((resolve, reject) => {
      const store = this._tx('teamProfiles');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getTeamByName(name) {
    return new Promise((resolve, reject) => {
      const store = this._tx('teamProfiles');
      const index = store.index('by_name');
      const request = index.get(name);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllTeams() {
    return new Promise((resolve, reject) => {
      const store = this._tx('teamProfiles');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteTeam(id) {
    return new Promise((resolve, reject) => {
      const store = this._tx('teamProfiles', 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // ===== INTERNAL HELPERS =====

  async _updateTeamStats(matchResult) {
    try {
      const teamA = await this.getTeamByName(matchResult.teamA);
      const teamB = await this.getTeamByName(matchResult.teamB);

      if (teamA) {
        teamA.totalMatches++;
        if (matchResult.winner === matchResult.teamA) teamA.wins++;
        else if (matchResult.winner !== 'Draw') teamA.losses++;
        await this.updateTeamProfile(teamA);
      }

      if (teamB) {
        teamB.totalMatches++;
        if (matchResult.winner === matchResult.teamB) teamB.wins++;
        else if (matchResult.winner !== 'Draw') teamB.losses++;
        await this.updateTeamProfile(teamB);
      }
    } catch (err) {
      console.warn('[KreedaDB] Could not update team stats:', err);
    }
  }
};
