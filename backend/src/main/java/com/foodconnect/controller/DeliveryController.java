package com.foodconnect.controller;

import com.foodconnect.dto.request.DeliveryStatusUpdateRequest;
import com.foodconnect.dto.response.ApiResponse;
import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping("/available")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getAvailableDeliveries() {
        List<DonationResponse> list = deliveryService.getAvailableDeliveries();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/{donationId}/accept")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> acceptDelivery(
            @PathVariable Long donationId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DeliveryResponse response = deliveryService.acceptDelivery(donationId, currentUser);
        return new ResponseEntity<>(
                ApiResponse.success("Delivery task accepted successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getMyDeliveries(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<DeliveryResponse> list = deliveryService.getMyDeliveries(currentUser);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_VOLUNTEER')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateDeliveryStatus(
            @PathVariable Long id,
            @Valid @RequestBody DeliveryStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DeliveryResponse response = deliveryService.updateDeliveryStatus(id, request.getStatus(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated successfully", response));
    }
}
