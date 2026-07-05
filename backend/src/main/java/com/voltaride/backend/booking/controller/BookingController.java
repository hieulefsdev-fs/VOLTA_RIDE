package com.voltaride.backend.booking.controller;

import com.voltaride.backend.booking.dto.BookingRequest;
import com.voltaride.backend.booking.dto.BookingResponse;
import com.voltaride.backend.booking.service.BookingService;
import com.voltaride.backend.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestParam Long userId, @RequestBody BookingRequest req) {
        try {
            BookingResponse res = bookingService.createBooking(userId, req);
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking created", res));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/booking/{id}/pay-wallet")
    public ResponseEntity<?> payWithWallet(@PathVariable Long id, @RequestParam Long userId) {
        try {
            BookingResponse res = bookingService.payWithWallet(id, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Thanh toan thanh cong", res));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/booking/my")
    public ResponseEntity<?> getMyBookings(@RequestParam Long userId) {
        List<BookingResponse> list = bookingService.getMyBookings(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }

    @DeleteMapping("/booking/{id}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id, @RequestParam Long userId) {
        try {
            bookingService.cancelBooking(id, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Booking cancelled", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @GetMapping("/admin/booking")
    public ResponseEntity<?> getAllBookings() {
        List<BookingResponse> list = bookingService.getAllBookings();
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", list));
    }
}
