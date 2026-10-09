package com.foodconnect.dto.response;

import com.foodconnect.entity.DonationStatus;
import com.foodconnect.entity.FoodDonation;

import java.time.LocalDateTime;

public class DonationResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String quantity;
    private Integer servings;
    private String pickupAddress;
    private LocalDateTime preparedAt;
    private LocalDateTime expiresAt;
    private DonationStatus status;
    private UserSummaryDto donor;
    private boolean expired;
    private LocalDateTime createdAt;

    public DonationResponse() {
    }

    public static DonationResponse fromEntity(FoodDonation donation) {
        if (donation == null) return null;
        DonationResponse res = new DonationResponse();
        res.setId(donation.getId());
        res.setTitle(donation.getTitle());
        res.setDescription(donation.getDescription());
        res.setCategory(donation.getCategory());
        res.setQuantity(donation.getQuantity());
        res.setServings(donation.getServings());
        res.setPickupAddress(donation.getPickupAddress());
        res.setPreparedAt(donation.getPreparedAt());
        res.setExpiresAt(donation.getExpiresAt());
        res.setStatus(donation.getStatus());
        res.setExpired(donation.isExpired());
        res.setCreatedAt(donation.getCreatedAt());
        if (donation.getDonor() != null) {
            res.setDonor(UserSummaryDto.fromEntity(donation.getDonor()));
        }
        return res;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public Integer getServings() {
        return servings;
    }

    public void setServings(Integer servings) {
        this.servings = servings;
    }

    public String getPickupAddress() {
        return pickupAddress;
    }

    public void setPickupAddress(String pickupAddress) {
        this.pickupAddress = pickupAddress;
    }

    public LocalDateTime getPreparedAt() {
        return preparedAt;
    }

    public void setPreparedAt(LocalDateTime preparedAt) {
        this.preparedAt = preparedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }

    public UserSummaryDto getDonor() {
        return donor;
    }

    public void setDonor(UserSummaryDto donor) {
        this.donor = donor;
    }

    public boolean isExpired() {
        return expired;
    }

    public void setExpired(boolean expired) {
        this.expired = expired;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
