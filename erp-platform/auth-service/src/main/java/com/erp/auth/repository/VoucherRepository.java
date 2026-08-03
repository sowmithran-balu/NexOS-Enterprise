package com.erp.auth.repository;

import com.erp.auth.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    List<Voucher> findByCompanyId(Long companyId);
    List<Voucher> findByCompanyIdAndType(Long companyId, String type);
    List<Voucher> findByCompanyIdAndTypeAndLedgerId(Long companyId, String type, Long ledgerId);
}
