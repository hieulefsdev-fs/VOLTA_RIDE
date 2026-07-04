package com.voltaride.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicle_categories")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class VehicleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
}
