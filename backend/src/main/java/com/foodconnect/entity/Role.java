package com.foodconnect.entity;

public enum Role {
    ROLE_DONOR,
    ROLE_NGO,
    ROLE_VOLUNTEER;

    public String getAuthorityName() {
        return this.name();
    }
}
