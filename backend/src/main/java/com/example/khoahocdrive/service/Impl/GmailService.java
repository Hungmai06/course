package com.example.khoahocdrive.service.Impl;

import com.example.khoahocdrive.supports.events.BillCreatedEvent;
import com.example.khoahocdrive.models.Bill;
import com.example.khoahocdrive.repository.BillRepository;
import com.example.khoahocdrive.supports.utils.EmailParserUtil;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.search.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GmailService {

    private final BillRepository billRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Value("${timo.sender}")
    private String timoSender;

    private static final String SUBJECT_EXPECTED = "Thông báo thay đổi số dư tài khoản";
    private static final int LOOKBACK_DAYS = 30;
    private static final boolean IMAP_DEBUG = false;

    public void readTimoSuccessEmails() throws Exception {
        try (Store store = openStoreWithPassword()) {
            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            // Search ổn định: From + Date (KHÔNG SubjectTerm tiếng Việt)
            Message[] messages = searchTimoInboxStable(inbox);

            if (messages == null || messages.length == 0) {
                log.info("No Timo messages found (lookback={} days).", LOOKBACK_DAYS);
                inbox.close(false);
                return;
            }

            // Prefetch headers
            prefetchHeaders(inbox, messages);

            // Tránh N+1 DB
            Set<String> existedMessageIds = fetchExistingMessageIds(messages);

            int savedCount = 0;

            for (Message msg : messages) {
                String subject = msg.getSubject();
                if (subject == null || !SUBJECT_EXPECTED.equals(subject.trim())) continue;

                String messageId = firstHeader(msg, "Message-ID");
                if (messageId != null && existedMessageIds.contains(messageId)) continue;

                String body = extractText(msg);
                if (body == null || body.isBlank()) continue;

                EmailParserUtil.TransferInfo info = EmailParserUtil.parseTransferInfoFromBody(body);
                if (info == null) continue;

                BigDecimal amount = EmailParserUtil.parseAmountToBigDecimal(info.amountTransferred);
                if (amount == null || amount.compareTo(BigDecimal.ZERO) == 0) continue;

                Date sent = EmailParserUtil.parseStringToDate(info.transferTime);

                Bill bill = Bill.builder()
                        .amount(amount)
                        .description(info.description == null ? null : info.description.trim())
                        .messageId(messageId)
                        .sentDate(sent)
                        .processed(false) // ✅ cần field processed trong Bill entity
                        .build();

                Bill saved = billRepository.save(bill);
                savedCount++;

                // ✅ Publish event sau khi lưu bill
                eventPublisher.publishEvent(new BillCreatedEvent(saved.getId()));
            }

            log.info("Saved {} new bill(s). Total scanned: {}", savedCount, messages.length);
            inbox.close(false);
        }
    }

    private Message[] searchTimoInboxStable(Folder inbox) throws MessagingException {
        SearchTerm from = new FromTerm(new InternetAddress(timoSender));
        Date since = new Date(System.currentTimeMillis() - LOOKBACK_DAYS * 24L * 60 * 60 * 1000);
        SearchTerm recent = new ReceivedDateTerm(ComparisonTerm.GE, since);
        return inbox.search(new AndTerm(from, recent));
    }

    private void prefetchHeaders(Folder inbox, Message[] messages) throws MessagingException {
        FetchProfile fp = new FetchProfile();
        fp.add(FetchProfile.Item.ENVELOPE);
        fp.add("Message-ID");
        inbox.fetch(messages, fp);
    }

    /**
     * YÊU CẦU BillRepository có method:
     *   @Query("select b.messageId from Bill b where b.messageId in :ids")
     *   List<String> findExistingMessageIds(@Param("ids") Collection<String> ids);
     */
    private Set<String> fetchExistingMessageIds(Message[] messages) throws MessagingException {
        List<String> ids = new ArrayList<>(messages.length);
        for (Message msg : messages) {
            String messageId = firstHeader(msg, "Message-ID");
            if (messageId != null && !messageId.isBlank()) ids.add(messageId);
        }
        if (ids.isEmpty()) return Collections.emptySet();

        List<String> existed = billRepository.findExistingMessageIds(ids);
        return existed == null ? Collections.emptySet() : new HashSet<>(existed);
    }

    private Store openStoreWithPassword() throws Exception {
        Properties props = new Properties();
        props.put("mail.imap.ssl.enable", "true");
        props.put("mail.imap.auth", "true");
        props.put("mail.imap.connectiontimeout", "10000");
        props.put("mail.imap.timeout", "20000");
        props.put("mail.imap.writetimeout", "20000");
        if (IMAP_DEBUG) {
            props.put("mail.debug", "true");
            props.put("mail.debug.auth", "true");
        }

        Session session = Session.getInstance(props);
        Store store = session.getStore("imap");
        store.connect("imap.gmail.com", 993, username, password);
        return store;
    }

    private String extractText(Part part) throws Exception {
        if (part.isMimeType("text/html")) {
            Object c = part.getContent();
            return c == null ? "" : c.toString();
        }
        if (part.isMimeType("text/plain")) {
            Object c = part.getContent();
            return c == null ? "" : c.toString();
        }
        if (part.isMimeType("multipart/*")) {
            Multipart mp = (Multipart) part.getContent();
            String html = null, plain = null;

            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart bp = mp.getBodyPart(i);
                String disp = bp.getDisposition();
                if (disp != null && disp.equalsIgnoreCase(Part.ATTACHMENT)) continue;

                if (bp.isMimeType("text/html") && html == null) html = extractText(bp);
                else if (bp.isMimeType("text/plain") && plain == null) plain = extractText(bp);
                else if (bp.isMimeType("multipart/*")) {
                    String nested = extractText(bp);
                    if (nested != null && !nested.isBlank() && plain == null) plain = nested;
                }
            }
            if (html != null && !html.isBlank()) return html;
            if (plain != null) return plain;
        }
        return "";
    }

    private String firstHeader(Message msg, String name) throws MessagingException {
        String[] arr = msg.getHeader(name);
        return (arr != null && arr.length > 0) ? arr[0] : null;
    }
}
