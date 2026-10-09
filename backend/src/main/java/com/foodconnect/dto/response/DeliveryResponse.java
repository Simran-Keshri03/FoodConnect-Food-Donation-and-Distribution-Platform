package com.foodconnect.dto.response;

import com.foodconnect.entity.Delivery;
import com.foodconnect.entity.DeliveryStatus;

import java.time.LocalDateTime;

public class DeliveryResponse {
    private Long id;
    private DonationResponse donation;
    private UserSummaryDto volunteer;
    private DeliveryStatus status;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;

    public DeliveryResponse() {
    }

    public static DeliveryResponse fromEntity(Delivery delivery) {
        if (delivery == null) return null;
        DeliveryResponse res = new DeliveryResponse();
        res.setId(delivery.getId());
        res.setStatus(delivery.getStatus());
        res.setPickupTime(delivery.getPickupTime());
        res.setDeliveredAt(delivery.getDeliveredAt());
        res.setCreatedAt(delivery.getCreatedAt());
        if (delivery.getDonation() != null) {
            res.setDonation(DonationResponse.fromEntity(delivery.getDonation()));
        }
        if (delivery.getVolunteer() != null) {
            res.setVolunteer(UserSummaryDto.fromEntity(delivery.getVolunteer()));
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

    public UserSummaryDto getVolunteer() {
        return volunteer;
    }

    public void setVolunteer(UserSummaryDto volunteer) {
        this.volunteer = volunteer;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public LocalDateTime getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(LocalDateTime pickupTime) {
        this.pickupTime = pickupTime;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
