// AlertDto.java
package com.aeris.dashboard_service.dto;

public record AlertDto(Long id, String zone, String particule, String notation,
                        double concentration, String level, String timestamp) {}
