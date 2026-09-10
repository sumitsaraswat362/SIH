# 🌾 Annapurna — Direct Farm-to-Fork Marketplace

![Next.js](https://img.shields.io/badge/Next.js%2016-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS%204-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![SIH 26033](https://img.shields.io/badge/SIH%202024-PSID%2026033-success?style=for-the-badge)

A smart, AI-driven digital marketplace built for **Smart India Hackathon (SIH) 2024**. Annapurna aims to empower Indian farmers by eliminating middlemen, increasing earnings, and providing consumers and bulk buyers with fresh produce at fair prices.

---

## 🎯 Problem Statement

**PSID 26033:** *Multiple intermediaries reduce farmers earnings and increase consumer prices.*
**Ministry:** Ministry of Consumer Affairs, Food & Public Distribution, DoCA.

In the traditional supply chain, produce passes through 4-6 intermediaries before reaching the consumer. This leads to:
- **Low realization for farmers:** Often receiving only 20-30% of the final retail price.
- **High prices for consumers:** Due to cumulative commissions.
- **High spoilage:** Delays and multiple handling lead to 15-20% post-harvest loss.

---

## 💡 Our Solution

**Annapurna** is a comprehensive farm-to-fork marketplace connecting farmers and Farmer Producer Organizations (FPOs) directly with consumers, retailers, and restaurants. 

By leveraging cutting-edge Artificial Intelligence and predictive analytics, Annapurna offers:
- **Zero Middlemen:** Direct transactions saving the 40% traditional commission.
- **Fair Pricing:** AI-driven price recommendations, protected by Government MSP floors.
- **Optimized Logistics:** Intelligent route and delivery matching to reduce spoilage.

---

## 📈 Key Impact Metrics

| Metric | Impact | Details |
|--------|--------|---------|
| 💰 **Farmer Earnings** | **+40%** | Average increase in farmer net realization |
| 💸 **Intermediary Loss** | **₹92,000 Cr** | Estimated annual market value recovered for farmers |
| ⚡ **AI Matching** | **<90 sec** | Time to match a farmer listing with optimal buyers |
| 🌍 **Accessibility** | **9 Languages** | Native voice & text support across India |

---

## ✨ Features

- 🔮 **AI Demand Forecasting:** ARIMA-based 14-day predictions analyzing seasonal trends, historical data, and weather.
- 👁️ **Vision AI Quality Grading:** Automated grading (A+, A, B, C) from harvest photos using Gemini multimodal capabilities.
- 🤝 **Multi-Agent AI Negotiation:** Smart agent handling price negotiations on behalf of the farmer, ensuring prices never fall below the Minimum Support Price (MSP).
- 📊 **Real-time Mandi Prices:** Live integration with the `data.gov.in` API to benchmark asking prices against local mandis.
- 🗣️ **Multilingual Voice Interface:** Breaking literacy barriers with native voice support in Hindi, Marathi, Tamil, Telugu, Kannada, and more.
- 🛒 **Direct Farmer-Buyer Marketplace:** Robust UI for buyers to discover produce and farmers to track active listings and earnings.
- 💳 **Payment Escrow System:** Secure, trust-building financial transactions ensuring farmers get paid upon delivery.
- 🏛️ **Government Scheme Integration:** Curated widgets guiding farmers to apply for PM-KISAN, e-NAM, and KCC.
- ⚖️ **FSSAI Compliance RAG Assistant:** An AI help-bot that answers questions and guides through organic certification and FSSAI rules.
- 📄 **Document AI:** Automated Aadhaar and KCC OCR for rapid, frictionless onboarding.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 4, Radix UI, Framer Motion
- **Visualization & Maps:** Recharts, Leaflet

### Backend & Database
- **Database:** Firebase / Firestore
- **Data Warehouse:** Google BigQuery
- **Language:** TypeScript

### AI & Cloud
- **LLM:** Google Vertex AI (Gemini 2.5 Flash)
- **Agent SDK:** `@google/adk`
- **Services:** Google Cloud Translation, Document AI

---

## 🧠 AI Architecture

Annapurna utilizes a constellation of 5 specialized AI Agents working in tandem:

1. **DemandForecaster Agent:** Analyzes regional data to predict demand surges and price trends.
2. **Matchmaking Agent:** Scores and connects the best buyer-seller pairs based on logistics, price, and quality requirements.
3. **Negotiation Agent:** Acts as an advocate for the farmer, automatically countering lowball offers using live mandi data and MSP constraints.
4. **Quality Agent:** Processes harvest images to standardize grading across the platform.
5. **Compliance Agent (Help-Bot):** A RAG-powered assistant helping users navigate government schemes, KYC processes, and platform features in their native tongue.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A Google Cloud Project with Vertex AI and Firestore enabled
- Firebase Admin SDK credentials

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TeamAnnapurna/sih-26033.git
   cd sih-26033
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-a9c284f8-6bca-440a-a0c
   FIREBASE_ADMIN_CREDENTIALS={"type":"service_account",...}
   GEMINI_API_KEY=your_gemini_api_key
   GCP_LOCATION=us-central1
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3000`.*

---

## 📡 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| **GET / POST** | `/api/listings` | Fetch all produce listings / Create new listing |
| **GET / POST / PATCH** | `/api/orders` | Fetch orders / Create new order / Update status |
| **GET** | `/api/mandi-prices` | Fetch real-time market prices via `data.gov.in` |
| **GET** | `/api/demand-forecast` | Get 14-day AI predictions for crop & region |
| **POST** | `/api/help-bot` | Multilingual AI assistant for platform navigation & schemes |
| **POST** | `/api/chat` | Direct messaging between buyers and farmers |
| **POST** | `/api/vision/qc` | Vision AI for harvest quality grading |
| **POST** | `/api/negotiation` | Automated MSP-protected price negotiation |

*(Other internal routes handle translation, OCR, auth, and analytics)*

---

## 👥 Team

**Team Annapurna** — Passionate developers building for India.
Built with ❤️ for SIH 2024.

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.
