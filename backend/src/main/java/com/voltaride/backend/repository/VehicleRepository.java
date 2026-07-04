package com.voltaride.backend.repository;

import com.voltaride.backend.entity.Vehicle;
import com.voltaride.backend.enums.VehicleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Page<Vehicle> findByStatus(VehicleStatus status, Pageable pageable);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:categoryId IS NULL OR v.category.id = :categoryId) AND " +
           "(:search IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Vehicle> findWithFilters(
        @Param("status") VehicleStatus status,
        @Param("categoryId") Long categoryId,
        @Param("search") String search,
        Pageable pageable
    );
}
