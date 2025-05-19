package com.opwa.opwa_be.Pawa;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.opwa.opwa_be.Pawa.StationPawa;

import java.util.List;

public interface StationPawaRepo extends MongoRepository<StationPawa, String> {

    List<StationPawa> findByStationNameContainingIgnoreCase(String name);
    List<StationPawa> findByMapMarker(String marker);
    StationPawa findTopByOrderByStationIdDesc();
}
