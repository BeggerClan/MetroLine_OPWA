package com.opwa.opwa_be.Controller;

import com.opwa.opwa_be.Service.MetroLineService;
import com.opwa.opwa_be.Service.SuspensionService;
import com.opwa.opwa_be.model.Suspension;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.opwa.opwa_be.config.JwtService;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/suspensions")
public class SuspensionController {

    @Autowired
    private SuspensionService suspensionService;

    @Autowired
    private MetroLineService metroLineService;

    @Autowired
    private JwtService jwtService;

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

    @GetMapping
    public ResponseEntity<List<Suspension>> getAllSuspensions(
            @RequestParam(required = false) Boolean active) {
        if (active != null) {
            return ResponseEntity.ok(suspensionService.getSuspensionsByStatus(active));
        }
        return ResponseEntity.ok(suspensionService.getAllSuspensions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Suspension> getSuspensionById(@PathVariable String id) {
        return ResponseEntity.ok(suspensionService.getSuspensionById(id));
    }

    @GetMapping("/line/{lineId}")
    public ResponseEntity<List<Suspension>> getSuspensionsByLine(
            @PathVariable String lineId,
            @RequestParam(required = false) Boolean active) {
        if (active != null) {
            return ResponseEntity.ok(
                    suspensionService.getActiveSuspensionsForLine(lineId, active));
        }
        return ResponseEntity.ok(suspensionService.getSuspensionsForLine(lineId));
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Suspension>> getSuspensionsAffectingStation(
            @PathVariable String stationId) {
        return ResponseEntity.ok(
                suspensionService.getSuspensionsAffectingStation(stationId));
    }

    @PostMapping
    public ResponseEntity<Suspension> createSuspension(
            @RequestBody Suspension suspension,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        Suspension created = suspensionService.createSuspension(suspension);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/line/{lineId}/suspend")
    public ResponseEntity<Suspension> suspendLine(
            @PathVariable String lineId,
            @RequestBody SuspensionRequest request,
            HttpServletRequest httpRequest) {
        if (!hasAdminOrOperatorRole(httpRequest)) {
            return ResponseEntity.status(403).build();
        }
        Suspension suspension = new Suspension();
        suspension.setMetroLineId(lineId);
        suspension.setLineName(metroLineService.getLineName(lineId));
        suspension.setReason(request.getReason());
        suspension.setDescription(request.getDescription());
        suspension.setAffectedStationIds(request.getAffectedStationIds());
        suspension.setExpectedEndTime(request.getExpectedEndTime());

        Suspension created = suspensionService.createSuspension(suspension);
        return ResponseEntity.ok(created);
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<Void> resolveSuspension(
            @PathVariable String id,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        suspensionService.resolveSuspension(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/extend")
    public ResponseEntity<Suspension> extendSuspension(
            @PathVariable String id,
            @RequestParam int additionalHours,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(
                suspensionService.extendSuspension(id, additionalHours));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSuspension(
            @PathVariable String id,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        suspensionService.deleteSuspension(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/line/{lineId}")
    public ResponseEntity<Void> deleteAllSuspensionsByLine(
            @PathVariable String lineId,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        suspensionService.deleteAllSuspensionsByLineId(lineId);
        return ResponseEntity.noContent().build();
    }

    // Inner class for request body
    public static class SuspensionRequest {
        private String reason;
        private String description;
        private List<String> affectedStationIds;
        private LocalDateTime expectedEndTime;

        // Getters and setters
        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public List<String> getAffectedStationIds() {
            return affectedStationIds;
        }

        public void setAffectedStationIds(List<String> affectedStationIds) {
            this.affectedStationIds = affectedStationIds;
        }

        public LocalDateTime getExpectedEndTime() {
            return expectedEndTime;
        }

        public void setExpectedEndTime(LocalDateTime expectedEndTime) {
            this.expectedEndTime = expectedEndTime;
        }
    }

    @PatchMapping("/{suspensionId}/details")
    public ResponseEntity<Suspension> updateSuspensionDetails(
            @PathVariable String suspensionId,
            @RequestBody UpdateSuspensionRequest request,
            HttpServletRequest httpRequest) {
        if (!hasAdminOrOperatorRole(httpRequest)) {
            return ResponseEntity.status(403).build();
        }
        Suspension updated = suspensionService.updateSuspensionDetails(
                suspensionId,
                request.getReason(),
                request.getDescription(),
                request.getDurationHours());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{suspensionId}/add-stations")
    public ResponseEntity<Suspension> addStationsToSuspension(
            @PathVariable String suspensionId,
            @RequestBody List<String> stationIds,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(
                suspensionService.addStationsToSuspension(suspensionId, stationIds));
    }

    @PutMapping("/update-metro-status/{lineId}")
    public ResponseEntity<Void> updateMetroLineStatus(
            @PathVariable String lineId,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        suspensionService.updateMetroLineSuspendedStatus(lineId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{suspensionId}/remove-station/{stationId}")
    public ResponseEntity<Suspension> removeStationFromSuspension(
            @PathVariable String suspensionId,
            @PathVariable String stationId,
            HttpServletRequest request) {
        if (!hasAdminOrOperatorRole(request)) {
            return ResponseEntity.status(403).build();
        }
        Suspension updated = suspensionService.removeStationFromSuspension(suspensionId, stationId);
        return ResponseEntity.ok(updated);
    }

    // Request DTO
    public static class UpdateSuspensionRequest {
        private String reason;
        private String description;
        private Integer durationHours;

        // Getters and setters
        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Integer getDurationHours() {
            return durationHours;
        }

        public void setDurationHours(Integer durationHours) {
            this.durationHours = durationHours;
        }
    }
}