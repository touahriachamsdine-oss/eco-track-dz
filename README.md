# 🌿 EcoTrack DZ
### *AI-Powered Waste Management for a Cleaner Algeria*

[![Next.js](https://img.shields.io/badge/Framework-Next.js%2016-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![AI](https://img.shields.io/badge/AI-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow)](https://www.tensorflow.org/js)
[![Prisma](https://img.shields.io/badge/Database-Prisma-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Multi-lingual](https://img.shields.io/badge/Language-AR%20%7C%20FR%20%7C%20EN%20%7C%20TZ-059669?style=for-the-badge)](#)

---

## 🚀 The Vision
EcoTrack DZ is a comprehensive, multi-sided platform designed to transform waste management in Algeria. By bridging the gap between citizens, collectors, and city administrators, we leverage **Artificial Intelligence**, **Real-time Logistics**, and **Behavioral Gamification** to create a cleaner, smarter environment.

---

## 🔥 Key Pillars

### 1. 🤖 AI Waste Scanner (Edge Computing)
Built with **TensorFlow.js** and **COCO-SSD**, our scanner provides real-time waste classification directly in the browser.
- **Privacy First:** All AI processing happens on the device; no images are sent to a server.
- **Smart Categorization:** Automatically identifies items (bottles, paper, food) and provides localized disposal instructions.
- **Instant Rewards:** Users earn points immediately upon successful classification.

### 2. 🎮 Gamified Rewards & Marketplace
We turn environmental responsibility into a reward-driven experience.
- **Report & Earn:** Citizens earn points for reporting illegal dumping or overflowing bins.
- **The Marketplace:** Spend "Eco-Credits" on real local rewards:
  - 🛍️ Grocer Discounts
  - 🚌 Free Transit Passes
  - 🌳 Reforestation (Planting trees in the Blida mountains)
  - ☕ Local Artisanal Coffee

### 3. 🗺️ Operation HQ (Admin & Collector)
A high-performance logistics engine for the city.
- **Collector Dashboard:** Live GPS-routed task management, vehicle-specific assignments, and route optimization.
- **Admin Heatmaps:** Real-time monitoring of "Bin Fill Levels" and field officer locations.
- **Automated Alerts:** Intelligence system that notifies citizens when a pickup is approaching their zone.

### 4. 🌍 Deep Localization
Designed specifically for the Algerian context:
- **Quad-lingual Support:** Full UI translation for **Arabic, French, Tamazight, and English**.
- **RTL Ready:** Seamless layout transitions for Arabic and Tamazight scripts.

---

## 🛠️ Technical Excellence
- **Frontend/Backend:** Next.js 16 (App Router) with Turbopack for blazing-fast development.
- **Security:** Global Edge Proxy (Middleware) providing Role-Based Access Control (RBAC) and JWT session management.
- **Database:** Prisma ORM with SQLite (standardized for demo portability).
- **PWA:** Fully installable as a mobile app for field officers and citizens.

---

## 🏁 Getting Started

### Installation
```bash
# 1. Clone & Install
npm install

# 2. Database Sync
npx prisma db push
npx prisma generate

# 3. Seed Rewards & Admin
node scripts/seed-rewards.js
node scripts/create-admin.js

# 4. Start Development
npm run dev
```

### 🔐 Demo Credentials
- **Admin HQ:** `admin@example.com` / `admin@example.com`
- **Port:** `http://localhost:9505`

---

## 🏆 Hackathon Goals
- [x] **Impact:** Solving a critical urban infrastructure problem in Algeria.
- [x] **Innovation:** Real-time browser-side Computer Vision (AI).
- [x] **Technical Depth:** Full-stack architecture with secure proxying and multi-tenant DASHBOARDS.
- [x] **Market Readiness:** Inclusive multilingual support and PWA distribution.

---

*Developed for the Algerian AI Hackathon 2026. Transforming our streets, one byte at a time.* 🇩🇿✨