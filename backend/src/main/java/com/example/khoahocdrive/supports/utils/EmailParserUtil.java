package com.example.khoahocdrive.supports.utils;


import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class EmailParserUtil {

    public static class TransferInfo {
        public String customerName;
        public String amountTransferred;
        public String transferTime;
        public String currentBalance;
        public String description;

        @Override
        public String toString() {
            return "TransferInfo{" +
                    "customerName='" + customerName + '\'' +
                    ", amountTransferred='" + amountTransferred + '\'' +
                    ", transferTime='" + transferTime + '\'' +
                    ", currentBalance='" + currentBalance + '\'' +
                    ", description='" + description + '\'' +
                    '}';
        }
    }

    public static TransferInfo parseTransferInfoFromBody(String htmlBody) {
        Document doc = Jsoup.parse(htmlBody);

        TransferInfo info = new TransferInfo();

        // Lấy tên khách hàng trong thẻ span.customer-name
        Element nameElem = doc.selectFirst("span.customer-name");
        if (nameElem != null) {
            info.customerName = nameElem.text();
        }

        // Lấy đoạn chứa thông tin chuyển khoản
        String bodyText = doc.select("div.template__body").text();

        info.amountTransferred = extractRegex(bodyText, "vừa tăng ([\\d.,]+ VND)");
        info.transferTime = extractRegex(bodyText, "vào ([\\d/\\s:]+)\\.");
        info.currentBalance = extractRegex(bodyText, "Số dư hiện tại: ([\\d.,]+ VND)");
        Pattern p = Pattern.compile(
                "Mô tả:\\s*([\\s\\S]*?\\.)\\s*(?=Cảm ơn)"
        );
        Matcher m = p.matcher(bodyText);

        String description = null;
        if (m.find()) {
            description = m.group(1).trim();

        }
        String desc = description.trim();
        desc = desc.replaceFirst("\\.$", "");
        desc = desc.replace(".", ";");
        info.description = desc;

        return info;
    }

    private static String extractRegex(String text, String regex) {
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return null;
    }
    public static BigDecimal parseAmountToBigDecimal(String amountStr) {
        if (amountStr == null || amountStr.isEmpty()) return BigDecimal.ZERO;
        String cleaned = amountStr.replaceAll("VND", "").trim().replaceAll("[.,]", "");
        try {
            return new BigDecimal(cleaned);
        } catch (NumberFormatException e) {
            e.printStackTrace();
            return BigDecimal.ZERO;
        }
    }

    public static Date parseStringToDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/yyyy HH:mm");
        try {
            return formatter.parse(dateStr);
        } catch (ParseException e) {
            e.printStackTrace();
            return null;
        }
    }
}
