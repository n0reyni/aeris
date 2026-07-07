package com.aeris.notifier.consumer;

import com.aeris.notifier.model.CapteurEvent;
import com.aeris.notifier.service.AlertService;
import com.aeris.notifier.service.SeuilService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CapteurConsumer {

    private final ObjectMapper objectMapper;
    private final SeuilService seuilService;
    private final AlertService alertService;

    @Autowired
    public CapteurConsumer(ObjectMapper objectMapper, SeuilService seuilService, AlertService alertService) {
        this.objectMapper = objectMapper;
        this.seuilService = seuilService;
        this.alertService = alertService;
    }

    @KafkaListener(topics = "${aeris.kafka.topic-capteurs}", groupId = "${spring.kafka.consumer.group-id}")
    public void consumeCapteurEvent(String message) {
        try {
            JsonNode root = objectMapper.readTree(message);
            JsonNode payloadNode = root.has("payload") ? root.get("payload") : root;

            CapteurEvent event = objectMapper.treeToValue(payloadNode, CapteurEvent.class);

            log.info("Message reçu : {} = {} @ {}", event.getNotation(), event.getConcentration(), event.getZone());

            boolean anormal = seuilService.estAnormal(event.getNotation(), event.getConcentration());

            if (anormal) {
                log.warn("⚠️ ALERTE détectée : {} = {} @ {} (seuil dépassé)",
                        event.getNotation(), event.getConcentration(), event.getZone());
                alertService.publierAlerte(event);
            } else {
                log.info("Concentration normale, aucune action.");
            }

        } catch (Exception e) {
            log.error("Erreur lors du traitement du message Kafka : {}", message, e);
        }
    }
}