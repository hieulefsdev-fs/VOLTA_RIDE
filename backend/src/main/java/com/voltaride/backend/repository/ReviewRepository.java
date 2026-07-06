package com.voltaride.backend.repository;

import com.voltaride.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);
    boolean existsByBookingId(Long bookingId);
}
