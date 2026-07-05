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
        if (vehicleRepo.count() > 0) return;

        userRepo.save(User.builder()
                .fullName("Admin VOLTA")
                .email("admin@voltaride.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .isVerified(true)
                .build());

        VehicleCategory scooter = categoryRepo.save(
                VehicleCategory.builder().name("Scooter").description("Xe tay ga dien").build());
        VehicleCategory sport = categoryRepo.save(
                VehicleCategory.builder().name("Sport").description("Xe the thao dien").build());
        VehicleCategory city = categoryRepo.save(
                VehicleCategory.builder().name("City Bike").description("Xe di pho").build());
        VehicleCategory premium = categoryRepo.save(
                VehicleCategory.builder().name("Premium").description("Xe cao cap").build());

        vehicleRepo.saveAll(List.of(
            Vehicle.builder()
                .name("VOLTA S1 Pro").brand("VOLTA").model("S1 Pro")
                .pricePerHour(new BigDecimal("25000")).pricePerDay(new BigDecimal("149000"))
                .batteryCapacity(72).rangeKm(120).maxSpeed(80)
                .description("Xe tay ga dien cao cap, phu hop di chuyen trong thanh pho. Pin lithium 72V, sac nhanh 3 tieng.")
                .thumbnailUrl("/images/volta-s1-pro.jpg")
                .imageUrls(List.of("/images/volta-s1-pro.jpg"))
                .status(VehicleStatus.AVAILABLE).category(scooter).build(),

            Vehicle.builder()
                .name("VOLTA Racing X").brand("VOLTA").model("Racing X")
                .pricePerHour(new BigDecimal("35000")).pricePerDay(new BigDecimal("199000"))
                .batteryCapacity(96).rangeKm(150).maxSpeed(110)
                .description("Xe the thao dien manh me, toc do cao, thiet ke khi dong hoc.")
                .thumbnailUrl("/images/volta-racing-x.jpg")
                .imageUrls(List.of("/images/volta-racing-x.jpg"))
                .status(VehicleStatus.AVAILABLE).category(sport).build(),

            Vehicle.builder()
                .name("VOLTA City Lite").brand("VOLTA").model("City Lite")
                .pricePerHour(new BigDecimal("18000")).pricePerDay(new BigDecimal("99000"))
                .batteryCapacity(48).rangeKm(80).maxSpeed(50)
                .description("Xe gon nhe, ly tuong cho sinh vien va dao pho. Gia thue tiet kiem nhat.")
                .thumbnailUrl("/images/volta-city-lite.jpg")
                .imageUrls(List.of("/images/volta-city-lite.jpg"))
                .status(VehicleStatus.AVAILABLE).category(city).build(),

            Vehicle.builder()
                .name("VOLTA Turbo Z").brand("VOLTA").model("Turbo Z")
                .pricePerHour(new BigDecimal("40000")).pricePerDay(new BigDecimal("249000"))
                .batteryCapacity(108).rangeKm(180).maxSpeed(120)
                .description("Flagship model, pin khung 108V, di xa 180km. Co phanh ABS va he thong chong trom.")
                .thumbnailUrl("/images/volta-turbo-z.jpg")
                .imageUrls(List.of("/images/volta-turbo-z.jpg"))
                .status(VehicleStatus.AVAILABLE).category(sport).build(),

            Vehicle.builder()
                .name("VOLTA Eco 3").brand("VOLTA").model("Eco 3")
                .pricePerHour(new BigDecimal("15000")).pricePerDay(new BigDecimal("79000"))
                .batteryCapacity(36).rangeKm(60).maxSpeed(45)
                .description("Mau xe tiet kiem nhat, phu hop quang duong ngan.")
                .thumbnailUrl("/images/volta-eco-3.jpg")
                .imageUrls(List.of("/images/volta-eco-3.jpg"))
                .status(VehicleStatus.AVAILABLE).category(city).build(),

            Vehicle.builder()
                .name("VOLTA Phantom").brand("VOLTA").model("Phantom")
                .pricePerHour(new BigDecimal("45000")).pricePerDay(new BigDecimal("279000"))
                .batteryCapacity(120).rangeKm(200).maxSpeed(130)
                .description("Sieu pham gioi han, cong nghe tu can bang, man hinh HUD, ket noi app.")
                .thumbnailUrl("/images/volta-phantom.jpg")
                .imageUrls(List.of("/images/volta-phantom.jpg"))
                .status(VehicleStatus.AVAILABLE).category(premium).build(),

            Vehicle.builder()
                .name("VinFast Evo 200").brand("VinFast").model("Evo 200")
                .pricePerHour(new BigDecimal("30000")).pricePerDay(new BigDecimal("169000"))
                .batteryCapacity(60).rangeKm(110).maxSpeed(89)
                .description("Xe dien VinFast thiet ke hien dai, man hinh LCD, he thong khoa thong minh.")
                .thumbnailUrl("/images/vinfast-evo200.jpg")
                .imageUrls(List.of("/images/vinfast-evo200.jpg"))
                .status(VehicleStatus.AVAILABLE).category(scooter).build(),

            Vehicle.builder()
                .name("VinFast Feliz S").brand("VinFast").model("Feliz S")
                .pricePerHour(new BigDecimal("22000")).pricePerDay(new BigDecimal("129000"))
                .batteryCapacity(38).rangeKm(75).maxSpeed(64)
                .description("Xe ga dien nho gon tu VinFast, pin thao lap de dang, sac tai nha.")
                .thumbnailUrl("/images/vinfast-feliz-s.jpg")
                .imageUrls(List.of("/images/vinfast-feliz-s.jpg"))
                .status(VehicleStatus.AVAILABLE).category(city).build(),

            Vehicle.builder()
                .name("VinFast Vento S").brand("VinFast").model("Vento S")
                .pricePerHour(new BigDecimal("28000")).pricePerDay(new BigDecimal("159000"))
                .batteryCapacity(56).rangeKm(100).maxSpeed(80)
                .description("Dong xe so dien VinFast, thiet ke nam tinh, manh me, phu hop di tour.")
                .thumbnailUrl("/images/vinfast-vento-s.jpg")
                .imageUrls(List.of("/images/vinfast-vento-s.jpg"))
                .status(VehicleStatus.AVAILABLE).category(sport).build(),

            Vehicle.builder()
                .name("Yadea G5").brand("Yadea").model("G5")
                .pricePerHour(new BigDecimal("20000")).pricePerDay(new BigDecimal("119000"))
                .batteryCapacity(60).rangeKm(90).maxSpeed(70)
                .description("Xe ga dien Yadea ban chay nhat, thiet ke chau Au, pin GTR lon.")
                .thumbnailUrl("/images/yadea-g5.jpg")
                .imageUrls(List.of("/images/yadea-g5.jpg"))
                .status(VehicleStatus.AVAILABLE).category(scooter).build(),

            Vehicle.builder()
                .name("Yadea S3 Pro").brand("Yadea").model("S3 Pro")
                .pricePerHour(new BigDecimal("16000")).pricePerDay(new BigDecimal("89000"))
                .batteryCapacity(42).rangeKm(65).maxSpeed(50)
                .description("Xe dien gia re tu Yadea, nhe nhang, de lai, phu hop nu gioi.")
                .thumbnailUrl("/images/yadea-s3-pro.jpg")
                .imageUrls(List.of("/images/yadea-s3-pro.jpg"))
                .status(VehicleStatus.AVAILABLE).category(city).build(),

            Vehicle.builder()
                .name("Dat Bike Weaver++").brand("Dat Bike").model("Weaver++")
                .pricePerHour(new BigDecimal("38000")).pricePerDay(new BigDecimal("219000"))
                .batteryCapacity(96).rangeKm(200).maxSpeed(95)
                .description("Xe dien Viet Nam, dong co manh 5kW, di 200km mot lan sac, dang naked bike.")
                .thumbnailUrl("/images/datbike-weaver.jpg")
                .imageUrls(List.of("/images/datbike-weaver.jpg"))
                .status(VehicleStatus.AVAILABLE).category(sport).build(),

            Vehicle.builder()
                .name("Pega eSmart AI").brand("Pega").model("eSmart AI")
                .pricePerHour(new BigDecimal("14000")).pricePerDay(new BigDecimal("69000"))
                .batteryCapacity(30).rangeKm(50).maxSpeed(40)
                .description("Xe dien gia sieu re tu Pega, co khoa tu xa, dinh vi GPS.")
                .thumbnailUrl("/images/pega-esmart.jpg")
                .imageUrls(List.of("/images/pega-esmart.jpg"))
                .status(VehicleStatus.AVAILABLE).category(city).build(),

            Vehicle.builder()
                .name("Mbigo MBI S").brand("MBI").model("MBI S")
                .pricePerHour(new BigDecimal("19000")).pricePerDay(new BigDecimal("109000"))
                .batteryCapacity(52).rangeKm(85).maxSpeed(60)
                .description("Xe ga dien MBI thiet ke retro, phong cach co dien, pin lithium ben bi.")
                .thumbnailUrl("/images/mbi-s.jpg")
                .imageUrls(List.of("/images/mbi-s.jpg"))
                .status(VehicleStatus.AVAILABLE).category(scooter).build(),

            Vehicle.builder()
                .name("VOLTA Storm GT").brand("VOLTA").model("Storm GT")
                .pricePerHour(new BigDecimal("50000")).pricePerDay(new BigDecimal("299000"))
                .batteryCapacity(144).rangeKm(250).maxSpeed(140)
                .description("Sieu xe dien VOLTA, dong co kep, phanh Brembo, giam xoc Ohlins, gioi han 50 chiec.")
                .thumbnailUrl("/images/volta-storm-gt.jpg")
                .imageUrls(List.of("/images/volta-storm-gt.jpg"))
                .status(VehicleStatus.AVAILABLE).category(premium).build(),

            Vehicle.builder()
                .name("NIU NQi GTS").brand("NIU").model("NQi GTS")
                .pricePerHour(new BigDecimal("26000")).pricePerDay(new BigDecimal("149000"))
                .batteryCapacity(60).rangeKm(100).maxSpeed(70)
                .description("Xe ga dien NIU noi tieng the gioi, ket noi app, dinh vi, chong trom.")
                .thumbnailUrl("/images/niu-nqi-gts.jpg")
                .imageUrls(List.of("/images/niu-nqi-gts.jpg"))
                .status(VehicleStatus.AVAILABLE).category(scooter).build()
        ));

        System.out.println("=== Data seeded: 1 admin + 4 categories + 16 vehicles ===");
    }
}
