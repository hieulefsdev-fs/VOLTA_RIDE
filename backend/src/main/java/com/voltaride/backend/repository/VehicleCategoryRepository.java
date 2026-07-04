package com.voltaride.backend.repository;

import com.voltaride.backend.entity.VehicleCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleCategoryRepository extends JpaRepository<VehicleCategory, Long> {
}
