/* ===========================================
   KREEDA-ANKANA — Ground Calendar Module
   Weekly grid calendar with color-coded slots
   =========================================== */

const CalendarModule = {
  currentWeekStart: null,
  selectedSport: 'Cricket',
  bookings: [],

  init() {
    this.currentWeekStart = this._getMonday(new Date());
    this._bindEvents();
    this.render();
  },

  _getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  _formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  _formatDisplayDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  },

  _getDayName(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  },

  _isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  _getWeekDates() {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(this.currentWeekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  },

  _bindEvents() {
    document.getElementById('cal-prev').addEventListener('click', () => {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() - 7);
      this.render();
    });

    document.getElementById('cal-next').addEventListener('click', () => {
      this.currentWeekStart.setDate(this.currentWeekStart.getDate() + 7);
      this.render();
    });

    document.getElementById('cal-today').addEventListener('click', () => {
      this.currentWeekStart = this._getMonday(new Date());
      this.render();
    });

    document.querySelectorAll('.sport-toggle .toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sport-toggle .toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedSport = btn.dataset.sport;
        this.render();
      });
    });
  },

  async loadBookings() {
    try {
      const weekDates = this._getWeekDates();
      const startDate = this._formatDate(weekDates[0]);
      const endDate = this._formatDate(weekDates[6]);
      this.bookings = await KreedaDB.getBookingsForDateRange(startDate, endDate);
    } catch (err) {
      console.error('[Calendar] Failed to load bookings:', err);
      this.bookings = [];
    }
  },

  _getSlotStatus(date, timeSlot) {
    const dateStr = this._formatDate(date);
    const booking = this.bookings.find(b => b.date === dateStr && b.timeSlot === timeSlot);
    if (booking) {
      return { status: 'booked', booking };
    }
    // Past slots
    const now = new Date();
    const slotEnd = new Date(date);
    if (timeSlot === 'Morning') slotEnd.setHours(12, 0, 0);
    else if (timeSlot === 'Afternoon') slotEnd.setHours(17, 0, 0);
    else slotEnd.setHours(21, 0, 0);

    if (slotEnd < now) {
      return { status: 'past', booking: null };
    }
    return { status: 'available', booking: null };
  },

  async render() {
    await this.loadBookings();
    const weekDates = this._getWeekDates();
    const grid = document.getElementById('calendar-grid');
    const weekLabel = document.getElementById('cal-week-label');
    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    const timeLabels = ['🌅 6AM-12PM', '☀️ 12PM-5PM', '🌙 5PM-9PM'];

    // Update week label
    const startStr = this._formatDisplayDate(weekDates[0]);
    const endStr = this._formatDisplayDate(weekDates[6]);
    weekLabel.textContent = `${startStr} — ${endStr}`;

    // Build grid HTML
    let html = '';

    // Header row (empty corner + 7 day headers)
    html += '<div class="cal-header-cell"></div>';
    weekDates.forEach(date => {
      const isToday = this._isToday(date);
      html += `<div class="cal-header-cell ${isToday ? 'today-col' : ''}">
        <div>${this._getDayName(date)}</div>
        <div style="font-size:0.8rem;font-weight:700;${isToday ? 'color:var(--primary);' : ''}">${date.getDate()}</div>
      </div>`;
    });

    // Time slot rows
    timeSlots.forEach((slot, si) => {
      html += `<div class="cal-time-label">${timeLabels[si]}</div>`;
      weekDates.forEach(date => {
        const { status, booking } = this._getSlotStatus(date, slot);
        const dateStr = this._formatDate(date);
        let slotClass = 'available';
        let icon = 'event_available';
        let text = 'Free';

        if (status === 'booked') {
          slotClass = 'booked';
          icon = 'event_busy';
          text = booking.teamName.substring(0, 8);
        } else if (status === 'past') {
          slotClass = 'booked';
          icon = 'history';
          text = 'Past';
        }

        let clickable = '';
        if (status === 'available') {
          clickable = `onclick="CalendarModule.onSlotClick('${dateStr}','${slot}')"`;
        } else if (status === 'booked') {
          clickable = `onclick="CalendarModule.onBookedSlotClick(${booking.id})"`;
        }

        html += `<div class="cal-slot ${slotClass}" ${clickable}>
          <span class="material-icons-round slot-icon">${icon}</span>
          <span class="slot-text">${text}</span>
        </div>`;
      });
    });

    grid.innerHTML = html;
  },

  onSlotClick(date, timeSlot) {
    BookingModule.openBooking(date, timeSlot, this.selectedSport);
  },

  async onBookedSlotClick(bookingId) {
    if (confirm('Do you want to cancel this booking and free up the slot?')) {
      try {
        await KreedaDB.deleteBooking(bookingId);
        App.showSnackbar('✅ Booking cancelled', 'success');
        this.render();
      } catch (err) {
        App.showSnackbar('❌ Failed to cancel booking', 'error');
        console.error('[Calendar] Cancel error:', err);
      }
    }
  }
};
