## 🎬 5-Minute Demo Script — Annapurna

### 0:00 - 0:30 | The Hook
"India loses ₹92,000 crore annually because 3-4 middlemen stand between a farmer and a consumer. A farmer selling tomatoes at ₹25/kg in the mandi sees the same tomatoes sold at ₹80/kg in retail — but takes home only ₹15/kg after commission agents take their cut. Annapurna eliminates every single middleman."

### 0:30 - 1:30 | Farmer Lists Produce
- Open the Farmer Portal
- Farmer Ramesh Patil from Nashik lists 500kg of tomatoes
- Sets minimum price at ₹28/kg (above MSP)
- Uploads harvest photo → AI grades quality as A+ automatically
- Shows real-time mandi price comparison: "Mandi: ₹25/kg | Your price: ₹35/kg | +40% more"

### 1:30 - 2:30 | AI Matchmaking & Buyer Portal
- Switch to Buyer Marketplace
- Show product catalog with farm-fresh produce
- Buyer searches: "organic tomatoes near Pune under ₹40"
- AI Smart Filter extracts structured query instantly
- Show price comparison: "Farm: ₹35 | Mandi: ₹45 | Retail: ₹80 — You save ₹45/kg!"
- Buyer adds to cart and places order

### 2:30 - 3:30 | AI Negotiation & Demand Forecasting
- Show AI negotiation running on behalf of farmer
- AI protects MSP floor — never lets price go below government MSP
- Switch to Farmer Dashboard — show earnings: "+₹12,450 vs mandi this month"
- Show Demand Forecast: "Tomato demand ↑ 23% next week in Maharashtra"
- Show ARIMA price prediction chart

### 3:30 - 4:30 | Advanced AI Features
- Demonstrate multilingual voice: farmer speaks in Hindi to list produce
- Show AI Nerve Center — real-time agent decisions
- Show Text-to-SQL analytics: "What are the most sold crops in Maharashtra?"
- Show FSSAI Legal RAG: compliance verification
- Show Document AI: Aadhaar/KCC OCR verification

### 4:30 - 5:00 | Impact & Closing
- "Every transaction on Annapurna eliminates 3-4 middlemen"
- "Farmers earn 40% more. Consumers pay 45% less."
- "5 autonomous AI agents. 9 Indian languages. Real government mandi prices."
- "Built with Google Cloud, Gemini AI, and Firebase — scales from 10 farmers to 14 crore."
- "This is not just a hackathon project. This is the future of Indian agriculture."

### Judge Q&A Cheat Sheet

| Question | Prepared Answer |
| :--- | :--- |
| **How does the AI Negotiation actually work?** | Our Vertex AI-powered agent acts as the farmer's proxy. It evaluates the buyer's offer against the farmer's asking price, the government's Minimum Support Price (MSP), and real-time mandi rates. If an offer is within 95% of the ask, it accepts. Between 70% and 94%, it counters favorably for the farmer. It strictly rejects anything below the MSP floor, ensuring farmers are never exploited. |
| **Where do you get your pricing data?** | We ingest daily APMC Mandi prices from data.gov.in / Agmarknet to ensure accurate, real-world baseline pricing. We also cross-reference MSPs set by the government. |
| **How does delivery work without middlemen?** | We support multiple delivery modes: Farm Pickup (for local buyers/FPOs), Platform Logistics (integration with 3PLs), or FPO Hub delivery, depending on the buyer's location and volume. Logistics costs are transparently shown at checkout. |
| **How do illiterate farmers use this platform?** | The platform has full multilingual voice support. A farmer can simply click the microphone button and say "I want to sell 500kg of tomatoes for ₹35" in Hindi, Marathi, Tamil, etc. The AI handles data entry automatically. |
| **How are you handling payments?** | We use an escrow-based payment system. When an order is placed, buyer funds are held securely. Once the quality is verified and delivery completed, payment is released directly to the farmer, ensuring trust on both sides. |
