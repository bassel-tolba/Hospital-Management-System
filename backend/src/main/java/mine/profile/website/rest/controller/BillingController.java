package mine.profile.website.rest.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.BillingDTO;
import mine.profile.website.dtos.PaymentDTO;
import mine.profile.website.service.BillingService;
import mine.profile.website.service.PaymentService;

@RestController
@RequestMapping("/api/billings")
public class BillingController {

    private final BillingService billingService;
    private final PaymentService paymentService;

    public BillingController(BillingService billingService, PaymentService paymentService) {
        this.billingService = billingService;
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<BillingDTO> createBilling(@RequestBody BillingDTO billingDTO) {
        BillingDTO createdBilling = billingService.createBilling(billingDTO);
        return new ResponseEntity<>(createdBilling, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<BillingDTO>> getAllBillings(
            @RequestParam(name = "patientId", required = false) Long patientId,
            Pageable pageable) {
        Page<BillingDTO> billings;
        if (patientId != null) {
            billings = billingService.findByPatientId(patientId, pageable);
        } else {
            billings = billingService.findAll(pageable);
        }
        return new ResponseEntity<>(billings, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BillingDTO> getBillingById(@PathVariable Long id) {
        BillingDTO billing = billingService.findById(id);
        return new ResponseEntity<>(billing, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<BillingDTO> getActiveBillingByPatientId(@RequestParam(name = "patientId") Long patientId) {
        BillingDTO billing = billingService.findActiveBillByPatientId(patientId);
        return new ResponseEntity<>(billing, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillingDTO> updateBilling(@PathVariable Long id) {
        BillingDTO billing = billingService.updateBillingTotal(id);
        return new ResponseEntity<>(billing, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBilling(@PathVariable Long id) {
        billingService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{billingId}/payments")
    public ResponseEntity<PaymentDTO> addPaymentToBilling(
            @PathVariable Long billingId,
            @RequestBody PaymentDTO paymentDTO) {
        PaymentDTO createdPayment = paymentService.createPayment(billingId, paymentDTO);
        billingService.updateBillingTotal(billingId);
        return new ResponseEntity<>(createdPayment, HttpStatus.CREATED);
    }
}