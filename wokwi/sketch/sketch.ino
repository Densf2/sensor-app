#include "DHT.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

const char* ssid = "Wokwi-GUEST";
const char* password = "";

// адресa серверу на Render (без слешу в кінці)
const char* baseUrl = "TBD";

#define DHTPIN 15
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  Serial.println("ESP32 started");

  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed");
  }
}

void sendToServer(String path, String sensorName, float value, String unit) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected");
    return;
  }

  StaticJsonDocument<200> doc;
  doc["sensorName"] = sensorName;
  doc["value"] = value;
  doc["unit"] = unit;

  String jsonData;
  serializeJson(doc, jsonData);

  String url = String(baseUrl) + path;

  Serial.print("Sending to ");
  Serial.print(url);
  Serial.print(": ");
  Serial.println(jsonData);

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonData);

  if (httpResponseCode > 0) {
    Serial.print("Server responded: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println("Response body: " + response);
  } else {
    Serial.print("Error sending POST: ");
    Serial.println(httpResponseCode);
  }

  http.end();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  sendToServer("/sensors", "Temp", temperature, "C");
  delay(500);
  sendToServer("/humidity-sensors", "Humid-1", humidity, "%");

  delay(1000);
}
