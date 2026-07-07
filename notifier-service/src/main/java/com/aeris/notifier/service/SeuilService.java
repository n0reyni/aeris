package com.aeris.notifier.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class SeuilService {

    private final Map<String, Double> seuils = new HashMap<>();

    public SeuilService(
            @Value("${aeris.seuils.NH3}") double nh3,
            @Value("${aeris.seuils.N2}") double n2,
            @Value("${aeris.seuils.CO2}") double co2,
            @Value("${aeris.seuils.CO}") double co,
            @Value("${aeris.seuils.SO2}") double so2) {
        seuils.put("NH3", nh3);
        seuils.put("N2", n2);
        seuils.put("CO2", co2);
        seuils.put("CO", co);
        seuils.put("SO2", so2);
    }

    public boolean estAnormal(String notation, double concentration) {
        Double seuil = seuils.get(notation);
        if (seuil == null) {
            return false; // notation inconnue, on ne déclenche pas d'alerte
        }
        return concentration > seuil;
    }
}