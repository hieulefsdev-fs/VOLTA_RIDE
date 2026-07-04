package com.voltaride.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiChatService {

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash}")
    private String model;

    @Value("${gemini.interactions-url:https://generativelanguage.googleapis.com/v1beta/interactions}")
    private String interactionsUrl;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String reply(String message) {
        if (message == null || message.trim().isEmpty()) {
            return "Bạn hãy nhập câu hỏi để VOLTA AI hỗ trợ nhé.";
        }

        String cleanApiKey = cleanApiKey(apiKey);

        if (cleanApiKey.isBlank()) {
            return fallbackReply(message) + "\n\nLưu ý: Backend chưa cấu hình GEMINI_API_KEY nên đang dùng câu trả lời dự phòng.";
        }

        try {
            String requestBody = buildRequestBody(message);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(interactionsUrl))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", cleanApiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                System.out.println("Gemini error status: " + response.statusCode());
                System.out.println("Gemini error body: " + response.body());

                return fallbackReply(message) + "\n\nLưu ý: Gemini API đang lỗi, hệ thống tạm dùng câu trả lời dự phòng.";
            }

            String reply = extractText(response.body());

            if (reply == null || reply.isBlank()) {
                return fallbackReply(message);
            }

            return reply.trim();
        } catch (Exception e) {
            e.printStackTrace();
            return fallbackReply(message) + "\n\nLưu ý: Gemini API đang gặp lỗi, hệ thống tạm dùng câu trả lời dự phòng.";
        }
    }

    private String buildRequestBody(String userMessage) {
        String systemPrompt = """
                Bạn là trợ lý AI của website VOLTA Ride.
                Website này cho thuê xe máy điện.
                Website có đăng ký tài khoản bằng email OTP, ví người dùng, nạp tiền qua VNPay sandbox, trang cá nhân và đổi avatar.

                Hãy trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, thân thiện.

                Chỉ tư vấn trong phạm vi:
                - giá thuê xe
                - dòng xe
                - pin xe
                - sạc xe
                - VNPay sandbox
                - ví người dùng
                - tài khoản
                - OTP
                - avatar
                - hỗ trợ dịch vụ

                Nếu người dùng hỏi ngoài phạm vi, hãy lịch sự nói rằng VOLTA Ride không hỗ trợ nội dung đó.
                Không bịa chính sách không có trong hệ thống.

                Bảng giá hiện tại:
                - Gói ngày: 149.000 VNĐ/ngày
                - Gói tuần: 890.000 VNĐ/tuần
                - Gói tháng: 2.990.000 VNĐ/tháng

                Dòng xe:
                - Volt City S: khoảng 90 km, sạc 2.5 giờ
                - Volt Premium X: khoảng 120 km, sạc 3 giờ
                - Volt Touring Pro: khoảng 150 km, sạc 3.5 giờ
                """;

        String input = systemPrompt + "\n\nCâu hỏi của khách hàng: " + userMessage;

        return "{"
                + "\"model\":\"" + escapeJson(model) + "\","
                + "\"input\":\"" + escapeJson(input) + "\""
                + "}";
    }

    private String extractText(String responseBody) {
        String outputText = findJsonStringValue(responseBody, "output_text");

        if (outputText != null && !outputText.isBlank()) {
            return outputText;
        }

        StringBuilder builder = new StringBuilder();

        Pattern pattern = Pattern.compile("\"text\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(responseBody);

        while (matcher.find()) {
            String text = unescapeJson(matcher.group(1));

            if (!text.isBlank()) {
                if (builder.length() > 0) {
                    builder.append("\n");
                }

                builder.append(text);
            }
        }

        return builder.toString();
    }

    private String findJsonStringValue(String json, String key) {
        Pattern pattern = Pattern.compile("\"" + Pattern.quote(key) + "\"\\s*:\\s*\"((?:\\\\.|[^\"\\\\])*)\"", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(json);

        if (matcher.find()) {
            return unescapeJson(matcher.group(1));
        }

        return "";
    }

    private String cleanApiKey(String value) {
        if (value == null) {
            return "";
        }

        return value.trim()
                .replace("\r", "")
                .replace("\n", "");
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);

            switch (c) {
                case '"' -> builder.append("\\\"");
                case '\\' -> builder.append("\\\\");
                case '\b' -> builder.append("\\b");
                case '\f' -> builder.append("\\f");
                case '\n' -> builder.append("\\n");
                case '\r' -> builder.append("\\r");
                case '\t' -> builder.append("\\t");
                default -> builder.append(c);
            }
        }

        return builder.toString();
    }

    private String unescapeJson(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder builder = new StringBuilder();

        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);

            if (c == '\\' && i + 1 < value.length()) {
                char next = value.charAt(i + 1);

                switch (next) {
                    case '"' -> {
                        builder.append('"');
                        i++;
                    }
                    case '\\' -> {
                        builder.append('\\');
                        i++;
                    }
                    case '/' -> {
                        builder.append('/');
                        i++;
                    }
                    case 'b' -> {
                        builder.append('\b');
                        i++;
                    }
                    case 'f' -> {
                        builder.append('\f');
                        i++;
                    }
                    case 'n' -> {
                        builder.append('\n');
                        i++;
                    }
                    case 'r' -> {
                        builder.append('\r');
                        i++;
                    }
                    case 't' -> {
                        builder.append('\t');
                        i++;
                    }
                    case 'u' -> {
                        if (i + 5 < value.length()) {
                            String hex = value.substring(i + 2, i + 6);

                            try {
                                builder.append((char) Integer.parseInt(hex, 16));
                                i += 5;
                            } catch (NumberFormatException ex) {
                                builder.append(c);
                            }
                        } else {
                            builder.append(c);
                        }
                    }
                    default -> builder.append(c);
                }
            } else {
                builder.append(c);
            }
        }

        return builder.toString();
    }

    private String fallbackReply(String message) {
        String text = message.toLowerCase();

        if (
                text.contains("thú cưng") ||
                text.contains("thu cung") ||
                text.contains("chó") ||
                text.contains("cho") ||
                text.contains("mèo") ||
                text.contains("meo")
        ) {
            return "Không. VOLTA Ride không bán thú cưng. Website này chỉ hỗ trợ thuê xe máy điện, ví người dùng, VNPay, tài khoản và dịch vụ liên quan.";
        }

        if (
                text.contains("giá") ||
                text.contains("gia") ||
                text.contains("bảng giá") ||
                text.contains("bang gia") ||
                text.contains("thuê") ||
                text.contains("thue")
        ) {
            return "VOLTA Ride hiện có 3 gói chính: gói ngày 149.000 VNĐ/ngày, gói tuần 890.000 VNĐ/tuần và gói tháng 2.990.000 VNĐ/tháng.";
        }

        if (
                text.contains("vnpay") ||
                text.contains("nạp") ||
                text.contains("nap") ||
                text.contains("ví") ||
                text.contains("vi") ||
                text.contains("thanh toán") ||
                text.contains("thanh toan")
        ) {
            return "Bạn vào Trang cá nhân, nhập số tiền muốn nạp rồi bấm Nạp qua VNPay. Sau khi thanh toán sandbox thành công, ví sẽ được cập nhật.";
        }

        if (
                text.contains("pin") ||
                text.contains("sạc") ||
                text.contains("sac") ||
                text.contains("km") ||
                text.contains("bao xa")
        ) {
            return "Tùy dòng xe, xe có thể đi khoảng 90 km, 120 km hoặc 150 km sau một lần sạc.";
        }

        if (
                text.contains("avatar") ||
                text.contains("ảnh") ||
                text.contains("anh") ||
                text.contains("trang cá nhân") ||
                text.contains("trang ca nhan")
        ) {
            return "Bạn bấm Trang cá nhân để đổi avatar, cập nhật thông tin và xem số dư ví.";
        }

        return "Mình có thể hỗ trợ bạn về giá thuê xe, pin, sạc, tài khoản, OTP, ví và nạp tiền VNPay sandbox của VOLTA Ride.";
    }
}