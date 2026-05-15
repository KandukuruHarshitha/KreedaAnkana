# Kreeda-Ankana 🏟️

**Regional Village Sports Ground Organizer**

> *Your Village. Your Ground. Your Game.*

A digital sports coordination platform for villages that helps local teams organize ground usage, schedule matches, and build a stronger sports culture.

---

## 📱 Features

| Feature | Description |
|---------|-------------|
| **Ground Calendar** | Weekly grid calendar with color-coded slots (Green = Available, Red = Booked) |
| **Slot Booking** | Book ground time slots with double-booking prevention |
| **Challenge Board** | Post and reply to match challenges (Firebase real-time sync) |
| **Score Wall** | Display match results with winner highlighting in gold |
| **Team Profile** | Create team profiles with match stats tracking |
| **Dark Mode** | Toggle between light and dark themes |

---

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox).

### Option 2: Local Server (Recommended)
```bash
# Using Python
cd web-app
python -m http.server 8080

# Using Node.js
npx serve .

# Using VS Code
# Install "Live Server" extension → Right-click index.html → Open with Live Server
```

Then visit `http://localhost:8080`

---

## 🔥 Firebase Setup (Optional — for Real-Time Challenge Board)

Without Firebase, the Challenge Board works using **localStorage** (data stays on one device). To enable **real-time sync across devices**:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" → Enter project name → Create
3. Go to **Realtime Database** → Create Database → Start in **test mode**

### Step 2: Get Config
1. Go to Project Settings → General → Your apps → Add Web app
2. Copy the Firebase config object

### Step 3: Update index.html
Uncomment the Firebase script section at the bottom of `index.html` and paste your config:

```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
<script>
  firebase.initializeApp({
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  });
</script>
```

### Step 4: Set Database Rules (for testing)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

> ⚠️ For production, implement proper security rules.

---

## 📂 Project Structure

```
web-app/
├── index.html          # Main HTML (all 6 screens)
├── css/
│   └── styles.css      # Complete design system
├── js/
│   ├── db.js           # IndexedDB database layer (replaces Room DB)
│   ├── calendar.js     # Ground Calendar module
│   ├── booking.js      # Slot Booking module
│   ├── challenge.js    # Challenge Board (Firebase + fallback)
│   ├── score.js        # Score Wall module
│   ├── team.js         # Team Profile module
│   └── app.js          # Main app controller
└── README.md           # This file
```

---

## 🏗️ Architecture

This app follows a **modular MVC-like** pattern (equivalent to MVVM in Android):

- **Model Layer**: `db.js` — IndexedDB for local storage, Firebase for real-time data
- **View Layer**: `index.html` + `styles.css` — Screen structures and styling
- **Controller/ViewModel Layer**: `calendar.js`, `booking.js`, `challenge.js`, `score.js`, `team.js` — Business logic and UI rendering

---

## 🎯 Success Criteria

- [x] Ground Calendar renders with color-coded slots
- [x] Slot booking saves to IndexedDB and calendar updates
- [x] Double booking blocked with error dialog
- [x] Challenge Board with real-time Firebase support
- [x] Score Wall displays results sorted by most recent
- [x] Team Profile saves and retrieves data
- [x] App launches in under 3 seconds
- [x] No crashes — all critical code wrapped in try/catch
- [x] Full booking → challenge → match result flow works
- [x] UI is polished and professional

---

## 👩‍💻 Student Info

- **Student**: Kandukuru Harshitha (4MW22CS072)
- **App**: Kreeda-Ankana v1.0
- **Date**: April 2026

---

## 📄 License

This project is for educational purposes — Maharaja Institute of Technology, Mysore.
