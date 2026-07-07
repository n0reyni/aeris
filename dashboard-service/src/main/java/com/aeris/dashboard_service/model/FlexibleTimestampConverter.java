package com.aeris.dashboard_service.model;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;

@Converter
public class FlexibleTimestampConverter implements AttributeConverter<LocalDateTime, String> {

    // Handles both "...ss.SSSSSS" and "...ss" (Python drops microseconds when they're exactly 0)
    private static final DateTimeFormatter READ = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd HH:mm:ss")
            .appendFraction(java.time.temporal.ChronoField.MICRO_OF_SECOND, 0, 6, true)
            .toFormatter();

    private static final DateTimeFormatter WRITE = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSSSSS");

    @Override
    public String convertToDatabaseColumn(LocalDateTime attribute) {
        return attribute == null ? null : attribute.format(WRITE);
    }

    @Override
    public LocalDateTime convertToEntityAttribute(String dbData) {
        return dbData == null ? null : LocalDateTime.parse(dbData, READ);
    }
}
