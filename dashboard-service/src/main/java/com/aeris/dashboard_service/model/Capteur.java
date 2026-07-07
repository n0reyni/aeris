package com.aeris.dashboard_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "capteurs")
@Data
public class Capteur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Long recordId;

    @Column(name = "id")
    private Integer sensorReadingCounter; // simulator's own counter, NOT unique — kept as plain data

    private Double latitude;
    private Double longitude;
    private String zone;
    private String status;

    @Column(name = "event_type")
    private String eventType;

    private String particule;
    private String notation;

    @Convert(converter = FlexibleTimestampConverter.class)
    private LocalDateTime timestamp;

    private Double concentration;
}
