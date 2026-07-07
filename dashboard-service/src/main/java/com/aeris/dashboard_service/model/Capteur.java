package com.aeris.dashboard_service.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "capteurs")
@Data
public class Capteur {

    @Id
    private Integer id;

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
