package com.voltaride.backend.service;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class WalletService {

    private final JdbcTemplate jdbcTemplate;

    public WalletService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initWalletTables() {
        jdbcTemplate.execute(
                "alter table users add column if not exists wallet_balance bigint not null default 0"
        );

        jdbcTemplate.execute(
                """
                create table if not exists wallet_transactions (
                    id bigserial primary key,
                    email varchar(255) not null,
                    amount bigint not null,
                    txn_ref varchar(100) not null unique,
                    provider varchar(50) not null,
                    status varchar(50) not null,
                    response_code varchar(20),
                    bank_code varchar(50),
                    created_at timestamp not null default now(),
                    paid_at timestamp
                )
                """
        );
    }

    public long getWalletBalance(String email) {
        String normalizedEmail = normalizeEmail(email);

        Long balance = jdbcTemplate.queryForObject(
                "select wallet_balance from users where lower(email) = lower(?)",
                Long.class,
                normalizedEmail
        );

        return balance == null ? 0 : balance;
    }

    public List<Map<String, Object>> getTransactions(String email) {
        String normalizedEmail = normalizeEmail(email);

        return jdbcTemplate.queryForList(
                """
                select id, email, amount, txn_ref, provider, status, response_code, bank_code, created_at, paid_at
                from wallet_transactions
                where lower(email) = lower(?)
                order by created_at desc
                limit 20
                """,
                normalizedEmail
        );
    }

    public void createPendingVnpayTransaction(String email, long amount, String txnRef) {
        String normalizedEmail = normalizeEmail(email);

        jdbcTemplate.update(
                """
                insert into wallet_transactions
                    (email, amount, txn_ref, provider, status, created_at)
                values
                    (?, ?, ?, 'VNPAY', 'PENDING', ?)
                """,
                normalizedEmail,
                amount,
                txnRef,
                LocalDateTime.now()
        );
    }

    public CompletePaymentResult completeVnpayTransaction(
            String txnRef,
            String responseCode,
            String bankCode
    ) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "select email, amount, status from wallet_transactions where txn_ref = ?",
                txnRef
        );

        if (rows.isEmpty()) {
            return new CompletePaymentResult(false, "", 0, "NOT_FOUND");
        }

        Map<String, Object> transaction = rows.get(0);

        String email = String.valueOf(transaction.get("email"));
        long amount = Number.class.cast(transaction.get("amount")).longValue();
        String currentStatus = String.valueOf(transaction.get("status"));

        if ("SUCCESS".equalsIgnoreCase(currentStatus)) {
            return new CompletePaymentResult(true, email, amount, "ALREADY_SUCCESS");
        }

        int updated = jdbcTemplate.update(
                """
                update wallet_transactions
                set status = 'SUCCESS',
                    response_code = ?,
                    bank_code = ?,
                    paid_at = ?
                where txn_ref = ?
                  and status <> 'SUCCESS'
                """,
                responseCode,
                bankCode,
                LocalDateTime.now(),
                txnRef
        );

        if (updated > 0) {
            jdbcTemplate.update(
                    "update users set wallet_balance = wallet_balance + ? where lower(email) = lower(?)",
                    amount,
                    email
            );

            return new CompletePaymentResult(true, email, amount, "SUCCESS");
        }

        return new CompletePaymentResult(false, email, amount, "FAILED");
    }

    public void failVnpayTransaction(String txnRef, String responseCode, String bankCode) {
        jdbcTemplate.update(
                """
                update wallet_transactions
                set status = 'FAILED',
                    response_code = ?,
                    bank_code = ?
                where txn_ref = ?
                  and status = 'PENDING'
                """,
                responseCode,
                bankCode,
                txnRef
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    public record CompletePaymentResult(
            boolean success,
            String email,
            long amount,
            String status
    ) {
    }
}