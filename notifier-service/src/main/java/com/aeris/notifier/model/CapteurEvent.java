package com.aeris.notifier.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CapteurEvent {

    private int id;
    private double latitude;
    private double longitude;
    private String zone;
    private String status;
    private String eventType;
    private String particule;
    private String notation;
    private String timestamp;
    private double concentration;
}