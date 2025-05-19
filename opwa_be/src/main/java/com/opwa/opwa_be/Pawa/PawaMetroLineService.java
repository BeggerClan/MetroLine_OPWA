package com.opwa.opwa_be.Pawa;

import com.opwa.opwa_be.Pawa.MetroLinePawa;
import com.opwa.opwa_be.Pawa.StationPawa;
import com.opwa.opwa_be.Pawa.MetroLinePawaRepo;
import com.opwa.opwa_be.Pawa.StationPawaRepo;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PawaMetroLineService {

    private final MetroLinePawaRepo metroLineRepo;
    private final StationPawaRepo stationRepo;

    public PawaMetroLineService(MetroLinePawaRepo metroLineRepo, StationPawaRepo stationRepo) {
        this.metroLineRepo = metroLineRepo;
        this.stationRepo = stationRepo;
    }

    public List<MetroLineResponseDto> getAllLines() {
        // 1) fetch all lines
        List<MetroLinePawa> lines = metroLineRepo.findAll();

        // 2) collect all stationIds
        Set<String> allIds = lines.stream()
                .filter(l -> l.getStationIds() != null)
                .flatMap(l -> l.getStationIds().stream())
                .collect(Collectors.toSet());

        // 3) batch‐load stations → map id→name
        Map<String,String> idToName = stationRepo.findAllById(allIds).stream()
                .collect(Collectors.toMap(
                        StationPawa::getStationId,
                        StationPawa::getStationName
                ));

        // 4) build DTOs
        List<MetroLineResponseDto> dtos = new ArrayList<>();
        for (MetroLinePawa line : lines) {
            List<String> ids = Optional.ofNullable(line.getStationIds())
                    .orElse(Collections.emptyList());

            List<String> names = ids.stream()
                    .map(id -> idToName.getOrDefault(id, "unknown"))
                    .collect(Collectors.toList());

            String first = names.isEmpty() ? "unknown" : names.get(0);
            String last  = names.isEmpty() ? "unknown" : names.get(names.size() - 1);

            dtos.add(new MetroLineResponseDto(
                    line.getLineId(),
                    line.getLineName(),
                    first,
                    last,
                    line.getTotalDuration(),
                    names.size(),
                    names
            ));
        }

        return dtos;
    }

}
