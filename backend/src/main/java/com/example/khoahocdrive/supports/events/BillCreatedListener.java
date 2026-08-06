package com.example.khoahocdrive.supports.events;


import com.example.khoahocdrive.models.Bill;
import com.example.khoahocdrive.repository.BillRepository;
import com.example.khoahocdrive.service.VietQrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillCreatedListener {

    private final BillRepository billRepository;
    private final VietQrService vietQrService;

    @Async
    @EventListener
    public void handle(BillCreatedEvent event) {
        Bill bill = billRepository.findById(event.billId()).orElse(null);
        if (bill == null) {
            log.warn("Bill not found: id={}", event.billId());
            return;
        }

        try {
            vietQrService.confirmBill(bill);
        } catch (Exception e) {
            log.error("Confirm bill failed: billId={}, err={}", bill.getId(), e.getMessage(), e);
        }
    }
}