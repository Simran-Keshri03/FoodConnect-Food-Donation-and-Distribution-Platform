package com.foodconnect.controller;

import com.foodconnect.dto.request.CreateDonationRequest;
import com.foodconnect.dto.request.DonationStatusUpdateRequest;
import com.foodconnect.dto.request.UpdateDonationRequest;
import com.foodconnect.dto.response.ApiResponse;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.DonationStatus;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<DonationResponse>> createDonation(
            @Valid @RequestBody CreateDonationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationResponse response = donationService.createDonation(request, currentUser);
        return new ResponseEntity<>(
                ApiResponse.success("Food donation created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getDonations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) DonationStatus status,
            @RequestParam(required = false, defaultValue = "false") boolean availableOnly) {
        List<DonationResponse> list;
        if (availableOnly || (status == null && category == null)) {
            list = donationService.getAvailableDonations(category);
        } else {
            list = donationService.getAllDonations(category, status);
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<List<DonationResponse>>> getMyDonations(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<DonationResponse> list = donationService.getMyDonations(currentUser);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonationResponse>> getDonationById(@PathVariable Long id) {
        DonationResponse response = donationService.getDonationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<DonationResponse>> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDonationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationResponse response = donationService.updateDonation(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<DonationResponse>> updateDonationStatus(
            @PathVariable Long id,
            @Valid @RequestBody DonationStatusUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationResponse response = donationService.updateDonationStatus(id, request.getStatus(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<Void>> deleteDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        donationService.deleteDonation(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation removed successfully", null));
    }
}
