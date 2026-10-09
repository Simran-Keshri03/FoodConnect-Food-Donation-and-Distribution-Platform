package com.foodconnect.controller;

import com.foodconnect.dto.request.CreateDonationRequestDto;
import com.foodconnect.dto.request.RequestStatusUpdateRequest;
import com.foodconnect.dto.response.ApiResponse;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.security.UserPrincipal;
import com.foodconnect.service.DonationRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donation-requests")
public class DonationRequestController {

    private final DonationRequestService requestService;

    public DonationRequestController(DonationRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> createRequest(
            @Valid @RequestBody CreateDonationRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationRequestResponse response = requestService.createRequest(requestDto, currentUser);
        return new ResponseEntity<>(
                ApiResponse.success("Donation request submitted successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasAuthority('ROLE_NGO')")
    public ResponseEntity<ApiResponse<List<DonationRequestResponse>>> getMyRequests(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<DonationRequestResponse> list = requestService.getMyRequests(currentUser);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/received")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<List<DonationRequestResponse>>> getReceivedRequests(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<DonationRequestResponse> list = requestService.getReceivedRequests(currentUser);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_DONOR')")
    public ResponseEntity<ApiResponse<DonationRequestResponse>> updateRequestStatus(
            @PathVariable Long id,
            @Valid @RequestBody RequestStatusUpdateRequest statusRequest,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DonationRequestResponse response = requestService.updateRequestStatus(id, statusRequest.getStatus(), currentUser);
        return ResponseEntity.ok(ApiResponse.success("Donation request status updated", response));
    }
}
