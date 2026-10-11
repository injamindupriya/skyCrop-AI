
package com.skycrop.api;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final AtomicLong ids = new AtomicLong(1001);

    private final List<Map<String, Object>> scans =
            new CopyOnWriteArrayList<>();

    private final List<Map<String, Object>> alerts =
            new CopyOnWriteArrayList<>();

    private final List<Map<String, Object>> missions =
            new CopyOnWriteArrayList<>();

    public DashboardController() {
        alerts.add(item(
                "id", 1,
                "title", "Check soil moisture",
                "severity", "Medium",
                "detail", "Sample alert: verify moisture before irrigation.",
                "createdAt", Instant.now().toString(),
                "status", "Open"
        ));

        alerts.add(item(
                "id", 2,
                "title", "Inspect lower leaves",
                "severity", "Low",
                "detail", "Routine scouting reminder; no disease diagnosis has been made.",
                "createdAt", Instant.now().toString(),
                "status", "Open"
        ));
    }

    // Health check
    @GetMapping("/health")
    public Map<String, Object> health() {
        return item(
                "status", "connected",
                "application", "SkyCrop AI",
                "mode", "prototype",
                "timestamp", Instant.now().toString()
        );
    }

    // Dashboard overview
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        long healthy = scans.stream()
                .filter(s -> "Healthy-looking (demo)".equals(s.get("result")))
                .count();

        long openAlerts = alerts.stream()
                .filter(a -> "Open".equals(a.get("status")))
                .count();

        return item(
                "farmerName", "Farmer",
                "farmName", "My Farm",
                "cropsMonitored", Math.max(12, scans.size()),
                "healthy", Math.max(9, healthy),
                "alerts", openAlerts,
                "moisture", 64,
                "temperature", 28,
                "humidity", 71,
                "demoData", true,
                "recentScans", scans.size()
        );
    }

    // Crop image analysis upload
    @PostMapping(
            value = "/crop/analyze",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<Map<String, Object>> analyze(
            @RequestParam("image") MultipartFile image,
            @RequestParam(value = "crop", defaultValue = "Unknown crop")
            String crop) {

        if (image.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    item("message", "Uploaded image is empty.")
            );
        }

        if (image.getContentType() == null
                || !image.getContentType().startsWith("image/")) {
            return ResponseEntity.badRequest().body(
                    item("message", "Please upload an image file.")
            );
        }

        if (image.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(
                    item("message", "Image must be 10 MB or smaller.")
            );
        }

        Map<String, Object> result = item(
                "id", ids.incrementAndGet(),
                "filename", Objects.requireNonNullElse(
                        image.getOriginalFilename(), "crop-image"),
                "crop", crop,
                "sizeBytes", image.getSize(),
                "result", "Pending real model",
                "confidence", null,
                "severity", "Unknown",
                "recommendations", List.of(
                        "Retake a well-lit close-up image of the affected leaf.",
                        "Compare with local agricultural extension guidance.",
                        "Do not apply pesticides based on this demo result."
                ),
                "modelStatus", "NOT_CONFIGURED",
                "createdAt", Instant.now().toString(),
                "notice",
                "This prototype validates and records uploads; it does not diagnose plant disease. Connect a trained model for predictions."
        );

        scans.add(0, result);
        return ResponseEntity.ok(result);
    }

    // Crop history
    @GetMapping("/crop/history")
    public Map<String, Object> history() {
        return item("items", scans, "count", scans.size());
    }

    // Crop health overview
    @GetMapping("/crop/health")
    public Map<String, Object> cropHealth() {
        return item(
                "healthScore", 78,
                "label", "Sample estimate",
                "areas", List.of(
                        item("field", "North field", "score", 86, "status", "Good"),
                        item("field", "East field", "score", 72, "status", "Monitor"),
                        item("field", "South field", "score", 65, "status", "Inspect")
                ),
                "notice",
                "Illustrative values only; connect imagery and sensor data for real field health maps."
        );
    }

    // Weather
    @GetMapping("/weather")
    public Map<String, Object> weather(
            @RequestParam(defaultValue = "Hyderabad") String city) {

        return item(
                "city", city,
                "temperatureC", 28,
                "humidityPct", 71,
                "rainProbabilityPct", 25,
                "windKph", 8,
                "forecast", List.of(
                        item("day", "Today", "highC", 31, "lowC", 23, "rainPct", 25),
                        item("day", "Tomorrow", "highC", 30, "lowC", 22, "rainPct", 40),
                        item("day", "Day 3", "highC", 29, "lowC", 22, "rainPct", 55)
                ),
                "source",
                "Demo data — configure a weather provider for live forecasts."
        );
    }

    // Simulated sensor readings
    @GetMapping("/sensors")
    public Map<String, Object> sensors() {
        return item(
                "readings", List.of(
                        item("name", "Soil moisture", "value", 64, "unit", "%", "status", "Demo"),
                        item("name", "Soil temperature", "value", 24, "unit", "°C", "status", "Demo"),
                        item("name", "Air humidity", "value", 71, "unit", "%", "status", "Demo"),
                        item("name", "Light intensity", "value", 780, "unit", "lux", "status", "Demo")
                ),
                "notice", "Simulated readings. Connect IoT hardware for live values."
        );
    }

    // Alerts
    @GetMapping("/alerts")
    public Map<String, Object> getAlerts() {
        return item("items", alerts, "count", alerts.size());
    }

    @PostMapping("/alerts/{id}/resolve")
    public ResponseEntity<Map<String, Object>> resolve(
            @PathVariable long id) {

        for (Map<String, Object> alert : alerts) {
            if (String.valueOf(alert.get("id")).equals(String.valueOf(id))) {
                alert.put("status", "Resolved");
                return ResponseEntity.ok(alert);
            }
        }

        return ResponseEntity.notFound().build();
    }

    // Crop recommendations
    @PostMapping("/recommendations")
    public Map<String, Object> recommendations(
            @RequestBody(required = false) Map<String, Object> body) {

        String crop = body == null
                ? "your crop"
                : String.valueOf(body.getOrDefault("crop", "your crop"));

        return item(
                "crop", crop,
                "items", List.of(
                        item(
                                "title", "Scout before treating",
                                "priority", "High",
                                "action", "Inspect several plants and both sides of leaves; photograph symptoms."
                        ),
                        item(
                                "title", "Check soil before irrigation",
                                "priority", "Medium",
                                "action", "Use a soil probe or sensor and account for recent rainfall."
                        ),
                        item(
                                "title", "Use integrated pest management",
                                "priority", "Medium",
                                "action", "Confirm the pest or disease with a local agronomist before treatment."
                        )
                ),
                "notice", "General guidance only, not a diagnosis or pesticide prescription."
        );
    }

    // Create simulated drone mission
    @PostMapping("/drone/missions")
    public Map<String, Object> createMission(
            @RequestBody Map<String, Object> body) {

        Map<String, Object> mission = item(
                "id", ids.incrementAndGet(),
                "name", body.getOrDefault("name", "Field survey"),
                "areaHectares", body.getOrDefault("areaHectares", 5),
                "overlapPct", body.getOrDefault("overlapPct", 75),
                "status", "Planned (simulation)",
                "createdAt", Instant.now().toString(),
                "note", "Simulation only; no drone is controlled by this API."
        );

        missions.add(0, mission);
        return mission;
    }

    @GetMapping("/drone/missions")
    public Map<String, Object> missions() {
        return item("items", missions, "count", missions.size());
    }

    // FIXED: Economics estimator
    @PostMapping("/economics/estimate")
    public ResponseEntity<Map<String, Object>> economics(
            @RequestBody Map<String, Object> body) {

        try {
            double area = getNumber(body, "areaAcres");
            double yield = getNumber(body, "expectedYieldPerAcre");
            double price = getNumber(body, "pricePerUnit");
            double cost = getNumber(body, "inputCostPerAcre");

            if (area <= 0 || yield < 0 || price < 0 || cost < 0) {
                return ResponseEntity.badRequest().body(
                        item(
                                "message",
                                "Area must be positive. Yield, price and cost cannot be negative."
                        )
                );
            }

            double revenue = area * yield * price;
            double expenses = area * cost;

            return ResponseEntity.ok(item(
                    "crop", body.getOrDefault("crop", "Unknown"),
                    "areaAcres", area,
                    "estimatedRevenue", Math.round(revenue * 100.0) / 100.0,
                    "estimatedInputCost", Math.round(expenses * 100.0) / 100.0,
                    "estimatedGrossMargin",
                    Math.round((revenue - expenses) * 100.0) / 100.0,
                    "notice",
                    "Planning estimate only; actual yield, price and costs may differ."
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    item("message", e.getMessage())
            );
        }
    }

    // Convert and validate numeric Economics input
    private static double getNumber(
            Map<String, Object> body, String key) {

        Object value = body.get(key);

        if (value == null) {
            throw new IllegalArgumentException(
                    "Missing required field: " + key
            );
        }

        try {
            double number = Double.parseDouble(value.toString());

            if (!Double.isFinite(number)) {
                throw new IllegalArgumentException(
                        "Value must be a finite number: " + key
                );
            }

            return number;

        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Value must be numeric: " + key
            );
        }
    }

    // Farming assistant prototype
    @PostMapping("/assistant")
    public Map<String, Object> assistant(
            @RequestBody Map<String, String> body) {

        String question = body.getOrDefault("message", "")
                .toLowerCase(Locale.ROOT);

        String answer;

        if (question.contains("water") || question.contains("irrigat")) {
            answer = "Check soil moisture, crop stage and recent rainfall before watering. The sensor values in this demo are simulated.";
        } else if (question.contains("disease") || question.contains("leaf")) {
            answer = "Take a sharp, well-lit photo of the affected leaf and inspect multiple plants. This prototype has no trained disease model, so confirm with an agronomist.";
        } else if (question.contains("weather") || question.contains("rain")) {
            answer = "The weather panel currently uses sample data. Connect a weather API for location-based forecasts.";
        } else {
            answer = "I can help with crop scouting, irrigation checks, weather planning and farm estimates. Share the crop and observed symptoms; treat this as general guidance, not a diagnosis.";
        }

        return item(
                "answer", answer,
                "language", "English",
                "disclaimer",
                "AI assistant prototype; verify important decisions with local agricultural experts."
        );
    }

    // Utility to create ordered JSON response maps
    private static Map<String, Object> item(Object... keyValues) {
        Map<String, Object> result = new LinkedHashMap<>();

        for (int i = 0; i < keyValues.length; i += 2) {
            result.put(String.valueOf(keyValues[i]), keyValues[i + 1]);
        }

        return result;
    }
}
