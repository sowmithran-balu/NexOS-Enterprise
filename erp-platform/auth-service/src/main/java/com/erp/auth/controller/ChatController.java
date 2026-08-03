package com.erp.auth.controller;

import com.erp.auth.entity.ChatConversation;
import com.erp.auth.entity.ChatMessage;
import com.erp.auth.entity.User;
import com.erp.auth.repository.UserRepository;
import com.erp.auth.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversation>> getConversations(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(chatService.getUserConversations(username));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ChatConversation> createConversation(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        String title = request.getOrDefault("title", "New Conversation");
        return ResponseEntity.ok(chatService.createConversation(username, title));
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.getConversationMessages(id));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id) {
        chatService.deleteConversation(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/conversations/{id}/pin")
    public ResponseEntity<ChatConversation> togglePin(@PathVariable Long id) {
        return ResponseEntity.ok(chatService.togglePin(id));
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String content = request.get("content");
        String activeTab = request.getOrDefault("activeTab", "dashboard");
        String username = authentication.getName();
        return ResponseEntity.ok(chatService.sendMessage(id, content, activeTab, username));
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        boolean hasGeminiKey = user.getGeminiApiKey() != null && !user.getGeminiApiKey().trim().isEmpty();
        boolean hasOpenrouterKey = user.getOpenrouterApiKey() != null && !user.getOpenrouterApiKey().trim().isEmpty();

        String maskedGemini = hasGeminiKey ? "••••••••" : "";
        String maskedOpenrouter = hasOpenrouterKey ? "••••••••" : "";

        return ResponseEntity.ok(Map.of(
                "activeAiProvider", user.getActiveAiProvider() != null ? user.getActiveAiProvider() : "local",
                "geminiApiKey", maskedGemini,
                "openrouterApiKey", maskedOpenrouter,
                "openrouterModel", user.getOpenrouterModel() != null ? user.getOpenrouterModel() : "google/gemini-2.5-flash",
                "hasGeminiKey", hasGeminiKey,
                "hasOpenrouterKey", hasOpenrouterKey
        ));
    }

    @PostMapping("/settings")
    public ResponseEntity<Map<String, String>> updateSettings(
            Authentication authentication,
            @RequestBody Map<String, String> request) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        String provider = request.get("activeAiProvider");
        String geminiKey = request.get("geminiApiKey");
        String openrouterKey = request.get("openrouterApiKey");
        String model = request.get("openrouterModel");

        if (provider != null) {
            user.setActiveAiProvider(provider);
        }
        if (model != null) {
            user.setOpenrouterModel(model);
        }

        if (geminiKey != null && !geminiKey.trim().isEmpty() && !geminiKey.equals("••••••••")) {
            user.setGeminiApiKey(geminiKey.trim());
        }
        if (openrouterKey != null && !openrouterKey.trim().isEmpty() && !openrouterKey.equals("••••••••")) {
            user.setOpenrouterApiKey(openrouterKey.trim());
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
