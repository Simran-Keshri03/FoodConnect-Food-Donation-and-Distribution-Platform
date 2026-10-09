package com.foodconnect.dto.response;

import com.foodconnect.entity.DonationRequest;
import com.foodconnect.entity.RequestStatus;

import java.time.LocalDateTime;

public class DonationRequestResponse {
    private Long id;
    private DonationResponse donation;
    private UserSummaryDto ngo;
    private String message;
    private RequestStatus status;
    private LocalDateTime requestedAt;

    public DonationRequestResponse() {
    }

    public static DonationRequestResponse fromEntity(DonationRequest req) {
        if (req == null) return null;
        DonationRequestResponse res = new DonationRequestResponse();
        res.setId(req.getId());
        res.setMessage(req.getMessage());
        res.setStatus(req.getStatus());
        res.setRequestedAt(req.getRequestedAt());
        if (req.getDonation() != null) {
            res.setDonation(DonationResponse.fromEntity(req.getDonation()));
        }
        if (req.getNgo() != null) {
            res.setNgo(UserSummaryDto.fromEntity(req.getNgo()));
        }
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public DonationResponse getDonation() {
        return donation;
    }

    public void setDonation(DonationResponse donation) {
        this.donation = donation;
    }

    public UserSummaryDto getNgo() {
        return ngo;
    }

    public void setNgo(UserSummaryDto ngo) {
        this.ngo = ngo;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }
}
