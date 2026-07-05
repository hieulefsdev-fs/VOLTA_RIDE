package com.voltaride.backend.booking.repository;

import com.voltaride.backend.booking.Booking;
import com.voltaride.backend.booking.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId " +
           "AND b.status NOT IN (:excludedStatuses) " +
           "AND b.startTime < :endTime AND b.endTime > :startTime")
    boolean existsConflict(@Param("vehicleId") Long vehicleId,
                           @Param("startTime") LocalDateTime startTime,
                           @Param("endTime") LocalDateTime endTime,
                           @Param("excludedStatuses") List<BookingStatus> excludedStatuses);
}
