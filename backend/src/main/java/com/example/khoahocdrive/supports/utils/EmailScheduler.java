package com.example.khoahocdrive.supports.utils;

import com.example.khoahocdrive.service.Impl.GmailService;
import com.example.khoahocdrive.service.OrderService;
import com.example.khoahocdrive.service.VietQrService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class EmailScheduler {
    @Autowired
    private final GmailService gmailService;

    @Autowired
    private final OrderService orderService;

    @Autowired
    private final VietQrService vietQrService;

    public EmailScheduler(GmailService gmailService, OrderService orderService,VietQrService vietQrService) {
        this.gmailService = gmailService;
        this.orderService = orderService;
        this.vietQrService = vietQrService;
    }


    // Chạy mỗi 1 phút (60000 ms)
    @Scheduled(fixedDelay = 15000)
    public void checkEmails() {
        try {
            gmailService.readTimoSuccessEmails();
        } catch (Exception e) {
            System.err.println("Lỗi khi đọc email: " + e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 604800000)
    public void checkOrders(){
        try {
            orderService.deleteOrder();
        }
        catch (Exception e){
            System.err.println("Lỗi khi xoa: " + e.getMessage());
        }
    }

}
