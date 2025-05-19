package com.opwa.opwa_be.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opwa.opwa_be.Repository.MetroLineRepo;
import com.opwa.opwa_be.Repository.StationRepo;
import com.opwa.opwa_be.model.MetroLine;
import com.opwa.opwa_be.model.Station;
import com.opwa.opwa_be.Service.StationService;
import org.apache.commons.text.similarity.LevenshteinDistance;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    @Autowired
    private StationRepo stationRepo;

    @Autowired
    private StationService stationService;

    @Autowired
    private MetroLineRepo metroLineRepo;

    @GetMapping("/get-all-stations")
    public ResponseEntity<List<Station>> getAllStations() {
        List<Station> stations = stationRepo.findAll();

        if (stations.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/{id}")
    public Station getStationById(@PathVariable String id) {
        return stationRepo.findById(id).orElse(null);
    }

    @GetMapping("/search")
    public List<Station> searchStationsByName(@RequestParam String name) {
        List<Station> allStations = stationRepo.findAll();
        LevenshteinDistance ld = new LevenshteinDistance();
        String query = name.toLowerCase();
        return allStations.stream()
            .filter(station -> {
                String stationName = station.getStationName().toLowerCase();
                return stationName.contains(query) || ld.apply(stationName, query) <= 2;
            })
            .collect(Collectors.toList());
    }

    @GetMapping("/marker/{marker}")
    public List<Station> getStationsByMarker(@PathVariable String marker) {
        return stationRepo.findByMapMarker(marker);
    }

    @PostMapping("/create")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        Station created = stationService.createStation(station);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Station> updateStation(@PathVariable String id, @RequestBody Station station) {
        Station updated = stationService.updateStation(id, station);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteStation(@PathVariable String id) {
        stationService.deleteStation(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{stationId}/lines")
    public List<MetroLine> getLinesForStation(@PathVariable String stationId) {
        return metroLineRepo.findByStationIdsContaining(stationId);
    }
}