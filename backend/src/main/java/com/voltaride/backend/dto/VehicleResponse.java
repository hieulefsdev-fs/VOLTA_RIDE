package com.voltaride.backend.dto;

import com.voltaride.backend.entity.Vehicle;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VehicleResponse {
    private Long id;
    private String name;
    private String brand;
    private String model;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private Integer batteryCapacity;
    private Integer rangeKm;
    private Integer maxSpeed;
    private String description;
    private String thumbnailUrl;
    private List<String> imageUrls;
    private String status;
    private String categoryName;

    public static VehicleResponse fromEntity(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getId())
                .name(v.getName())
                .brand(v.getBrand())
                .model(v.getModel())
                .pricePerHour(v.getPricePerHour())
                .pricePerDay(v.getPricePerDay())
                .batteryCapacity(v.getBatteryCapacity())
                .rangeKm(v.getRangeKm())
                .maxSpeed(v.getMaxSpeed())
                .description(v.getDescription())
                .thumbnailUrl(v.getThumbnailUrl())
                .imageUrls(v.getImageUrls())
                .status(v.getStatus().name())
                .categoryName(v.getCategory() != null ? v.getCategory().getName() : null)
                .build();
    }
}
