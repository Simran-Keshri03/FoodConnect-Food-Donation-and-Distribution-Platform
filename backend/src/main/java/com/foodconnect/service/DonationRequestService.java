package com.foodconnect.service;

import com.foodconnect.dto.request.CreateDonationRequestDto;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.*;
import com.foodconnect.exception.*;
import com.foodconnect.repository.DonationRequestRepository;
import com.foodconnect.repository.FoodDonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationRequestService {

    private final DonationRequestRepository requestRepository;
    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;

    public DonationRequestService(DonationRequestRepository requestRepository,
                                  FoodDonationRepository donationRepository,
                                  UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public DonationRequestResponse createRequest(CreateDonationRequestDto requestDto, UserPrincipal currentNgo) {
        if (currentNgo.getRole() != Role.ROLE_NGO) {
            throw new UnauthorizedException("Only users with role NGO can request food donations");
        }

        FoodDonation donation = donationRepository.findById(requestDto.getDonationId())
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with id: " + requestDto.getDonationId()));

        if (donation.isExpired()) {
            throw new BadRequestException("Cannot request an expired donation");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException("Donation is not available for requests (current status: " + donation.getStatus() + ")");
        }

        if (requestRepository.existsByDonationIdAndNgoIdAndStatus(donation.getId(), currentNgo.getId(), RequestStatus.PENDING)) {
            throw new DuplicateRequestException("You already have an active pending request for this donation");
        }

        User ngo = userRepository.findById(currentNgo.getId())
                .orElseThrow(() -> new ResourceNotFoundException("NGO user not found"));

        DonationRequest request = new DonationRequest();
        request.setDonation(donation);
        request.setNgo(ngo);
        request.setMessage(requestDto.getMessage() != null ? requestDto.getMessage().trim() : null);
        request.setStatus(RequestStatus.PENDING);

        if (donation.getStatus() == DonationStatus.AVAILABLE) {
            donation.setStatus(DonationStatus.REQUESTED);
            donationRepository.save(donation);
        }

        DonationRequest saved = requestRepository.save(request);
        return DonationRequestResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DonationRequestResponse> getMyRequests(UserPrincipal currentNgo) {
        List<DonationRequest> requests = requestRepository.findByNgoIdOrderByRequestedAtDesc(currentNgo.getId());
        return requests.stream()
                .map(DonationRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationRequestResponse> getReceivedRequests(UserPrincipal currentDonor) {
        List<DonationRequest> requests = requestRepository.findByDonationDonorIdOrderByRequestedAtDesc(currentDonor.getId());
        return requests.stream()
                .map(DonationRequestResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DonationRequestResponse updateRequestStatus(Long requestId, RequestStatus newStatus, UserPrincipal currentDonor) {
        DonationRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation request not found with id: " + requestId));

        FoodDonation donation = request.getDonation();

        if (!donation.getDonor().getId().equals(currentDonor.getId())) {
            throw new UnauthorizedException("You are not authorized to update this donation request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new InvalidStatusTransitionException("Only PENDING requests can be updated (current status: " + request.getStatus() + ")");
        }

        if (newStatus == RequestStatus.APPROVED) {
            if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.REQUESTED) {
                throw new InvalidStatusTransitionException("Donation is already processed or approved (current status: " + donation.getStatus() + ")");
            }

            request.setStatus(RequestStatus.APPROVED);
            donation.setStatus(DonationStatus.APPROVED);
            donationRepository.save(donation);

            // Automatically reject all other pending requests for this same donation
            List<DonationRequest> otherRequests = requestRepository.findByDonationIdAndStatus(donation.getId(), RequestStatus.PENDING);
            for (DonationRequest other : otherRequests) {
                if (!other.getId().equals(request.getId())) {
                    other.setStatus(RequestStatus.REJECTED);
                    requestRepository.save(other);
                }
            }

        } else if (newStatus == RequestStatus.REJECTED) {
            request.setStatus(RequestStatus.REJECTED);

            // If no other pending requests remain, revert donation to AVAILABLE
            List<DonationRequest> otherPending = requestRepository.findByDonationIdAndStatus(donation.getId(), RequestStatus.PENDING);
            boolean hasOtherPending = otherPending.stream().anyMatch(r -> !r.getId().equals(request.getId()));
            if (!hasOtherPending && donation.getStatus() == DonationStatus.REQUESTED) {
                donation.setStatus(DonationStatus.AVAILABLE);
                donationRepository.save(donation);
            }
        } else {
            throw new InvalidStatusTransitionException("Donors can only set request status to APPROVED or REJECTED");
        }

        DonationRequest updated = requestRepository.save(request);
        return DonationRequestResponse.fromEntity(updated);
    }
}
