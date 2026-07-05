package com.voltaride.backend.booking.service;

import com.voltaride.backend.booking.Booking;
import com.voltaride.backend.booking.BookingStatus;
import com.voltaride.backend.booking.dto.BookingRequest;
import com.voltaride.backend.booking.dto.BookingResponse;
import com.voltaride.backend.booking.repository.BookingRepository;
import com.voltaride.backend.entity.User;
import com.voltaride.backend.entity.Vehicle;
import com.voltaride.backend.enums.VehicleStatus;
import com.voltaride.backend.repository.UserRepository;
import com.voltaride.backend.repository.VehicleRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final VehicleRepository vehicleRepo;
    private final UserRepository userRepo;
    private final JdbcTemplate jdbcTemplate;

    public BookingService(BookingRepository bookingRepo, VehicleRepository vehicleRepo,
                          UserRepository userRepo, JdbcTemplate jdbcTemplate) {
        this.bookingRepo = bookingRepo;
        this.vehicleRepo = vehicleRepo;
        this.userRepo = userRepo;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Vehicle vehicle = vehicleRepo.findById(req.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException("Vehicle is not available");
        }

        DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        LocalDateTime start = LocalDateTime.parse(req.getStartTime(), fmt);
        LocalDateTime end = LocalDateTime.parse(req.getEndTime(), fmt);

        if (!end.isAfter(start)) {
            throw new RuntimeException("End time must be after start time");
        }

        List<BookingStatus> excludedStatuses = List.of(BookingStatus.CANCELLED, BookingStatus.RETURNED);
        if (bookingRepo.existsConflict(vehicle.getId(), start, end, excludedStatuses)) {
            throw new RuntimeException("Vehicle is already booked for this time period");
        }

        long totalHours = Math.max(1, Duration.between(start, end).toHours());
        double price;
        if (totalHours >= 24 && vehicle.getPricePerDay() != null) {
            long days = totalHours / 24;
            long remainingHours = totalHours % 24;
            price = vehicle.getPricePerDay().doubleValue() * days
                    + vehicle.getPricePerHour().doubleValue() * remainingHours;
        } else {
            price = vehicle.getPricePerHour().doubleValue() * totalHours;
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setTotalPrice(price);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);

        booking = bookingRepo.save(booking);
        return toResponse(booking);
    }

    @Transactional
    public BookingResponse payWithWallet(Long bookingId, Long userId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not your booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Booking is not pending payment");
        }

        String email = booking.getUser().getEmail().toLowerCase();
        long amount = Math.round(booking.getTotalPrice());

        Long balance = jdbcTemplate.queryForObject(
                "select wallet_balance from users where lower(email) = lower(?)",
                Long.class, email);

        if (balance == null || balance < amount) {
            throw new RuntimeException("So du vi khong du. Can " + amount + " VND, hien co " + (balance == null ? 0 : balance) + " VND");
        }

        jdbcTemplate.update(
                "update users set wallet_balance = wallet_balance - ? where lower(email) = lower(?)",
                amount, email);

        booking.setStatus(BookingStatus.PAID);
        booking = bookingRepo.save(booking);
        return toResponse(booking);
    }

    public List<BookingResponse> getMyBookings(Long userId) {
        return bookingRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        return bookingRepo.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (!booking.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not your booking");
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Can only cancel pending bookings");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepo.save(booking);
    }

    private BookingResponse toResponse(Booking b) {
        BookingResponse r = new BookingResponse();
        r.setId(b.getId());
        r.setVehicleId(b.getVehicle().getId());
        r.setVehicleName(b.getVehicle().getName());
        r.setVehicleThumbnail(b.getVehicle().getThumbnailUrl());
        r.setUserId(b.getUser().getId());
        r.setUserName(b.getUser().getFullName());
        r.setStartTime(b.getStartTime());
        r.setEndTime(b.getEndTime());
        r.setTotalPrice(b.getTotalPrice());
        r.setStatus(b.getStatus());
        r.setCreatedAt(b.getCreatedAt());
        return r;
    }
}
