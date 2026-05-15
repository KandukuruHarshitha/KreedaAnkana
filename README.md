<div align="center">

# 🏏 Kreeda-Ankana
### Village Sports Ground Organizer

[![Android](https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Language-Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![MVVM](https://img.shields.io/badge/Architecture-MVVM-blue?style=for-the-badge)](https://developer.android.com/topic/architecture)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-orange?style=for-the-badge)](https://github.com/KandukuruHarshitha/KreedaAnkana/releases)
[![MinSDK](https://img.shields.io/badge/MinSDK-24%20(Android%207.0)-brightgreen?style=for-the-badge)](https://developer.android.com/studio/releases/platforms)

> *Kreeda (क्रीडा) = Sports | Ankana (अंकन) = Organizer/Tracking*
>
> **A smart, centralized Android platform that eliminates booking conflicts and improves sports coordination for village cricket and volleyball teams.**

[📥 Download APK](#-apk-download) • [📸 Screenshots](#-screenshots) • [🚀 Quick Start](#-installation--quick-start) • [🤝 Contribute](#-contributing)

</div>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Installation & Quick Start](#-installation--quick-start)
- [APK Download & Installation](#-apk-download--installation)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🔍 Problem Statement

Village sports teams face daily challenges:
- ❌ **Double-bookings** — multiple teams book the same ground at the same time
- ❌ **No digital coordination** — scheduling happens over informal phone calls
- ❌ **Lost match history** — scores and results are never recorded
- ❌ **No challenge system** — teams have no formal way to challenge each other
- ❌ **Poor communication** — announcements about matches reach players too late

**Kreeda-Ankana** solves all of these with a single, easy-to-use Android application built specifically for village-level sports infrastructure.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏟️ **Ground Booking** | Book cricket/volleyball grounds with conflict detection |
| 📅 **Match Scheduler** | Schedule and manage local match fixtures |
| 🏆 **Challenge Board** | Teams can challenge other teams digitally |
| 📊 **Score Wall** | Live and historical match scores for all teams |
| 👥 **Team Management** | Register and manage village cricket & volleyball teams |
| 📣 **Announcements** | Push match updates and ground availability notices |
| 📱 **Offline Support** | Room Database caching for offline access |
| 🌐 **Real-time Sync** | Firebase Realtime Database for live collaboration |
| 🔐 **User Profiles** | SharedPreferences-based player & organizer profiles |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Kotlin |
| **IDE** | Android Studio |
| **Min SDK** | API 24 (Android 7.0 Nougat) |
| **Target SDK** | API 36 |
| **Architecture** | MVVM (Model-View-ViewModel) |
| **Remote Database** | Firebase Realtime Database |
| **Local Database** | Room Database |
| **UI Components** | RecyclerView, ViewPager2 |
| **Layouts** | XML with ConstraintLayout |
| **Navigation** | SharedPreferences, Intent-based |
| **Build System** | Gradle (Kotlin DSL) |

---

## 🏗️ Architecture

Kreeda-Ankana follows the **MVVM Clean Architecture** pattern:

```
┌─────────────────────────────────────┐
│              UI Layer               │
│   Activities  ·  Fragments  ·  XML  │
└────────────────┬────────────────────┘
                 │ observes
┌────────────────▼────────────────────┐
│           ViewModel Layer           │
│   LiveData  ·  StateFlow  ·  Logic  │
└────────────────┬────────────────────┘
                 │ requests
┌────────────────▼────────────────────┐
│          Repository Layer           │
│   Single source of truth            │
└──────┬─────────────────────┬────────┘
       │                     │
┌──────▼──────┐     ┌────────▼────────┐
│   Firebase  │     │  Room Database  │
│  Realtime   │     │  (Offline Cache)│
│  Database   │     │                 │
└─────────────┘     └─────────────────┘
```

---

## 📁 Project Structure

```
KreedaAnkana/
├── 📄 README.md                    ← You are here
├── 📄 .gitignore                   ← Git exclusions
├── 📄 build.gradle.kts             ← Root build config
├── 📄 settings.gradle.kts          ← Project settings
├── 📄 gradle.properties            ← Gradle properties
├── 📄 gradlew / gradlew.bat        ← Gradle wrapper scripts
│
├── 📁 gradle/
│   ├── libs.versions.toml          ← Version catalog
│   └── wrapper/
│       └── gradle-wrapper.properties
│
├── 📁 app/
│   ├── 📄 build.gradle.kts         ← App-level build config
│   ├── 📄 proguard-rules.pro       ← ProGuard/R8 rules
│   │
│   └── 📁 src/
│       ├── 📁 main/
│       │   ├── 📄 AndroidManifest.xml
│       │   ├── 📁 java/com/example/kreeda_ankana/
│       │   │   ├── MainActivity.kt
│       │   │   ├── 📁 model/       ← Data classes
│       │   │   ├── 📁 viewmodel/   ← ViewModels
│       │   │   ├── 📁 repository/  ← Data repositories
│       │   │   ├── 📁 ui/          ← Fragments & Adapters
│       │   │   └── 📁 utils/       ← Helpers & extensions
│       │   ├── 📁 res/
│       │   │   ├── 📁 layout/      ← XML layouts
│       │   │   ├── 📁 drawable/    ← Icons & images
│       │   │   ├── 📁 values/      ← Colors, strings, themes
│       │   │   └── 📁 mipmap-*/    ← App icons
│       │   └── 📁 assets/
│       ├── 📁 test/                ← Unit tests
│       └── 📁 androidTest/         ← Instrumented tests
│
├── 📁 screenshots/                 ← App screenshots
└── 📁 docs/                        ← Additional documentation
```

---

## 📸 Screenshots

> Screenshots will be added after first release build.

| Home / Dashboard | Ground Booking | Score Wall |
|:---:|:---:|:---:|
| *Coming soon* | *Coming soon* | *Coming soon* |

| Challenge Board | Team Management | Match Schedule |
|:---:|:---:|:---:|
| *Coming soon* | *Coming soon* | *Coming soon* |

---

## 🚀 Installation & Quick Start

### Prerequisites

| Tool | Version |
|---|---|
| Android Studio | Hedgehog (2023.1.1) or newer |
| JDK | 11 or higher |
| Android SDK | API 36 |
| Kotlin | 1.9+ |
| Git | Latest |

### Clone & Run

```bash
# 1. Clone the repository
git clone https://github.com/KandukuruHarshitha/KreedaAnkana.git

# 2. Open in Android Studio
#    File → Open → Select the cloned folder

# 3. Sync Gradle (Android Studio will prompt automatically)
#    Or run: ./gradlew build

# 4. Run on device or emulator
#    Click ▶ Run or press Shift + F10
```

### Firebase Setup (if using Firebase features)

```
1. Go to https://console.firebase.google.com
2. Create a new project: "Kreeda-Ankana"
3. Add an Android app with package: com.example.kreeda_ankana
4. Download google-services.json
5. Place it in: app/google-services.json
6. Enable Realtime Database in Firebase Console
7. Sync project in Android Studio
```

---

## 📥 APK Download & Installation

### Download
| Build Type | Link | Notes |
|---|---|---|
| Debug APK | [Download Debug APK](https://github.com/KandukuruHarshitha/KreedaAnkana/releases/latest) | For testing — no signing required |
| Release APK | [Download Release APK](https://github.com/KandukuruHarshitha/KreedaAnkana/releases/latest) | Optimized production build |

### Install on Android Device

```
Step 1: Download the APK file to your Android phone
Step 2: Go to Settings → Security → Enable "Unknown Sources"
         (or "Install unknown apps" on Android 8.0+)
Step 3: Open the downloaded APK file
Step 4: Tap "Install"
Step 5: Launch Kreeda-Ankana from your app drawer
```

> ⚠️ **Note:** Enable "Unknown Sources" only for trusted APKs. Disable after installation for security.

---

## 🔮 Future Enhancements

- [ ] 🔔 Push Notifications (FCM) for match reminders
- [ ] 📍 Google Maps integration for ground location
- [ ] 📸 Photo gallery for match moments
- [ ] 📊 Player statistics and leaderboards
- [ ] 🌐 Multi-language support (Hindi, Kannada, Marathi)
- [ ] 💬 In-app team chat
- [ ] 🏅 Trophies & achievement badges
- [ ] ☁️ Cloud backup & data export
- [ ] 🌙 Dark mode support
- [ ] ⌚ Wear OS companion app

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/KreedaAnkana.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name

# 4. Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Open a Pull Request on GitHub
```

### Commit Message Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation update
style:    Code formatting
refactor: Code restructuring
test:     Adding tests
chore:    Build / config changes
```

---

## 📜 License

```
MIT License

Copyright (c) 2024 Harshitha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

See the full [LICENSE](LICENSE) file.

---

## 👩‍💻 Author

<div align="center">

**Harshitha**

[![GitHub](https://img.shields.io/badge/GitHub-@KandukuruHarshitha-181717?style=for-the-badge&logo=github)](https://github.com/KandukuruHarshitha)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yourprofile)

*Developed as part of the MindMatrix Android Development Internship Program*

---

⭐ **If this project helped you, please give it a star!** ⭐

</div>