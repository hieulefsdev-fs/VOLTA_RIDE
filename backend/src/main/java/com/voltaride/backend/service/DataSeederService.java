package com.voltaride.backend.service;

import com.voltaride.backend.entity.*;
import com.voltaride.backend.enums.Role;
import com.voltaride.backend.enums.VehicleStatus;
import com.voltaride.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeederService implements CommandLineRunner {

    private final VehicleCategoryRepository categoryRepo;
    private final VehicleRepository vehicleRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (vehicleRepo.count() > 0) return; // đã có data, skip

        // Tạo admin
        userRepo.save(User.builder()
                .fullName("Admin VOLTA")
                .email("admin@voltaride.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .isVerified(true)
                .build());

        // Tạo categories
        VehicleCategory scooter = categoryRepo.save(
                VehicleCategory.builder().name("Scooter").description("Xe tay ga điện").build());
        VehicleCategory sport = categoryRepo.save(
                VehicleCategory.builder().name("Sport").description("Xe thể thao điện").build());
        VehicleCategory city = categoryRepo.save(
                VehicleCategory.builder().name("City Bike").description("Xe đi phố").build());

        // Tạo xe mẫu
        vehicleRepo.saveAll(List.of(
                Vehicle.builder()
                        .name("VOLTA S1 Pro")
                        .brand("VOLTA").model("S1 Pro")
                        .pricePerHour(new BigDecimal("25000"))
                        .pricePerDay(new BigDecimal("149000"))
                        .batteryCapacity(72).rangeKm(120).maxSpeed(80)
                        .description("Xe tay ga điện cao cấp, phù hợp di chuyển trong thành phố. Pin lithium 72V, sạc nhanh 3 tiếng.")
                        .thumbnailUrl("/images/volta-s1-pro.jpg")
                        .imageUrls(List.of("/images/volta-s1-pro.jpg", "/images/volta-s1-pro-2.jpg"))
                        .status(VehicleStatus.AVAILABLE).category(scooter).build(),

                Vehicle.builder()
                        .name("VOLTA Racing X")
                        .brand("VOLTA").model("Racing X")
                        .pricePerHour(new BigDecimal("35000"))
                        .pricePerDay(new BigDecimal("199000"))
                        .batteryCapacity(96).rangeKm(150).maxSpeed(110)
                        .description("Xe thể thao điện mạnh mẽ, tốc độ cao, thiết kế khí động học. Dành cho người yêu tốc độ.")
                        .thumbnailUrl("/images/volta-racing-x.jpg")
                        .imageUrls(List.of("/images/volta-racing-x.jpg"))
                        .status(VehicleStatus.AVAILABLE).category(sport).build(),

                Vehicle.builder()
                        .name("VOLTA City Lite")
                        .brand("VOLTA").model("City Lite")
                        .pricePerHour(new BigDecimal("18000"))
                        .pricePerDay(new BigDecimal("99000"))
                        .batteryCapacity(48).rangeKm(80).maxSpeed(50)
                        .description("Nhỏ gọn, nhẹ nhàng, lý tưởng cho sinh viên và dạo phố. Giá thuê tiết kiệm nhất.")
                        .thumbnailUrl("/images/volta-city-lite.jpg")
                        .imageUrls(List.of("/images/volta-city-lite.jpg"))
                        .status(VehicleStatus.AVAILABLE).category(city).build(),

                Vehicle.builder()
                        .name("VOLTA Turbo Z")
                        .brand("VOLTA").model("Turbo Z")
                        .pricePerHour(new BigDecimal("40000"))
                        .pricePerDay(new BigDecimal("249000"))
                        .batteryCapacity(108).rangeKm(180).maxSpeed(120)
                        .description("Flagship model, pin khủng 108V, đi xa 180km. Có phanh ABS và hệ thống chống trộm thông minh.")
                        .thumbnailUrl("/images/volta-turbo-z.jpg")
                        .imageUrls(List.of("/images/volta-turbo-z.jpg"))
                        .status(VehicleStatus.AVAILABLE).category(sport).build(),

                Vehicle.builder()
                        .name("VOLTA Eco 3")
                        .brand("VOLTA").model("Eco 3")
                        .pricePerHour(new BigDecimal("15000"))
                        .pricePerDay(new BigDecimal("79000"))
                        .batteryCapacity(36).rangeKm(60).maxSpeed(45)
                        .description("Mẫu xe tiết kiệm nhất, phù hợp quãng đường ngắn. Nhẹ chỉ 55kg, dễ điều khiển.")
                        .thumbnailUrl("/images/volta-eco-3.jpg")
                        .imageUrls(List.of("/images/volta-eco-3.jpg"))
                        .status(VehicleStatus.AVAILABLE).category(city).build(),

                Vehicle.builder()
                        .name("VOLTA Phantom")
                        .brand("VOLTA").model("Phantom")
                        .pricePerHour(new BigDecimal("45000"))
                        .pricePerDay(new BigDecimal("279000"))
                        .batteryCapacity(120).rangeKm(200).maxSpeed(130)
                        .description("Siêu phẩm giới hạn, công nghệ tự cân bằng, màn hình HUD, kết nối app điện thoại.")
                        .thumbnailUrl("/images/volta-phantom.jpg")
                        .imageUrls(List.of("/images/volta-phantom.jpg"))
                        .status(VehicleStatus.AVAILABLE).category(sport).build()
        ));

        System.out.println("=== Data seeded: 1 admin + 3 categories + 6 vehicles ===");
    }
}
