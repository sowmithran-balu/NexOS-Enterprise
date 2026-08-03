package com.erp.common.security;

import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Arrays;

@Component
public class TotpManager {

    private static final String ALGORITHM = "HmacSHA1";
    private static final int CODE_LENGTH = 6;
    private static final int TIME_WINDOW = 30; // 30 seconds
    private static final int CLOCK_DRIFT_WINDOW = 1; // Allow 1 step backward/forward

    // Base32 Alphabet used by Google Authenticator
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    public String generateSecret() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[10]; // 80 bits secret
        random.nextBytes(bytes);
        return encodeBase32(bytes);
    }

    public String getQrCodeUrl(String secret, String username, String issuer) {
        return String.format("otpauth://totp/%s:%s?secret=%s&issuer=%s",
                issuer, username, secret, issuer);
    }

    public boolean verifyCode(String secret, String codeStr) {
        try {
            int code = Integer.parseInt(codeStr);
            long currentWindow = System.currentTimeMillis() / 1000 / TIME_WINDOW;
            byte[] decodedSecret = decodeBase32(secret);

            for (int i = -CLOCK_DRIFT_WINDOW; i <= CLOCK_DRIFT_WINDOW; i++) {
                if (calculateCode(decodedSecret, currentWindow + i) == code) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Ignore parse errors or crypt failures
        }
        return false;
    }

    private static int calculateCode(byte[] key, long time) throws GeneralSecurityException {
        byte[] data = new byte[8];
        long value = time;
        for (int i = 7; i >= 0; i--) {
            data[i] = (byte) (value & 0xFF);
            value >>= 8;
        }

        SecretKeySpec signKey = new SecretKeySpec(key, ALGORITHM);
        Mac mac = Mac.getInstance(ALGORITHM);
        mac.init(signKey);
        byte[] hash = mac.doFinal(data);

        int offset = hash[hash.length - 1] & 0xF;
        long truncatedHash = 0;
        for (int i = 0; i < 4; ++i) {
            truncatedHash <<= 8;
            truncatedHash |= (hash[offset + i] & 0xFF);
        }

        truncatedHash &= 0x7FFFFFFF;
        truncatedHash %= 1_000_000; // 6 digits

        return (int) truncatedHash;
    }

    private static String encodeBase32(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        int i = 0, index = 0, digit = 0;
        int currByte, nextByte;

        while (i < bytes.length) {
            currByte = (bytes[i] >= 0) ? bytes[i] : (bytes[i] + 256);

            if (index > 3) {
                if (i + 1 < bytes.length) {
                    nextByte = (bytes[i + 1] >= 0) ? bytes[i + 1] : (bytes[i + 1] + 256);
                } else {
                    nextByte = 0;
                }
                digit = currByte & (0xFF >> index);
                index = (index + 5) % 8;
                digit <<= index;
                digit |= nextByte >> (8 - index);
                i++;
            } else {
                digit = (currByte >> (8 - (index + 5))) & 0x1F;
                index = (index + 5) % 8;
                if (index == 0) {
                    i++;
                }
            }
            sb.append(BASE32_CHARS.charAt(digit));
        }
        return sb.toString();
    }

    private static byte[] decodeBase32(String base32) {
        String cleaned = base32.toUpperCase().replace(" ", "");
        int len = cleaned.length();
        byte[] bytes = new byte[len * 5 / 8];
        int index = 0;
        int lookup = 0;
        int buffer = 0;
        int bitsLeft = 0;

        for (int i = 0; i < len; i++) {
            char ch = cleaned.charAt(i);
            int value = BASE32_CHARS.indexOf(ch);
            if (value < 0) {
                continue; // Skip invalid
            }

            buffer <<= 5;
            buffer |= value;
            bitsLeft += 5;

            if (bitsLeft >= 8) {
                bytes[index++] = (byte) ((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return Arrays.copyOf(bytes, index);
    }
}
