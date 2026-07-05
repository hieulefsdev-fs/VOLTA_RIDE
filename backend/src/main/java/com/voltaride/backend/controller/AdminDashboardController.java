package com.voltaride.backend.controller;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.voltaride.backend.dto.ApiResponse;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final JdbcTemplate jdbc;

    public AdminDashboardController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalVehicles", jdbc.queryForObject("SELECT COUNT(*) FROM vehicles", Long.class));
        stats.put("availableVehicles", jdbc.queryForObject("SELECT COUNT(*) FROM vehicles WHERE status='AVAILABLE'", Long.class));
        stats.put("totalUsers", jdbc.queryForObject("SELECT COUNT(*) FROM users", Long.class));
        stats.put("totalBookings", jdbc.queryForObject("SELECT COUNT(*) FROM bookings", Long.class));
        stats.put("pendingBookings", jdbc.queryForObject("SELECT COUNT(*) FROM bookings WHERE status='PENDING_PAYMENT'", Long.class));
        stats.put("paidBookings", jdbc.queryForObject("SELECT COUNT(*) FROM bookings WHERE status='PAID'", Long.class));
        stats.put("cancelledBookings", jdbc.queryForObject("SELECT COUNT(*) FROM bookings WHERE status='CANCELLED'", Long.class));
        stats.put("totalRevenue", jdbc.queryForObject("SELECT COALESCE(SUM(total_price),0) FROM bookings WHERE status='PAID'", Long.class));

        stats.put("topVehicles", jdbc.queryForList(
            "SELECT v.name, COUNT(b.id) as booking_count, COALESCE(SUM(b.total_price),0) as total_revenue " +
            "FROM bookings b JOIN vehicles v ON b.vehicle_id = v.id WHERE b.status != 'CANCELLED' " +
            "GROUP BY v.id, v.name ORDER BY booking_count DESC LIMIT 5"));

        stats.put("recentBookings", jdbc.queryForList(
            "SELECT b.id, b.status, b.total_price, b.created_at, b.start_time, b.end_time, " +
            "u.full_name, u.email, v.name as vehicle_name " +
            "FROM bookings b JOIN users u ON b.user_id = u.id JOIN vehicles v ON b.vehicle_id = v.id " +
            "ORDER BY b.created_at DESC LIMIT 10"));

        stats.put("revenueByDay", jdbc.queryForList(
            "SELECT DATE(created_at) as date, COUNT(*) as count, COALESCE(SUM(total_price),0) as revenue " +
            "FROM bookings WHERE status='PAID' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30"));

        stats.put("bookingsByStatus", jdbc.queryForList(
            "SELECT status, COUNT(*) as count FROM bookings GROUP BY status"));

        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/report")
    public ResponseEntity<?> getReport(
            @RequestParam String period,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        String dateFilter = "";
        if (from != null && to != null) {
            dateFilter = " AND b.created_at >= '" + from + "'::date AND b.created_at < ('" + to + "'::date + interval '1 day') ";
        } else {
            switch (period) {
                case "day": dateFilter = " AND DATE(b.created_at) = CURRENT_DATE "; break;
                case "week": dateFilter = " AND b.created_at >= date_trunc('week', CURRENT_DATE) "; break;
                case "month": dateFilter = " AND b.created_at >= date_trunc('month', CURRENT_DATE) "; break;
                case "year": dateFilter = " AND b.created_at >= date_trunc('year', CURRENT_DATE) "; break;
            }
        }

        List<Map<String, Object>> data = jdbc.queryForList(
            "SELECT b.id, b.status, b.total_price, b.created_at, b.start_time, b.end_time, " +
            "u.full_name, u.email, v.name as vehicle_name " +
            "FROM bookings b JOIN users u ON b.user_id = u.id JOIN vehicles v ON b.vehicle_id = v.id " +
            "WHERE 1=1 " + dateFilter +
            "ORDER BY b.created_at DESC");

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("period", period);
        summary.put("totalBookings", data.size());
        summary.put("totalRevenue", data.stream()
            .filter(r -> "PAID".equals(r.get("status")))
            .mapToLong(r -> ((Number)r.get("total_price")).longValue()).sum());
        summary.put("bookings", data);

        return ResponseEntity.ok(ApiResponse.ok(summary));
    }
}
