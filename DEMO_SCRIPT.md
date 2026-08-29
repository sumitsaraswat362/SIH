# 🏔️ Annapurna 5-Minute Demo Script

## 1. Opening Hook (0:00 - 0:30)
**SAY:** "Every year, India loses over ₹1.5 Lakh Crore to food wastage. The primary culprit? Broken, fragmented logistics and compromised cold-chain integrity. Traditional telematics only tell you a truck *has already broken down* when it's too late. Today, we're introducing **Annapurna** — an autonomous multi-agent AI logistics ecosystem that stops food waste *before* it happens."

## 2. Hardware Demo (0:30 - 1:30)
*(Hold up the ESP32 hardware device)*
**SAY:** "This is our custom IoT edge device powered by the ESP32-S3. It features multiple sensors, including the DHT22 for temperature and humidity. Let's simulate a compressor failure."
**CLICK/ACTION:** *(Breathe heavily on the DHT22 sensor to spike temperature and humidity)*
**SAY:** "As you can see on the OLED display, the temperature spikes immediately. This telemetry data is streamed directly to our cloud in real-time."

## 3. Fleet Dashboard (1:30 - 2:30)
*(Switch to the Fleet Dashboard on screen)*
**SAY:** "Back at the Fleet Command Center, we can see our live map with pinpoint GPS accuracy. Notice our truck's telemetry data updating live."
**CLICK/ACTION:** *(Point to the active alerts and the specific truck showing an emergency status)*
**SAY:** "The sudden temperature spike has triggered our AI Neural Engine. The AI calculates the time-to-spoilage window using ARIMA+ forecasting, autonomously reroutes the truck to a cold storage within a 50km radius using Haversine distance calculations, and instantly broadcasts the distress cargo to nearby wholesalers."

## 4. AI Negotiation (2:30 - 3:30)
*(Switch to the Wholesaler Marketplace and open the Negotiation Panel)*
**SAY:** "Now we're in the Wholesaler portal. Wholesalers are alerted to this distress cargo and can bid on it. But what if they lowball the price?"
**CLICK/ACTION:** *(Submit a very low counter-offer on a cargo)*
**SAY:** "Our Gemini-powered AI Negotiation Agent steps in. It evaluates the bid in real-time, considering the cargo's remaining life, and automatically issues a counter-offer. It's a 3-round system ensuring fair pricing."
**CLICK/ACTION:** *(Click the 'Request Human' button in the chat)*
**SAY:** "If negotiations stall, the wholesaler can trigger a real-time Firestore-backed chat with the fleet manager to resolve it instantly."

## 5. Wholesaler Filters (3:30 - 4:30)
*(Close the negotiation panel and show the Wholesaler Dashboard main view)*
**SAY:** "To find exactly what they need, wholesalers use our Advanced Multi-Criteria Filter."
**CLICK/ACTION:** *(Expand the Advanced Filters section and type in the AI Smart Filter bar)*
**SAY:** "We have over 10 filtering criteria, including telemetry and geographic distance. But they can also just type in natural language, like 'I need 500kg of seafood under 300 rupees'. Our AI Smart Filter parses this and applies the filters."
**CLICK/ACTION:** *(Show Best Match sorting, click 'Export CSV', and save a filter template)*
**SAY:** "They can sort by Best Match AI scoring, export the filtered data to CSV, or save the layout as a local template for future use."

## 6. Closing (4:30 - 5:00)
*(Switch back to the Fleet Dashboard or show a floating Help Bot)*
**SAY:** "Throughout this process, automated Gmail alerts via Nodemailer and instant WhatsApp notifications via Twilio have kept all stakeholders informed."
**CLICK/ACTION:** *(Show the AI Help Bot floating on the page)*
**SAY:** "With Annapurna, we've reduced response times to under 90 seconds, turning a 100% loss into an 85% cargo value recovery. Zero human intervention required. We are saving the harvest."
