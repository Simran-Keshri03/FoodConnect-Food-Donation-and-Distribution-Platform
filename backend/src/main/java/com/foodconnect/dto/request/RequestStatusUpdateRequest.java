package com.foodconnect.dto.request;

import com.foodconnect.entity.RequestStatus;
import jakarta.validation.constraints.NotNull;

public class RequestStatusUpdateRequest {

    @NotNull(message = "Request status is required (APPROVED or REJECTED)")
    private RequestStatus status;

    public RequestStatusUpdateRequest() {
    }

    public RequestStatusUpdateRequest(RequestStatus status) {
        this.status = status;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }
}
