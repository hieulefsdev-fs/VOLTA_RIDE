package com.voltaride.backend.service;

import com.voltaride.backend.dto.VehicleResponse;
import com.voltaride.backend.entity.Vehicle;
import com.voltaride.backend.enums.VehicleStatus;
import com.voltaride.backend.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public Page<VehicleResponse> getVehicles(VehicleStatus status, Long categoryId, String search, Pageable pageable) {
        return vehicleRepository.findWithFilters(status, categoryId, search, pageable)
                .map(VehicleResponse::fromEntity);
    }

    public VehicleResponse getVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với id: " + id));
        return VehicleResponse.fromEntity(vehicle);
    }
}
