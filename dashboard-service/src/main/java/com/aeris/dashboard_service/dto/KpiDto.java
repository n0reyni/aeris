// KpiDto.java
package com.aeris.dashboard_service.dto;

public record KpiDto(long activeSensors, long alerts24h, double avgConcentration, String lastUpdate) {}
