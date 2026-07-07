package com.aeris.dashboard_service.service;

import com.aeris.dashboard_service.config.AlertThresholds;
import com.aeris.dashboard_service.dto.*;
import com.aeris.dashboard_service.model.Capteur;
import com.aeris.dashboard_service.repository.CapteurRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DashboardService {

    private final CapteurRepository repo;

    public DashboardService(CapteurRepository repo) {
        this.repo = repo;
    }

    public KpiDto getKpis() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<Capteur> recent = repo.findTop50ByOrderByTimestampDesc();

        long activeSensors = recent.stream().map(Capteur::getZone).distinct().count();
        double avg = recent.stream().mapToDouble(Capteur::getConcentration).average().orElse(0);
        long alerts = repo.findAboveThresholdSince(0, since).stream()
                .filter(c -> c.getConcentration() >= AlertThresholds.warningFor(c.getNotation()))
                .count();
        String lastUpdate = recent.isEmpty() ? "n/a" :
                recent.get(0).getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        return new KpiDto(activeSensors, alerts, Math.round(avg * 100.0) / 100.0, lastUpdate);
    }

    public List<ZoneAvgDto> getZoneAverages() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return repo.avgConcentrationByZoneSince(since).stream()
                .map(row -> new ZoneAvgDto((String) row[0], (Double) row[1]))
                .toList();
    }

    public List<AlertDto> getAlerts() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        return repo.findAboveThresholdSince(0, since).stream()
                .filter(c -> c.getConcentration() >= AlertThresholds.warningFor(c.getNotation()))
                .map(c -> new AlertDto(
                        c.getId(), c.getZone(), c.getParticule(), c.getNotation(),
                        c.getConcentration(),
                        c.getConcentration() >= AlertThresholds.criticalFor(c.getNotation()) ? "critical" : "warning",
                        c.getTimestamp().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
                ))
                .toList();
    }
}
