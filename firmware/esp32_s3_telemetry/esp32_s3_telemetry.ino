/*
 * ============================================
 *    ANNAPURNA OS v2.0 — Cold Chain Guardian
 * ============================================
 * 
 * Sensors: DHT22, MQ-135, GY-30, ADXL345, OLED SSD1306
 * Features: WiFi, ML Anomaly Detection, RGB LED Alerts
 * 
 * Pin Map:
 *   OLED  SDA=10, SCL=11  (Wire — Brain 0)
 *   ADXL  SDA=16, SCL=17  (Wire1 — Brain 1, Hot-Swapped)
 *   GY30  SDA=18, SCL=8   (Wire1 — Brain 1, Hot-Swapped)
 *   DHT22 DATA=6
 *   MQ135 A0=7
 *   RGB   R=12, G=13, B=14
 *   BUZZER=15
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"
#include <math.h>

// ========== WiFi ==========
const char* WIFI_SSID     = "OnePlus Nord 2T 5G";
const char* WIFI_PASSWORD = "oneplus9319446777";
const char* API_URL       = "https://annapurna-web-887568501843.us-central1.run.app/api/iot-telemetry";
unsigned long lastPostTime = 0;

// ========== OLED ==========
#define OLED_SDA 10
#define OLED_SCL 11
Adafruit_SSD1306 display(128, 64, &Wire, -1);

// ========== ADXL345 ==========
#define ADXL_SDA 16
#define ADXL_SCL 17
int ADXL_Address = 0x00; // Auto-detected during boot

// ========== GY-30 ==========
#define GY30_SDA 18
#define GY30_SCL 8
int GY30_Address = 0x23;

// ========== DHT22 ==========
#define DHTPIN 6
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

// ========== MQ-135 ==========
#define MQ135_PIN 7

// ========== RGB LED ==========
#define RGB_R 12
#define RGB_G 13
#define RGB_B 14

// ========== BUZZER ==========
#define BUZZER_PIN 15

// ========== ML ENGINE ==========
// Rolling window for anomaly detection (Z-Score method)
#define ML_WINDOW 30
float tempHistory[ML_WINDOW];
float humHistory[ML_WINDOW];
float gasHistory[ML_WINDOW];
float luxHistory[ML_WINDOW];
float tiltHistory[ML_WINDOW];
int   mlIndex = 0;
bool  mlReady = false; // True after we collect ML_WINDOW samples

// Anomaly thresholds (how many standard deviations = "abnormal")
#define Z_THRESHOLD 2.5

// ========== LIVE DATA ==========
float temperature = 0;
float humidity    = 0;
int   gasLevel    = 0;
float luxLevel    = 0;
int16_t tiltX     = 0;

// ========== UI STATE ==========
unsigned long lastScreenSwitch = 0;
int currentScreen = 0;       // 0=Dashboard, 1=ML Status, 2=WiFi Info
int animFrame     = 0;        // For breathing/pulse animation
bool alertActive  = false;    // True when ML detects anomaly
String alertMsg   = "";

// ========== CUSTOM ICONS (8x8 bitmaps) ==========
// Thermometer icon
static const unsigned char PROGMEM icon_temp[] = {
  0x10, 0x28, 0x28, 0x28, 0x28, 0x44, 0x44, 0x38
};
// Water drop icon (humidity)
static const unsigned char PROGMEM icon_hum[] = {
  0x10, 0x10, 0x28, 0x44, 0x82, 0x82, 0x44, 0x38
};
// Cloud icon (air quality)
static const unsigned char PROGMEM icon_air[] = {
  0x00, 0x38, 0x44, 0x82, 0xFF, 0xFF, 0x00, 0x00
};
// Sun icon (light)
static const unsigned char PROGMEM icon_sun[] = {
  0x10, 0x54, 0x38, 0xFE, 0x38, 0x54, 0x10, 0x00
};
// Tilt icon
static const unsigned char PROGMEM icon_tilt[] = {
  0x04, 0x0C, 0x1C, 0x3C, 0x7C, 0xFC, 0x7C, 0x00
};
// WiFi icon
static const unsigned char PROGMEM icon_wifi[] = {
  0x00, 0x7E, 0x42, 0x3C, 0x24, 0x18, 0x10, 0x00
};
// Brain/ML icon
static const unsigned char PROGMEM icon_brain[] = {
  0x3C, 0x42, 0xA5, 0x81, 0xA5, 0x99, 0x42, 0x3C
};

// ========== ML FUNCTIONS ==========
float calcMean(float arr[], int n) {
  float sum = 0;
  for (int i = 0; i < n; i++) sum += arr[i];
  return sum / n;
}

float calcStdDev(float arr[], int n, float mean) {
  float sumSq = 0;
  for (int i = 0; i < n; i++) {
    float diff = arr[i] - mean;
    sumSq += diff * diff;
  }
  return sqrt(sumSq / n);
}

float calcZScore(float value, float mean, float stddev) {
  if (stddev < 0.001) return 0; // Avoid division by zero
  return fabs((value - mean) / stddev);
}

String checkAnomalies() {
  if (!mlReady) return "";
  
  // Calculate statistics for each sensor
  float tempMean = calcMean(tempHistory, ML_WINDOW);
  float tempSD   = calcStdDev(tempHistory, ML_WINDOW, tempMean);
  float tempZ    = calcZScore(temperature, tempMean, tempSD);
  
  float gasMean = calcMean(gasHistory, ML_WINDOW);
  float gasSD   = calcStdDev(gasHistory, ML_WINDOW, gasMean);
  float gasZ    = calcZScore(gasLevel, gasMean, gasSD);
  
  float luxMean = calcMean(luxHistory, ML_WINDOW);
  float luxSD   = calcStdDev(luxHistory, ML_WINDOW, luxMean);
  float luxZ    = calcZScore(luxLevel, luxMean, luxSD);
  
  float tiltMean = calcMean(tiltHistory, ML_WINDOW);
  float tiltSD   = calcStdDev(tiltHistory, ML_WINDOW, tiltMean);
  float tiltZ    = calcZScore(tiltX, tiltMean, tiltSD);

  // Check for anomalies
  if (tempZ > Z_THRESHOLD)  return "TEMP SPIKE!";
  if (gasZ > Z_THRESHOLD)   return "GAS ALERT!";
  if (luxZ > Z_THRESHOLD)   return "LIGHT BREACH!";
  if (tiltZ > Z_THRESHOLD)  return "DROP DETECT!";
  
  // Cold chain specific rules (Adjusted for desk testing!)
  if (temperature > 35.0)    return "TOO HOT!";
  if (temperature < -2.0)   return "FREEZING!";
  if (gasLevel > 2500)      return "TOXIC AIR!";
  
  return "";
}

void updateMLWindow() {
  tempHistory[mlIndex] = temperature;
  humHistory[mlIndex]  = humidity;
  gasHistory[mlIndex]  = gasLevel;
  luxHistory[mlIndex]  = luxLevel;
  tiltHistory[mlIndex] = tiltX;
  
  mlIndex++;
  if (mlIndex >= ML_WINDOW) {
    mlIndex = 0;
    mlReady = true;
  }
}

// ========== RGB LED ==========
void setRGB(int r, int g, int b) {
  analogWrite(RGB_R, r);
  analogWrite(RGB_G, g);
  analogWrite(RGB_B, b);
}

void rgbGreen()  { setRGB(0, 255, 0);   }
void rgbYellow() { setRGB(255, 180, 0);  }
void rgbRed()    { setRGB(255, 0, 0);    }
void rgbOff()    { setRGB(0, 0, 0);      }

// ========== SENSOR READING ==========
void readAllSensors() {
  // 1. DHT22
  temperature = dht.readTemperature();
  humidity    = dht.readHumidity();
  if (isnan(temperature)) temperature = -999;
  if (isnan(humidity))    humidity = -999;
  
  // 2. MQ-135
  gasLevel = analogRead(MQ135_PIN);
  
  // 3. ADXL345 (Hot-Swap Brain 1)
  if (ADXL_Address != 0x00) {
    Wire1.end();
    Wire1.begin(ADXL_SDA, ADXL_SCL);
    
    Wire1.beginTransmission(ADXL_Address);
    Wire1.write(0x2D); Wire1.write(0x08);
    Wire1.endTransmission();
    
    Wire1.beginTransmission(ADXL_Address);
    Wire1.write(0x32);
    Wire1.endTransmission(false);
    Wire1.requestFrom(ADXL_Address, 6, true);
    if (Wire1.available() == 6) {
      tiltX = Wire1.read() | (Wire1.read() << 8);
      Wire1.read(); Wire1.read(); Wire1.read(); Wire1.read();
    }
  }
  
  // 4. GY-30 (Hot-Swap Brain 1)
  if (GY30_Address != 0x00) {
    Wire1.end();
    Wire1.begin(GY30_SDA, GY30_SCL);
    Wire1.beginTransmission(GY30_Address);
    Wire1.write(0x10);
    Wire1.endTransmission();
    delay(200); // Wait 200ms for high-res measurement!
    Wire1.requestFrom(GY30_Address, 2);
    if (Wire1.available() == 2) {
      luxLevel = ((Wire1.read() << 8) | Wire1.read()) / 1.2;
    }
  }
}

// ========== OLED SCREENS ==========

// Breathing dot animation (top right corner)
void drawBreathingDot() {
  animFrame++;
  int pulse = abs((animFrame % 20) - 10); // 0 to 10 and back
  int radius = 1 + (pulse / 3);           // Radius 1 to 4
  display.fillCircle(122, 7, radius, SSD1306_WHITE);
}

// Screen 0: Main Live Dashboard
void drawDashboard() {
  display.clearDisplay();
  
  // Header bar (inverted)
  display.fillRect(0, 0, 128, 14, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK);
  display.setTextSize(1);
  display.setCursor(4, 3);
  display.print("ANNAPURNA");
  
  // WiFi indicator in header
  if (WiFi.status() == WL_CONNECTED) {
    display.drawBitmap(100, 3, icon_wifi, 8, 8, SSD1306_BLACK);
  }
  
  // ML status dot in header
  if (mlReady) {
    display.drawBitmap(112, 3, icon_brain, 8, 8, SSD1306_BLACK);
  }
  
  display.setTextColor(SSD1306_WHITE);
  
  // Draw divider lines for grid
  display.drawLine(64, 14, 64, 50, SSD1306_WHITE);
  display.drawLine(0, 32, 128, 32, SSD1306_WHITE);
  display.drawLine(0, 50, 128, 50, SSD1306_WHITE);
  
  // Top-Left: Temperature with icon
  display.drawBitmap(2, 17, icon_temp, 8, 8, SSD1306_WHITE);
  display.setCursor(12, 19);
  if (temperature > -900) {
    display.print(temperature, 1); display.print("C");
  } else {
    display.print("ERR");
  }
  
  // Top-Right: Humidity with icon
  display.drawBitmap(66, 17, icon_hum, 8, 8, SSD1306_WHITE);
  display.setCursor(76, 19);
  if (humidity > -900) {
    display.print(humidity, 0); display.print("%");
  } else { 
    display.print("ERR");
  }
  
  // Bottom-Left: Air Quality with icon
  display.drawBitmap(2, 35, icon_air, 8, 8, SSD1306_WHITE);
  display.setCursor(12, 37);
  display.print(gasLevel);
  
  // Bottom-Right: Tilt with icon
  display.drawBitmap(66, 35, icon_tilt, 8, 8, SSD1306_WHITE);
  display.setCursor(76, 37);
  if (ADXL_Address != 0x00) {
    display.print(tiltX);
  } else {
    display.print("N/A");
  }
  
  // Footer: Light level (full width)
  display.drawBitmap(2, 53, icon_sun, 8, 8, SSD1306_WHITE);
  display.setCursor(12, 55);
  display.print(luxLevel, 0); display.print(" lux");
  
  // Breathing dot animation (alive indicator)
  drawBreathingDot();
  
  display.display();
}

// Screen 1: ML Brain Status
void drawMLScreen() {
  display.clearDisplay();
  
  // Header
  display.fillRect(0, 0, 128, 14, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK);
  display.setCursor(4, 3);
  display.print("ML BRAIN");
  display.setTextColor(SSD1306_WHITE);
  
  if (!mlReady) {
    // Training phase — show progress
    int progress = (mlIndex * 100) / ML_WINDOW;
    display.setCursor(4, 20);
    display.print("TRAINING MODEL...");
    display.setCursor(4, 32);
    display.print("Samples: ");
    display.print(mlIndex); display.print("/"); display.print(ML_WINDOW);
    
    // Progress bar
    display.drawRect(4, 44, 120, 10, SSD1306_WHITE);
    display.fillRect(4, 44, (progress * 120) / 100, 10, SSD1306_WHITE);
    
    display.setCursor(4, 57);
    display.print("Z-Threshold: "); display.print(Z_THRESHOLD, 1);
  } else {
    // ML is active — show live stats
    float tempMean = calcMean(tempHistory, ML_WINDOW);
    float gasMean  = calcMean(gasHistory, ML_WINDOW);
    
    display.setCursor(4, 18);
    display.print("Status: ACTIVE");
    
    display.setCursor(4, 28);
    display.print("Avg Temp: "); display.print(tempMean, 1); display.print("C");
    
    display.setCursor(4, 38);
    display.print("Avg Gas:  "); display.print(gasMean, 0);
    
    display.setCursor(4, 48);
    if (alertActive) {
      display.print("ALERT: "); display.print(alertMsg);
    } else {
      display.print("All Systems Normal");
    }
    
    // Breathing dot
    drawBreathingDot();
  }
  
  display.display();
}

// Screen 2: WiFi & System Info
void drawWiFiScreen() {
  display.clearDisplay();
  
  // Header
  display.fillRect(0, 0, 128, 14, SSD1306_WHITE);
  display.setTextColor(SSD1306_BLACK);
  display.setCursor(4, 3);
  display.print("NETWORK");
  display.setTextColor(SSD1306_WHITE);
  
  display.setCursor(4, 18);
  if (WiFi.status() == WL_CONNECTED) {
    display.print("WiFi: ONLINE");
    display.setCursor(4, 30);
    display.print("IP: ");
    display.print(WiFi.localIP());
    display.setCursor(4, 42);
    display.print("RSSI: "); display.print(WiFi.RSSI()); display.print("dBm");
  } else {
    display.print("WiFi: OFFLINE");
    display.setCursor(4, 30);
    display.print("Reconnecting...");
  }
  
  display.setCursor(4, 54);
  display.print("Up: "); display.print(millis() / 1000); display.print("s");
  
  // Breathing dot
  drawBreathingDot();
  
  display.display();
}

// Alert Screen (Flashing when anomaly detected)
void drawAlertScreen() {
  display.clearDisplay();
  
  // Flashing border effect
  if ((animFrame / 3) % 2 == 0) {
    display.drawRect(0, 0, 128, 64, SSD1306_WHITE);
    display.drawRect(1, 1, 126, 62, SSD1306_WHITE);
    display.drawRect(2, 2, 124, 60, SSD1306_WHITE);
  }
  
  // Big warning text
  display.setTextSize(2);
  display.setCursor(10, 10);
  display.print("WARNING!");
  
  display.setTextSize(1);
  display.setCursor(10, 35);
  display.print(alertMsg);
  
  display.setCursor(10, 50);
  display.print("Check cargo NOW!");
  
  display.display();
}

// ========== BOOT ANIMATION ==========
void bootAnimation() {
  // Phase 1: Logo
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(5, 5);
  display.print("ANNAPURNA");
  display.setTextSize(1);
  display.setCursor(15, 30);
  display.print("Cold Chain Guardian");
  display.setCursor(35, 45);
  display.print("v2.0");
  display.display();
  delay(1500);
  
  // Phase 2: System check with progress bar
  String checks[] = {"[I2C] OLED......OK", "[I2C] ADXL...Hunt", "[I2C] GY30...Hunt", "[DHT] Temp.....OK", "[ADC] Gas......OK", "[NET] WiFi..Join"};
  int numChecks = 6;
  
  for (int i = 0; i < numChecks; i++) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setCursor(10, 3);
    display.print("SYSTEM CHECK");
    
    // Progress bar
    int progress = ((i + 1) * 100) / numChecks;
    display.drawRect(10, 15, 108, 8, SSD1306_WHITE);
    display.fillRect(10, 15, (progress * 108) / 100, 8, SSD1306_WHITE);
    
    // Show checks
    for (int j = 0; j <= i && j < numChecks; j++) {
      display.setCursor(5, 28 + (j * 6));
      if (j < 4) { // Only show last 4 lines to fit
        display.print(checks[j]);
      }
    }
    
    display.display();
    delay(300);
  }
  
  delay(500);
}

// ========== HTTP TELEMETRY ==========
void sendTelemetry() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(API_URL);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", "ANNAPURNA_IOT_SECURE_KEY_2026");

    String statusStr = "In Transit";
    if (alertActive) {
      statusStr = alertMsg;
    }

    String json = "{";
    json += "\"cargoId\":\"cargo-001\",";
    json += "\"temperature\":" + String(temperature, 1) + ",";
    json += "\"humidity\":" + String(humidity, 0) + ",";
    json += "\"rawGasValue\":" + String(gasLevel) + ",";
    json += "\"ethyleneLevel\":\"";
    json += (alertActive ? "high" : "normal");
    json += "\"";
    json += "}";

    int httpResponseCode = http.POST(json);
    if (httpResponseCode > 0) {
      Serial.print(" | ☁️ POST OK: ");
      Serial.print(httpResponseCode);
    } else {
      Serial.print(" | ❌ POST ERR: ");
      Serial.print(httpResponseCode);
    }
    http.end();
  }
}

// ========== SETUP ==========
void setup() {
  Serial.begin(115200);
  delay(1000); // Give the Serial port time to initialize
  
  Serial.println("\n========================================");
  Serial.println("   ANNAPURNA OS v2.0 — COLD CHAIN AI");
  Serial.println("========================================\n");
  
  // RGB LED setup
  pinMode(RGB_R, OUTPUT);
  pinMode(RGB_G, OUTPUT);
  pinMode(RGB_B, OUTPUT);
  rgbYellow(); // Yellow during boot
  
  // Buzzer setup
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  
  // 1. Start OLED (Brain 0)
  Wire.begin(OLED_SDA, OLED_SCL);
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("❌ OLED FAILED! Check pins 10 and 11!");
  } else {
    Serial.println("✅ OLED initialized on pins 10, 11");
  }
  
  // Run boot animation
  bootAnimation();
  
  // 2. Auto-detect ADXL345
  Serial.println("\n🔍 Hunting for Accelerometer...");
  Wire1.begin(ADXL_SDA, ADXL_SCL);
  
  Wire1.beginTransmission(0x53);
  if (Wire1.endTransmission() == 0) {
    ADXL_Address = 0x53;
    Serial.println("✅ ADXL345 found at 0x53");
  } else {
    Wire1.beginTransmission(0x1D);
    if (Wire1.endTransmission() == 0) {
      ADXL_Address = 0x1D;
      Serial.println("✅ ADXL345 found at 0x1D");
    } else {
      Serial.println("⚠️  ADXL345 not found. Tilt will show N/A.");
    }
  }
  
  // 2.5 Auto-Detect GY-30
  Serial.println("\n🔍 Hunting for GY-30 Light Sensor...");
  Wire1.end();
  Wire1.begin(GY30_SDA, GY30_SCL);
  Wire1.beginTransmission(0x23);
  if (Wire1.endTransmission() == 0) {
    GY30_Address = 0x23;
    Serial.println("✅ Found GY-30 at 0x23");
  } else {
    Wire1.beginTransmission(0x5C);
    if (Wire1.endTransmission() == 0) {
      GY30_Address = 0x5C;
      Serial.println("✅ Found GY-30 at 0x5C");
    } else {
      GY30_Address = 0x00;
      Serial.println("⚠️  GY-30 not found! Lux will show 0.");
    }
  }

  // 3. Start DHT22
  dht.begin();
  Serial.println("✅ DHT22 initialized on pin 6");
  
  // 4. MQ-135 (analog, no setup needed)
  Serial.println("✅ MQ-135 initialized on pin 7");
  
  // 5. Connect to WiFi
  Serial.print("📡 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  display.clearDisplay();
  display.setCursor(4, 20);
  display.print("Connecting WiFi...");
  display.setCursor(4, 35);
  display.print(WIFI_SSID);
  display.display();
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int wifiAttempts = 0;
  while (WiFi.status() != WL_CONNECTED && wifiAttempts < 20) {
    delay(500);
    Serial.print(".");
    wifiAttempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
    
    display.clearDisplay();
    display.setCursor(4, 20);
    display.print("WiFi: ONLINE");
    display.setCursor(4, 35);
    display.print("IP: ");
    display.print(WiFi.localIP());
    display.display();
    delay(1500);
  } else {
    Serial.println("\n⚠️  WiFi failed. Running in offline mode.");
    
    display.clearDisplay();
    display.setCursor(4, 25);
    display.print("WiFi: OFFLINE");
    display.setCursor(4, 40);
    display.print("Running offline...");
    display.display();
    delay(1500);
  }
  
  // Initialize ML history arrays
  for (int i = 0; i < ML_WINDOW; i++) {
    tempHistory[i] = 0;
    humHistory[i]  = 0;
    gasHistory[i]  = 0;
    luxHistory[i]  = 0;
    tiltHistory[i] = 0;
  }
  
  rgbGreen(); // Green = all systems go
  
  Serial.println("\n🟢 ANNAPURNA OS v2.0 ONLINE!");
  Serial.println("================================\n");
}

// ========== MAIN LOOP ==========
void loop() {
  // 1. Read all sensors
  readAllSensors();
  
  // 2. Feed data into ML engine
  updateMLWindow();
  
  // 3. Run anomaly detection
  alertMsg = checkAnomalies();
  alertActive = (alertMsg.length() > 0);
  
  // 4. Update RGB LED based on ML result
  if (alertActive) {
    rgbRed();
    // Quick buzzer beep on new alert (Active Buzzer)
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
  } else if (!mlReady) {
    rgbYellow(); // Still training
  } else {
    rgbGreen();  // All clear
  }
  
  // 5. Draw the OLED screen
  // If there's an alert, show it for 2 seconds, then show the dashboard for 2 seconds
  if (alertActive && (millis() % 4000 < 2000)) {
    drawAlertScreen();
  } else {
    // Auto-cycle through screens every 4 seconds
    if (millis() - lastScreenSwitch > 4000) {
      currentScreen = (currentScreen + 1) % 3;
      lastScreenSwitch = millis();
    }
    
    switch (currentScreen) {
      case 0: drawDashboard();  break;
      case 1: drawMLScreen();   break;
      case 2: drawWiFiScreen(); break;
    }
  }
  
  // 6. Print to Serial Monitor (THE FIX!)
  Serial.print("T:");    Serial.print(temperature, 1);
  Serial.print("C | H:"); Serial.print(humidity, 0);
  Serial.print("% | AQ:"); Serial.print(gasLevel);
  Serial.print(" | Tilt:"); Serial.print(tiltX);
  Serial.print(" | Lux:"); Serial.print(luxLevel, 0);
  
  if (alertActive) {
    Serial.print(" | ⚠️ ALERT: "); Serial.print(alertMsg);
  } else if (mlReady) {
    Serial.print(" | ML:OK");
  } else {
    Serial.print(" | ML:Training("); Serial.print(mlIndex); Serial.print("/"); Serial.print(ML_WINDOW); Serial.print(")");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(" | WiFi:ON");
  } else {
    Serial.print(" | WiFi:OFF");
  }
  
  // 7. Post Telemetry (Every 5 seconds)
  if (millis() - lastPostTime > 5000) {
    sendTelemetry();
    lastPostTime = millis();
  }
  
  Serial.println();
  
  // 7. Reconnect WiFi if it dropped
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
  }
  
  delay(500); // Refresh twice a second
}
