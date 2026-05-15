/* ===========================================
   KREEDA-ANKANA — Booking Module
   Slot booking with double-booking prevention
   =========================================== */

const BookingModule = {
  selectedDate: '',
  selectedSlot: '',
  selectedSport: 'Cricket',

  init() {
    this._bindEvents();
  },

  _bindEvents() {
    document.getElementById('booking-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitBooking();
    });

    document.getElementById('booking-back').addEventListener('click', () => {
      this.closeBooking();
    });

    document.querySelectorAll('.booking-sport-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.booking-sport-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSport = btn.dataset.sport;
      });
    });
  },

  openBooking(date, timeSlot, sport) {
    this.selectedDate = date;
    this.selectedSlot = timeSlot;
    this.selectedSport = sport;

    // Update UI
    const dateObj = new Date(date + 'T00:00:00');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('booking-date-display').textContent = dateObj.toLocaleDateString('en-IN', options);
    document.getElementById('booking-time-display').textContent = this._getTimeLabel(timeSlot);
    document.getElementById('booking-date-input').value = date;

    // Set sport toggle
    document.querySelectorAll('.booking-sport-toggle .toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sport === sport);
    });

    // Clear form
    document.getElementById('booking-team-name').value = '';
    this._clearErrors();

    // Switch view
    App.showView('booking');
  },

  closeBooking() {
    App.showView('calendar');
    CalendarModule.render();
  },

  _getTimeLabel(slot) {
    const labels = {
      'Morning': '🌅 Morning (6:00 AM – 12:00 PM)',
      'Afternoon': '☀️ Afternoon (12:00 PM – 5:00 PM)',
      'Evening': '🌙 Evening (5:00 PM – 9:00 PM)'
    };
    return labels[slot] || slot;
  },

  _clearErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
  },

  async submitBooking() {
    this._clearErrors();
    const teamName = document.getElementById('booking-team-name').value.trim();

    // Validation
    if (!teamName) {
      document.getElementById('booking-team-name').classList.add('error');
      document.getElementById('booking-team-error').textContent = 'Please enter a team name';
      return;
    }

    if (teamName.length < 2) {
      document.getElementById('booking-team-name').classList.add('error');
      document.getElementById('booking-team-error').textContent = 'Team name must be at least 2 characters';
      return;
    }

    const submitBtn = document.getElementById('booking-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;"></span> Booking...';

    try {
      await KreedaDB.addBooking({
        teamName: teamName,
        sport: this.selectedSport,
        date: this.selectedDate,
        timeSlot: this.selectedSlot
      });

      App.showSnackbar('✅ Ground booked successfully!', 'success');
      this.closeBooking();
    } catch (err) {
      if (err.message === 'SLOT_TAKEN') {
        App.showDialog(
          '🚫 Slot Already Taken!',
          `<p>This time slot is already booked by another team.</p>
           <p style="margin-top:8px;color:var(--text-hint);font-size:0.85rem;">
             Please choose a different time slot or date.
           </p>`,
          [{ text: 'OK', class: 'btn-primary', action: () => App.closeDialog() }]
        );
      } else {
        App.showSnackbar('❌ Booking failed. Please try again.', 'error');
        console.error('[Booking] Error:', err);
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="material-icons-round">check_circle</span> Confirm Booking';
    }
  }
};
