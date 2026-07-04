package com.voltaride.backend.controller;

import com.voltaride.backend.dto.*;
import com.voltaride.backend.enums.VehicleStatus;
import com.voltaride.backend.repository.VehicleCategoryRepository;
import com.voltaride.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final VehicleCategoryRepository categoryRepo;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> getVehicles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search
    ) {
        VehicleStatus vs = status != null ? VehicleStatus.valueOf(status) : null;
        Page<VehicleResponse> vehicles = vehicleService.getVehicles(
                vs, categoryId, search,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );
        return ResponseEntity.ok(ApiResponse.ok(vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(vehicleService.getVehicle(id)));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryRepo.findAll()));
    }
}
