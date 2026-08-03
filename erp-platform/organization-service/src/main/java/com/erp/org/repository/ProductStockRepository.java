package com.erp.org.repository;

import com.erp.org.entity.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {
    List<ProductStock> findByCompanyId(Long companyId);
    List<ProductStock> findByCompanyIdAndProductId(Long companyId, Long productId);
    List<ProductStock> findByCompanyIdAndGodownId(Long companyId, Long godownId);
    Optional<ProductStock> findByCompanyIdAndProductIdAndGodownIdAndBatchNumberAndSerialNumber(
            Long companyId, Long productId, Long godownId, String batchNumber, String serialNumber);
}
