package com.erp.auth.service;

import com.erp.auth.entity.ChatConversation;
import com.erp.auth.entity.ChatMessage;
import com.erp.auth.repository.ChatConversationRepository;
import com.erp.auth.repository.ChatMessageRepository;
import com.erp.auth.repository.UserRepository;
import com.erp.common.context.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ChatService {

    @Autowired
    private ChatConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    public List<ChatConversation> getUserConversations(String username) {
        return userRepository.findByUsername(username)
                .map(user -> conversationRepository.findByUserIdOrderByPinnedDescUpdatedAtDesc(user.getId()))
                .orElse(List.of());
    }

    public ChatConversation createConversation(String username, String title) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    Long companyId = TenantContext.getCompanyId();
                    ChatConversation conv = new ChatConversation(companyId != null ? companyId : 0L, user.getId(), title);
                    return conversationRepository.save(conv);
                })
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public List<ChatMessage> getConversationMessages(Long conversationId) {
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public void deleteConversation(Long conversationId) {
        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.deleteById(conversationId);
    }

    public ChatConversation togglePin(Long conversationId) {
        Optional<ChatConversation> opt = conversationRepository.findById(conversationId);
        if (opt.isPresent()) {
            ChatConversation conv = opt.get();
            conv.setPinned(!conv.isPinned());
            return conversationRepository.save(conv);
        }
        throw new RuntimeException("Conversation not found: " + conversationId);
    }

    public ChatMessage sendMessage(Long conversationId, String messageText, String activeTab, String username) {
        // 1. Save user message
        ChatMessage userMessage = new ChatMessage(conversationId, "user", messageText);
        messageRepository.save(userMessage);

        // 2. Update conversation updated time
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            conv.setPinned(conv.isPinned()); // Triggers @PreUpdate
            conversationRepository.save(conv);
        });

        // 3. Look up user for AI keys
        com.erp.auth.entity.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        // 4. Generate response from AI
        String aiResponseText = aiService.generateResponse(messageText, activeTab, user);

        // 5. Save assistant response
        ChatMessage assistantMessage = new ChatMessage(conversationId, "assistant", aiResponseText);
        return messageRepository.save(assistantMessage);
    }
}
