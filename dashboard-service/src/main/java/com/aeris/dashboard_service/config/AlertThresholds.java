package com.aeris.dashboard_service.config;

import java.util.Map;

public class AlertThresholds {
    // TODO: confirm units (ppm vs µg/m3) then replace with real WHO/EPA-derived limits.
    // These are placeholders so the pipeline is wired end-to-end.
    public static final Map<String, Double> WARNING = Map.of(
            "SO2", 40.0,
            "CO", 50.0,
            "NH3", 60.0,
            "CO2", 70.0
    );
    public static final Map<String, Double> CRITICAL = Map.of(
            "SO2", 70.0,
            "CO", 80.0,
            "NH3", 85.0,
            "CO2", 90.0
    );
    // N2 intentionally excluded — not a monitored pollutant.

    public static double warningFor(String notation) {
        return WARNING.getOrDefault(notation, 75.0);
    }
    public static double criticalFor(String notation) {
        return CRITICAL.getOrDefault(notation, 90.0);
    }
}
