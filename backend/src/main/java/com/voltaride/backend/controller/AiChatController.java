package com.voltaride.backend.controller;

import com.voltaride.backend.service.AiChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody AiChatRequest request) {
        String reply = aiChatService.reply(request.message());

        return ResponseEntity.ok(Map.of(
                "reply", reply
        ));
    }

    public record AiChatRequest(
            @NotBlank(message = "Tin nhan khong duoc de trong")
            String message
    ) {
    }
}