package com.opwa.opwa_be.Pawa;

import com.opwa.opwa_be.model.Station;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "metro_lines")
public class MetroLinePawa {

    @Id
    private String lineId;
    private String lineName;
    private int totalDuration;
    private boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime firstDeparture;
    private String frequencyMinutes;

    // Suspension fields
    private boolean isSuspended;
    private String suspensionReason;
    private LocalDateTime suspensionStartTime;
    private LocalDateTime suspensionEndTime;

    // Store station IDs
    private List<String> stationIds;

    // Transient field for populated stations
    @Transient
    private List<Station> stations;

    public MetroLinePawa() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.isActive = true;
        this.isSuspended = false;
    }

    public String getLineId() {
        return lineId;
    }

    public void setLineId(String lineId) {
        this.lineId = lineId;
    }

    public String getLineName() {
        return lineName;
    }

    public void setLineName(String lineName) {
        this.lineName = lineName;
    }

    public int getTotalDuration() {
        return totalDuration;
    }

    public void setTotalDuration(int totalDuration) {
        this.totalDuration = totalDuration;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getFirstDeparture() {
        return firstDeparture;
    }

    public void setFirstDeparture(LocalDateTime firstDeparture) {
        this.firstDeparture = firstDeparture;
    }

    public String getFrequencyMinutes() {
        return frequencyMinutes;
    }

    public void setFrequencyMinutes(String frequencyMinutes) {
        this.frequencyMinutes = frequencyMinutes;
    }

    public boolean isSuspended() {
        return isSuspended;
    }

    public void setSuspended(boolean suspended) {
        isSuspended = suspended;
    }

    public String getSuspensionReason() {
        return suspensionReason;
    }

    public void setSuspensionReason(String suspensionReason) {
        this.suspensionReason = suspensionReason;
    }

    public LocalDateTime getSuspensionStartTime() {
        return suspensionStartTime;
    }

    public void setSuspensionStartTime(LocalDateTime suspensionStartTime) {
        this.suspensionStartTime = suspensionStartTime;
    }

    public LocalDateTime getSuspensionEndTime() {
        return suspensionEndTime;
    }

    public void setSuspensionEndTime(LocalDateTime suspensionEndTime) {
        this.suspensionEndTime = suspensionEndTime;
    }

    public List<String> getStationIds() {
        return stationIds;
    }

    public void setStationIds(List<String> stationIds) {
        this.stationIds = stationIds;
    }

    public List<Station> getStations() {
        return stations;
    }

    public void setStations(List<Station> stations) {
        this.stations = stations;
    }
}
