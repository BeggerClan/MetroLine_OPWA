package com.opwa.opwa_be.Pawa;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
public class MetroLineResponseDto {
    private String lineId;
    private String lineName;
    private String firstStationName;
    private String lastStationName;
    private int totalDuration;
    private int stationCount;
    private List<String> stationNames;

    public MetroLineResponseDto(
            String lineId,
            String lineName,
            String firstStationName,
            String lastStationName,
            int totalDuration,
            int stationCount,
            List<String> stationNames
    ) {
        this.lineId            = lineId;
        this.lineName          = lineName;
        this.firstStationName  = firstStationName;
        this.lastStationName   = lastStationName;
        this.totalDuration     = totalDuration;
        this.stationCount      = stationCount;
        this.stationNames      = stationNames;
    }

}
