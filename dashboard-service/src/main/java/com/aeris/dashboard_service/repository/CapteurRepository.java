package com.aeris.dashboard_service.repository;

import com.aeris.dashboard_service.model.Capteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CapteurRepository extends JpaRepository<Capteur, Integer> {

    List<Capteur> findTop50ByOrderByTimestampDesc();

    List<Capteur> findByZoneAndParticuleAndTimestampBetweenOrderByTimestampAsc(
            String zone, String particule, LocalDateTime from, LocalDateTime to);

    @Query("select c.zone, avg(c.concentration) from Capteur c " +
           "where c.timestamp >= :since group by c.zone")
    List<Object[]> avgConcentrationByZoneSince(@Param("since") LocalDateTime since);

    @Query("select c from Capteur c where c.concentration >= :threshold " +
           "and c.timestamp >= :since order by c.timestamp desc")
    List<Capteur> findAboveThresholdSince(@Param("threshold") double threshold,
                                           @Param("since") LocalDateTime since);
}
