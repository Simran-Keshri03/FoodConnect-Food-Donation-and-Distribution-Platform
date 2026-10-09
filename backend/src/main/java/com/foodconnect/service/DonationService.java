package com.foodconnect.service;

import com.foodconnect.dto.request.CreateDonationRequest;
import com.foodconnect.dto.request.UpdateDonationRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.DonationStatus;
import com.foodconnect.entity.FoodDonation;
import com.foodconnect.entity.Role;
import com.foodconnect.entity.User;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.InvalidStatusTransitionException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.FoodDonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;

    public DonationService(FoodDonationRepository donationRepository, UserRepository userRepository) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public DonationResponse createDonation(CreateDonationRequest request, UserPrincipal currentUser) {
        if (currentUser.getRole() != Role.ROLE_DONOR) {
            throw new UnauthorizedException("Only users with role DONOR can create food donations");
        }

        if (request.getPreparedAt() != null && request.getExpiresAt().isBefore(request.getPreparedAt())) {
            throw new BadRequestException("Expiration date cannot be before preparation date");
        }

        if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiration date must be in the future");
        }

        User donor = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor user not found"));

        FoodDonation donation = new FoodDonation();
        donation.setTitle(request.getTitle().trim());
        donation.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        donation.setCategory(request.getCategory().trim());
        donation.setQuantity(request.getQuantity().trim());
        donation.setServings(request.getServings());
        donation.setPickupAddress(request.getPickupAddress().trim());
        donation.setPreparedAt(request.getPreparedAt());
        donation.setExpiresAt(request.getExpiresAt());
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setDonor(donor);

        FoodDonation saved = donationRepository.save(donation);
        return DonationResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getAvailableDonations(String category) {
        List<FoodDonation> donations = donationRepository.findAvailableActive(
                LocalDateTime.now(),
                (category != null && !category.isBlank()) ? category.trim() : null
        );
        return donations.stream()
                .map(DonationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getAllDonations(String category, DonationStatus status) {
        List<FoodDonation> donations = donationRepository.findFiltered(
                (category != null && !category.isBlank()) ? category.trim() : null,
                status
        );
        return donations.stream()
                .map(DonationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DonationResponse getDonationById(Long id) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with id: " + id));
        return DonationResponse.fromEntity(donation);
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getMyDonations(UserPrincipal currentUser) {
        List<FoodDonation> donations = donationRepository.findByDonorIdOrderByCreatedAtDesc(currentUser.getId());
        return donations.stream()
                .map(DonationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DonationResponse updateDonation(Long id, UpdateDonationRequest request, UserPrincipal currentUser) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with id: " + id));

        if (!donation.getDonor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to update this donation");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE && donation.getStatus() != DonationStatus.REQUESTED) {
            throw new BadRequestException("Cannot update donation in status: " + donation.getStatus() + ". Only AVAILABLE or REQUESTED donations can be updated.");
        }

        if (request.getPreparedAt() != null && request.getExpiresAt().isBefore(request.getPreparedAt())) {
            throw new BadRequestException("Expiration date cannot be before preparation date");
        }

        if (request.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Expiration date must be in the future");
        }

        donation.setTitle(request.getTitle().trim());
        donation.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        donation.setCategory(request.getCategory().trim());
        donation.setQuantity(request.getQuantity().trim());
        donation.setServings(request.getServings());
        donation.setPickupAddress(request.getPickupAddress().trim());
        donation.setPreparedAt(request.getPreparedAt());
        donation.setExpiresAt(request.getExpiresAt());

        FoodDonation updated = donationRepository.save(donation);
        return DonationResponse.fromEntity(updated);
    }

    @Transactional
    public DonationResponse updateDonationStatus(Long id, DonationStatus newStatus, UserPrincipal currentUser) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with id: " + id));

        if (!donation.getDonor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to change the status of this donation");
        }

        DonationStatus currentStatus = donation.getStatus();

        // Valid donor-initiated transitions: CANCELLED
        if (newStatus == DonationStatus.CANCELLED) {
            if (currentStatus == DonationStatus.PICKED_UP || currentStatus == DonationStatus.DELIVERED) {
                throw new InvalidStatusTransitionException("Cannot cancel a donation that has already been picked up or delivered");
            }
        } else if (newStatus == DonationStatus.AVAILABLE) {
            if (currentStatus != DonationStatus.REQUESTED && currentStatus != DonationStatus.REJECTED) {
                throw new InvalidStatusTransitionException("Cannot revert donation to AVAILABLE from " + currentStatus);
            }
        } else {
            throw new InvalidStatusTransitionException("Donors cannot directly set status to " + newStatus);
        }

        donation.setStatus(newStatus);
        FoodDonation updated = donationRepository.save(donation);
        return DonationResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteDonation(Long id, UserPrincipal currentUser) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with id: " + id));

        if (!donation.getDonor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this donation");
        }

        if (donation.getStatus() == DonationStatus.PICKED_UP || donation.getStatus() == DonationStatus.DELIVERED) {
            throw new BadRequestException("Cannot delete donation that has already been picked up or delivered");
        }

        donationRepository.delete(donation);
    }
}
