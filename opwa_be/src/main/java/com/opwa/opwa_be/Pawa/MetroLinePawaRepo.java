package com.opwa.opwa_be.Pawa;

import com.opwa.opwa_be.model.MetroLine;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.opwa.opwa_be.Pawa.MetroLinePawa;

import java.util.List;

public interface MetroLinePawaRepo extends MongoRepository<MetroLinePawa, String> {

    List<MetroLinePawa> findByIsActive(boolean isActive);
    List<MetroLinePawa> findByLineNameContainingIgnoreCase(String name);
    List<MetroLinePawa> findByStationIdsContaining(String stationId);
    List<MetroLinePawa> findByIsSuspended(boolean isSuspended);

}
