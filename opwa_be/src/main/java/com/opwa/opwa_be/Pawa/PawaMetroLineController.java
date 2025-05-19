package com.opwa.opwa_be.Pawa;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PawaMetroLineController {

    private final PawaMetroLineService service;

    public PawaMetroLineController(PawaMetroLineService service) {
        this.service = service;
    }

    @GetMapping("/api/pawa/metro-lines")
    public List<MetroLineResponseDto> getAllMetroLines() {
        return service.getAllLines();
    }
}
