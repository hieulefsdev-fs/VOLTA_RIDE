package com.voltaride.backend.controller;

import com.voltaride.backend.booking.Booking;
import com.voltaride.backend.booking.BookingStatus;
import com.voltaride.backend.booking.repository.BookingRepository;
import com.voltaride.backend.dto.ApiResponse;
import com.voltaride.backend.entity.Review;
import com.voltaride.backend.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewRepository reviewRepo;
    private final BookingRepository bookingRepo;

    public ReviewController(ReviewRepository reviewRepo, BookingRepository bookingRepo) {
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
    }

    @PostMapping("/reviews")
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> body) {
        try {
            Long bookingId = Long.valueOf(body.get("bookingId").toString());
            int rating = Integer.parseInt(body.get("rating").toString());
            String comment = body.getOrDefault("comment", "").toString();

            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Rating phai tu 1 den 5"));
            }

            Booking booking = bookingRepo.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            if (booking.getStatus() != BookingStatus.PAID && booking.getStatus() != BookingStatus.RETURNED) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Chi danh gia don da thanh toan"));
            }

            if (reviewRepo.existsByBookingId(bookingId)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Don nay da duoc danh gia"));
            }

            Review review = Review.builder()
                    .user(booking.getUser())
                    .vehicle(booking.getVehicle())
                    .booking(booking)
                    .rating(rating)
                    .comment(comment)
                    .build();

            reviewRepo.save(review);

            return ResponseEntity.ok(ApiResponse.ok("Danh gia thanh cong", toMap(review)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/vehicles/{vehicleId}/reviews")
    public ResponseEntity<?> getVehicleReviews(@PathVariable Long vehicleId) {
        List<Map<String, Object>> reviews = reviewRepo.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }

    @GetMapping("/admin/reviews")
    public ResponseEntity<?> getAllReviews() {
        List<Map<String, Object>> reviews = reviewRepo.findAll()
                .stream().map(this::toMap).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(reviews));
    }

    @DeleteMapping("/admin/reviews/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        reviewRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Da xoa danh gia", null));
    }

    private Map<String, Object> toMap(Review r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", r.getId());
        m.put("rating", r.getRating());
        m.put("comment", r.getComment());
        m.put("userName", r.getUser().getFullName());
        m.put("vehicleName", r.getVehicle().getName());
        m.put("bookingId", r.getBooking() != null ? r.getBooking().getId() : null);
        m.put("createdAt", r.getCreatedAt());
        return m;
    }
}
