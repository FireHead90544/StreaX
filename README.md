# 🔥 StreaX - Gamified Productivity Tracker

<div align="center">

<img src="https://raw.githubusercontent.com/FireHead90544/streax/main/public/icon-512.png" alt="StreaX Logo" width="128" height="128">

**Track your productivity. Build streaks. Stay consistent.**

> I built this for personal use. Feel free to fork & customize to your liking.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple?style=for-the-badge)](https://web.dev/progressive-web-apps/)

[Live Demo](https://trystreax.vercel.app/) • [Features](#-features) • [Installation](#-installation) • [Contributing](#-contributing)

</div>

---

## 📖 About

**StreaX** is a gamified productivity tracking app that helps you stay consistent with your goals through:
- 🎯 **Pomodoro Sessions** - Focus timer with customizable intervals
- 🔥 **Streak Tracking** - Build daily habits and maintain momentum
- 🏆 **Rewards System** - Earn streak savers and backlog savers
- 📊 **Detailed Insights** - Visualize your productivity over time
- 💾 **Local-First** - All data stored locally with backup/restore
- 📱 **PWA Support** - Install as a native app on any device w/ offline access

---

## ✨ Features

### 🎮 Gamification

- **Streak System**: Daily streak counter with milestone rewards
- **Savers**: 
  - **Streak Savers**: Skip a day without breaking your streak (earn every 7 days)
  - **Backlog Savers**: Convert unused daily minutes into emergency reserves
- **Milestones**: Unlock rewards at 7, 30, 100, 365, and 1000 days
- **System Notifications**: Get daily reminders at 9 AM and evening goal checks at 7 PM

### ⏱️ Pomodoro Timer

- Fully customizable work/break intervals
- Preset configurations (25/5, 50/10, 90/15)
- Session history with notes
- **Smart Persistence**: Timer continues even if you navigate away or close the tab
- Today's progress tracking
- Visual timer with retro design

### 📈 Insights Dashboard

- **This Day** view with detailed stats
- **This Week/Month/All** time aggregations
- **Interactive Charts**: Beautiful Area Charts powered by **Retro UI**
- Hour-by-hour breakdown
- Daily notes and session logs
- Completion rate tracking
- Best day highlighting

### 🎨 Retro UI Design

> Thanks to [Retro UI](https://retroui.dev/)

- Bold, vibrant 80s/90s aesthetic
- High-contrast color scheme
- Pixel-perfect borders and shadows
- Smooth animations and transitions
- Dark/Light mode support

### 💾 Data Management

- **Local Storage**: All data stays on your device (Note: Be sure to backup your data manually, periodic backup is recommended)
- **Export/Import**: JSON backup system
- **No Server Required**: Works completely offline
- **Privacy-First**: Zero data collection

### 📱 Progressive Web App

- **Installable**: Add to home screen on any device
- **Offline Support**: Service worker caching
- **Desktop & Mobile**: Optimized for all screen sizes
- **Platform-Specific Instructions**: iOS, Android, Desktop

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**

### Local Development

```bash
# Clone the repository
git clone https://github.com/FireHead90544/StreaX.git
cd StreaX

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### PWA Installation

#### Desktop (Chrome/Edge)
1. Visit the deployed app
2. Click the install icon in the address bar
3. Or go to Settings → Install App

#### Mobile (Android)
1. Open in Chrome browser
2. Tap the menu (⋮)
3. Select "Install app" or "Add to Home Screen"

#### Mobile (iOS)
1. Open in Safari
2. Tap the Share button (□↑)
3. Scroll and tap "Add to Home Screen"
4. Tap "Add"

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Utility-first styling
- **Tailwind CSS 3** - Utility-first styling
- **Retro UI** - Neo-brutalism components (@retroui)
- **Recharts** - Composable charting library

### Features
- **Service Workers** - Offline caching
- **Local Storage API** - Data persistence
- **PWA Manifest** - App installation
- **SEO Optimized** - Open Graph, Twitter Cards

### Fonts
- **Archivo Black** - Display headings
- **Space Grotesk** - Body text

---

## 📂 Project Structure

```
streax/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Dashboard
│   ├── pomodoro/          # Pomodoro timer
│   ├── insights/          # Analytics & insights
│   ├── settings/          # Settings & data management
│   ├── tips/              # Productivity tips
│   ├── notifications/     # Notification center
│   ├── onboarding/        # First-time setup
│   └── layout.tsx         # Root layout with metadata
├── components/
│   ├── layout/            # Navigation & page structure
│   ├── retroui/           # Custom retro UI components
│   ├── charts/            # Chart components
│   └── PWAInstaller.tsx   # PWA install handler
├── lib/
│   ├── storage.ts         # Local storage utilities
│   ├── streak.ts          # Streak calculation logic
│   ├── notifications.ts   # Notification management
│   └── formatters.ts      # Date/time formatting
├── public/
│   ├── sw.js              # Service worker
│   ├── manifest.json      # PWA manifest
│   ├── icon-*.png         # App icons
│   └── og.png             # Social media preview
└── types/
    └── index.ts           # TypeScript definitions
```

---

## 🎯 Usage

### First Time Setup

1. **Onboarding**: Enter your name, role, and daily commitment
2. **Set Goals**: Define your long-term productivity goal
3. **Start Tracking**: Begin your first Pomodoro session

### Daily Workflow

1. **Start a Session**: Use Pomodoro timer or quick-add sessions
2. **Track Progress**: Monitor your daily goal completion
3. **Maintain Streak**: Complete your daily commitment
4. **Review Insights**: Check your progress over time

### Managing Streaks

- **Complete Daily Goal**: Log productive minutes to continue streak
- **Use Streak Saver**: Skip a day if needed (earned every 7 days)
- **Use Backlog Saver**: Apply unused minutes to reach your goal
- **Track Milestones**: Celebrate achievements at key intervals

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style and conventions
- Test on multiple browsers before submitting
- Update documentation for new features

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **Vercel** - Hosting and deployment
- **Tailwind CSS** - Utility-first CSS framework
- **MDN Web Docs** - PWA documentation

---

<div align="center">

**Developed by [RudraXD](https://github.com/FireHead90544) & Vibecoded w/ Antigravity**

Made with 🔥 and ❤️

</div>
