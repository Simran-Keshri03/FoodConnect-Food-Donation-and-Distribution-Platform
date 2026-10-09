package com.foodconnect.dto.request;

import com.foodconnect.entity.DonationStatus;
import jakarta.validation.constraints.NotNull;

public class DonationStatusUpdateRequest {

    @NotNull(message = "Donation status is required")
    private DonationStatus status;

    public DonationStatusUpdateRequest() {
    }

    public DonationStatusUpdateRequest(DonationStatus status) {
        this.status = status;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }
}
