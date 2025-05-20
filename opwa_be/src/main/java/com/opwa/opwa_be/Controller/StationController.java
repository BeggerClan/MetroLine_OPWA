package com.opwa.opwa_be.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opwa.opwa_be.Repository.MetroLineRepo;
import com.opwa.opwa_be.Repository.StationRepo;
import com.opwa.opwa_be.model.MetroLine;
import com.opwa.opwa_be.model.Station;
import com.opwa.opwa_be.config.JwtService;


import jakarta.servlet.http.HttpServletRequest;

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

    @Autowired
    private JwtService jwtService;

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
    public ResponseEntity<Station> createStation(HttpServletRequest request, @RequestBody Station station) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        Station created = stationService.createStation(station);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Station> updateStation(HttpServletRequest request, @PathVariable String id, @RequestBody Station station) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        Station updated = stationService.updateStation(id, station);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteStation(HttpServletRequest request, @PathVariable String id) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        stationService.deleteStation(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{stationId}/lines")
    public List<MetroLine> getLinesForStation(@PathVariable String stationId) {
        return metroLineRepo.findByStationIdsContaining(stationId);
    }

    // Utility method for role check (take token the same way as UserController)
    private boolean hasAdminOrOperatorRole(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        List<String> roles = jwtService.extractRoles(token);
        return roles.contains("ADMIN") || roles.contains("OPERATOR");
    }
}