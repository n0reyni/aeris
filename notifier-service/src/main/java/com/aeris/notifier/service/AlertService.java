package com.aeris.notifier.service;

import com.aeris.notifier.model.CapteurEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class AlertService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final MqttClient mqttClient;
    private final ObjectMapper objectMapper;

    @Value("${aeris.kafka.topic-alertes}")
    private String topicAlertesKafka;

    @Value("${aeris.emqx.topic-alertes}")
    private String topicAlertesMqtt;

    public AlertService(KafkaTemplate<String, String> kafkaTemplate, MqttClient mqttClient, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.mqttClient = mqttClient;
        this.objectMapper = objectMapper;
    }

    public void publierAlerte(CapteurEvent event) {
        try {
            String json = objectMapper.writeValueAsString(event);

            // Publication Kafka
            kafkaTemplate.send(topicAlertesKafka, json);
            log.info("Alerte publiée sur Kafka (topic={})", topicAlertesKafka);

            // Publication EMQX (MQTT)
            MqttMessage mqttMessage = new MqttMessage(json.getBytes());
            mqttMessage.setQos(1);
            mqttClient.publish(topicAlertesMqtt, mqttMessage);
            log.info("Alerte publiée sur EMQX (topic={})", topicAlertesMqtt);

        } catch (Exception e) {
            log.error("Erreur lors de la publication de l'alerte", e);
        }
    }
}