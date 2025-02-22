// PaymentDashboardService.java
package mine.profile.website.service.dashboard;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import mine.profile.website.dtos.dashboard.payments.PaymentStatisticsDTO;
import mine.profile.website.dtos.dashboard.payments.PaymentTrendDTO;
import mine.profile.website.models.Payment;
import mine.profile.website.repository.PaymentRepository;

@Service
public class PaymentDashboardService {

    private static final Logger log = LoggerFactory.getLogger(PaymentDashboardService.class);

    // Constants for JSON field names (same as before)
    private static final String ADMISSIONS = "admissions";
    private static final String PROCEDURES = "procedures";
    private static final String PRODUCTS = "products";
    private static final String LAB_RESULTS = "labResults";
    private static final String IMAGE_REPORTS = "imageReports";
    private static final String MEDICATIONS = "medications";
    private static final String AMOUNT = "amount";
    private static final String COUNT = "count";
    private static final String QUANTITY = "quantity";
    private static final String TYPE = "type";
    private static final String PROCEDURE_NAME = "procedureName";
    private static final String PRODUCT_NAME = "productName";
    private static final String TEST_NAME = "testName";
    private static final String REPORT_NAME = "reportName";
    private static final String MEDICATION_NAME = "medicationName";

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public PaymentStatisticsDTO getPaymentStatistics(LocalDateTime startDate, LocalDateTime endDate) {
        log.info("getPaymentStatistics called with startDate: {}, endDate: {}", startDate, endDate);

        List<Payment> payments = paymentRepository.findByPaymentDateBetween(startDate, endDate);
        log.info("Found {} payments within the date range.", payments.size());

        if (payments.isEmpty()) {
            return new PaymentStatisticsDTO(0, objectMapper.createObjectNode());
        }

        Map<Long, List<Payment>> paymentsByBillingId = payments.stream()
                .filter(payment -> payment.getBilling() != null)
                .collect(Collectors.groupingBy(payment -> payment.getBilling().getId()));

        Map<String, Double> totalServiceCounts = new HashMap<>();
        Map<String, Double> totalServiceAmounts = new HashMap<>();
        double grandTotalPaymentAmount = 0;

        for (List<Payment> billPayments : paymentsByBillingId.values()) {
            Payment latestPayment = billPayments.stream()
                    .max(java.util.Comparator.comparing(Payment::getPaymentDate))
                    .orElse(null);

            if (latestPayment == null) {
                continue;
            }

            grandTotalPaymentAmount += latestPayment.getAmount();

            if (latestPayment.getStatistics() != null && !latestPayment.getStatistics().isEmpty()) {
                try {
                    JsonNode root = objectMapper.readTree(latestPayment.getStatistics());

                    processCategory(root, ADMISSIONS, totalServiceCounts, totalServiceAmounts);
                    processCategory(root, PROCEDURES, totalServiceCounts, totalServiceAmounts);
                    processCategory(root, PRODUCTS, totalServiceCounts, totalServiceAmounts);
                    processCategory(root, LAB_RESULTS, totalServiceCounts, totalServiceAmounts);
                    processCategory(root, IMAGE_REPORTS, totalServiceCounts, totalServiceAmounts);
                    processCategory(root, MEDICATIONS, totalServiceCounts, totalServiceAmounts);

                } catch (JsonProcessingException e) {
                    log.error("Error parsing statistics JSON for payment ID {}: {}", latestPayment.getId(),
                            e.getMessage());
                }
            }
        }

        ObjectNode aggregatedDetails = objectMapper.createObjectNode();
        double totalServiceAmount = totalServiceAmounts.values().stream().mapToDouble(Double::doubleValue).sum();

        for (String service : totalServiceCounts.keySet()) {
            double count = totalServiceCounts.get(service);
            double amount = totalServiceAmounts.get(service);
            double percentage = (totalServiceAmount > 0) ? (amount / totalServiceAmount) * 100 : 0;

            ObjectNode serviceNode = objectMapper.createObjectNode();
            serviceNode.put(COUNT, String.format("%.2f", count));
            serviceNode.put(AMOUNT, String.format("%.2f", amount));
            serviceNode.put("percentage", String.format("%.2f", percentage)); // Consistent naming
            aggregatedDetails.set(service, serviceNode);
        }

        log.info("Final Aggregated Details: {}", aggregatedDetails);
        log.info("Grand Total Payment Amount: {}", grandTotalPaymentAmount);
        return new PaymentStatisticsDTO(grandTotalPaymentAmount, aggregatedDetails);
    }

    private void processCategory(JsonNode node, String categoryName, Map<String, Double> serviceCounts,
            Map<String, Double> serviceTotalAmounts) {
        if (node.has(categoryName)) {
            JsonNode categoryNode = node.get(categoryName);
            if (categoryNode.isArray()) {
                for (JsonNode itemNode : categoryNode) {
                    String serviceName = getServiceName(itemNode, categoryName);
                    double amount = itemNode.has(AMOUNT) ? itemNode.get(AMOUNT).asDouble() : 0;
                    double quantity = itemNode.has(QUANTITY) ? itemNode.get(QUANTITY).asDouble()
                            : itemNode.has(COUNT) ? itemNode.get(COUNT).asDouble() : 1.0;

                    serviceCounts.merge(serviceName, quantity, Double::sum);
                    serviceTotalAmounts.merge(serviceName, amount, Double::sum);
                }
            }
        }
    }

    private String getServiceName(JsonNode itemNode, String categoryName) {
        switch (categoryName) {
            case ADMISSIONS:
                return itemNode.has(TYPE) ? itemNode.get(TYPE).asText() : "Unknown Admission";
            case PROCEDURES:
                return itemNode.has(PROCEDURE_NAME) ? itemNode.get(PROCEDURE_NAME).asText() : "Unknown Procedure";
            case PRODUCTS:
                return itemNode.has(PRODUCT_NAME) ? itemNode.get(PRODUCT_NAME).asText() : "Unknown Product";
            case LAB_RESULTS:
                return itemNode.has(TEST_NAME) ? itemNode.get(TEST_NAME).asText() : "Unknown Lab Test";
            case IMAGE_REPORTS:
                return itemNode.has(REPORT_NAME) ? itemNode.get(REPORT_NAME).asText() : "Unknown Image Report";
            case MEDICATIONS:
                return itemNode.has(MEDICATION_NAME) ? itemNode.get(MEDICATION_NAME).asText() : "Unknown Medication";
            default:
                return "Unknown";
        }
    }

    @Transactional(readOnly = true)
    public List<PaymentTrendDTO> getPaymentTrend(
            LocalDateTime startDate, LocalDateTime endDate, ChronoUnit unit, DateTimeFormatter formatter) {
        List<Payment> payments = paymentRepository.findByPaymentDateBetween(startDate, endDate);

        Map<String, Map<String, PaymentTrendDTO>> trendDataMap = new HashMap<>(); // <Date, <Category, DTO>>

        for (Payment payment : payments) {
            if (payment.getStatistics() == null || payment.getStatistics().isEmpty()) {
                continue;
            }

            LocalDateTime paymentDate = payment.getPaymentDate();
            String formattedDate = paymentDate.truncatedTo(unit).format(formatter); // Format the date

            try {
                JsonNode root = objectMapper.readTree(payment.getStatistics());

                processCategoryForTrend(root, ADMISSIONS, formattedDate, trendDataMap);
                processCategoryForTrend(root, PROCEDURES, formattedDate, trendDataMap);
                processCategoryForTrend(root, PRODUCTS, formattedDate, trendDataMap);
                processCategoryForTrend(root, LAB_RESULTS, formattedDate, trendDataMap);
                processCategoryForTrend(root, IMAGE_REPORTS, formattedDate, trendDataMap);
                processCategoryForTrend(root, MEDICATIONS, formattedDate, trendDataMap);

            } catch (JsonProcessingException e) {
                log.error(
                        "Error parsing statistics JSON for payment ID {}: {}", payment.getId(), e.getMessage());
            }
        }

        // Flatten the map into a list and return
        List<PaymentTrendDTO> trendData = new ArrayList<>();
        trendDataMap.values().forEach(categoryMap -> trendData.addAll(categoryMap.values()));
        return trendData;
    }

    private void processCategoryForTrend(
            JsonNode node,
            String categoryName,
            String formattedDate,
            Map<String, Map<String, PaymentTrendDTO>> trendDataMap) {
        if (node.has(categoryName)) {
            JsonNode categoryNode = node.get(categoryName);
            if (categoryNode.isArray()) {
                for (JsonNode itemNode : categoryNode) {
                    String serviceName = getServiceName(itemNode, categoryName);
                    double amount = itemNode.has(AMOUNT) ? itemNode.get(AMOUNT).asDouble() : 0;
                    double quantity = itemNode.has(QUANTITY)
                            ? itemNode.get(QUANTITY).asDouble()
                            : itemNode.has(COUNT) ? itemNode.get(COUNT).asDouble() : 1.0;

                    trendDataMap
                            .computeIfAbsent(formattedDate, k -> new HashMap<>())
                            .compute(
                                    serviceName,
                                    (k, v) -> {
                                        if (v == null) {
                                            return new PaymentTrendDTO(formattedDate, serviceName, amount, quantity);
                                        } else {
                                            return new PaymentTrendDTO(
                                                    formattedDate,
                                                    serviceName,
                                                    v.getAmount() + amount,
                                                    v.getCount() + quantity);
                                        }
                                    });
                }
            }
        }
    }
}