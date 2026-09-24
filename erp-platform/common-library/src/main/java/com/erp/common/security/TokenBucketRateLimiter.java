package com.erp.common.security;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe Token Bucket Rate Limiter with sliding-window token replenishment.
 * Allows bursts up to capacity and refills tokens smoothly based on the configured refill rate.
 */
public class TokenBucketRateLimiter {

    private final int capacity;
    private final int tokensPerMinute;
    private final ConcurrentHashMap<String, BucketState> buckets = new ConcurrentHashMap<>();

    public TokenBucketRateLimiter(int capacity, int tokensPerMinute) {
        this.capacity = capacity;
        this.tokensPerMinute = Math.max(1, tokensPerMinute);
    }

    public static class ConsumptionResult {
        private final boolean allowed;
        private final int remainingTokens;
        private final int limit;
        private final long resetSeconds;

        public ConsumptionResult(boolean allowed, int remainingTokens, int limit, long resetSeconds) {
            this.allowed = allowed;
            this.remainingTokens = remainingTokens;
            this.limit = limit;
            this.resetSeconds = resetSeconds;
        }

        public boolean isAllowed() { return allowed; }
        public int getRemainingTokens() { return remainingTokens; }
        public int getLimit() { return limit; }
        public long getResetSeconds() { return resetSeconds; }
    }

    private static class BucketState {
        private final AtomicInteger tokens;
        private final AtomicLong lastRefillTimestamp;

        BucketState(int initialTokens) {
            this.tokens = new AtomicInteger(initialTokens);
            this.lastRefillTimestamp = new AtomicLong(Instant.now().toEpochMilli());
        }
    }

    /**
     * Attempts to consume 1 token for the specified key (e.g., Client IP or User ID).
     */
    public ConsumptionResult tryConsume(String key) {
        return tryConsume(key, 1);
    }

    /**
     * Attempts to consume N tokens for the specified key.
     */
    public ConsumptionResult tryConsume(String key, int tokensToConsume) {
        BucketState state = buckets.computeIfAbsent(key, k -> new BucketState(capacity));

        refill(state);

        while (true) {
            int current = state.tokens.get();
            if (current < tokensToConsume) {
                long elapsedMillis = Instant.now().toEpochMilli() - state.lastRefillTimestamp.get();
                long millisUntilNextToken = Math.max(0, (60_000L / tokensPerMinute) - elapsedMillis);
                long resetSeconds = Math.max(1, (millisUntilNextToken + 999) / 1000);
                return new ConsumptionResult(false, 0, capacity, resetSeconds);
            }

            int next = current - tokensToConsume;
            if (state.tokens.compareAndSet(current, next)) {
                long resetSeconds = 60L;
                return new ConsumptionResult(true, next, capacity, resetSeconds);
            }
        }
    }

    private void refill(BucketState state) {
        long now = Instant.now().toEpochMilli();
        long lastRefill = state.lastRefillTimestamp.get();
        long elapsedMillis = now - lastRefill;

        if (elapsedMillis <= 0) {
            return;
        }

        long tokensToAdd = (elapsedMillis * tokensPerMinute) / 60_000L;
        if (tokensToAdd > 0) {
            if (state.lastRefillTimestamp.compareAndSet(lastRefill, now)) {
                state.tokens.updateAndGet(current -> Math.min(capacity, (int) (current + tokensToAdd)));
            }
        }
    }

    public void reset(String key) {
        buckets.remove(key);
    }

    public int getCapacity() {
        return capacity;
    }

    public int getTokensPerMinute() {
        return tokensPerMinute;
    }

    public int getActiveBucketsCount() {
        return buckets.size();
    }
}
