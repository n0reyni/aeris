package com.aeris.dashboard_service.service;

import com.aeris.dashboard_service.model.Capteur;
import com.aeris.dashboard_service.repository.CapteurRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ReadingStreamService {

    private final CapteurRepository repo;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final AtomicLong lastSeenId = new AtomicLong(-1);

    public ReadingStreamService(CapteurRepository repo) {
        this.repo = repo;
    }

    public SseEmitter subscribe() {
        // No timeout (0L) — client (EventSource) manages the connection lifetime.
        SseEmitter emitter = new SseEmitter(0L);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError((e) -> emitters.remove(emitter));

        emitters.add(emitter);
        return emitter;
    }

    // Initialize lastSeenId once, on first poll, so a fresh app instance
    // doesn't replay the entire table history to the first connected client.
    private void initLastSeenIdIfNeeded() {
        if (lastSeenId.get() == -1) {
            Capteur latest = repo.findTopByOrderByRecordIdDesc();
            lastSeenId.set(latest != null ? latest.getRecordId() : 0L);
        }
    }

    @Scheduled(fixedDelay = 2000)
    public void pushNewReadings() {
        initLastSeenIdIfNeeded();

        if (emitters.isEmpty()) {
            return; // no connected clients, skip the DB hit
        }

        List<Capteur> newRows = repo.findByRecordIdGreaterThanOrderByRecordIdAsc(lastSeenId.get());
        if (newRows.isEmpty()) {
            return;
        }

        for (Capteur reading : newRows) {
            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event()
                            .name("reading")
                            .data(reading));
                } catch (IOException e) {
                    emitter.completeWithError(e);
                    emitters.remove(emitter);
                }
            }
        }

        lastSeenId.set(newRows.get(newRows.size() - 1).getRecordId());
    }
}
