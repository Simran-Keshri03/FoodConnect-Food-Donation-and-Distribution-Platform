package com.foodconnect.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateDonationRequestDto {

    @NotNull(message = "Donation ID is required")
    private Long donationId;

    @Size(max = 500, message = "Message cannot exceed 500 characters")
    private String message;

    public CreateDonationRequestDto() {
    }

    public CreateDonationRequestDto(Long donationId, String message) {
        this.donationId = donationId;
        this.message = message;
    }

    public Long getDonationId() {
        return donationId;
    }

    public void setDonationId(Long donationId) {
        this.donationId = donationId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
