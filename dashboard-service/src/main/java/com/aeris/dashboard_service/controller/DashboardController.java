package com.aeris.dashboard_service.controller;

import com.aeris.dashboard_service.dto.*;
import com.aeris.dashboard_service.model.Capteur;
import com.aeris.dashboard_service.repository.CapteurRepository;
import com.aeris.dashboard_service.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // adjust for your Next.js dev origin
public class DashboardController {

    private final DashboardService service;
    private final CapteurRepository repo;

    public DashboardController(DashboardService service, CapteurRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @GetMapping("/kpis")
    public KpiDto kpis() {
        return service.getKpis();
    }

    @GetMapping("/zones/avg")
    public List<ZoneAvgDto> zoneAverages() {
        return service.getZoneAverages();
    }

    @GetMapping("/alerts")
    public List<AlertDto> alerts() {
        return service.getAlerts();
    }

    @GetMapping("/readings")
    public List<Capteur> readings(
            @RequestParam String zone,
            @RequestParam String particule,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        LocalDateTime f = from != null ? LocalDateTime.parse(from) : LocalDateTime.now().minusHours(1);
        LocalDateTime t = to != null ? LocalDateTime.parse(to) : LocalDateTime.now();
        return repo.findByZoneAndParticuleAndTimestampBetweenOrderByTimestampAsc(zone, particule, f, t);
    }

    @GetMapping("/readings/latest")
    public List<Capteur> latest() {
        return repo.findTop50ByOrderByTimestampDesc();
    }
}
