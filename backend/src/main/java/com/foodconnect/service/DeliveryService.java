package com.foodconnect.service;

import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.*;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.InvalidStatusTransitionException;
import com.foodconnect.exception.ResourceNotFoundException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DeliveryRepository;
import com.foodconnect.repository.FoodDonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           FoodDonationRepository donationRepository,
                           UserRepository userRepository) {
        this.deliveryRepository = deliveryRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DonationResponse> getAvailableDeliveries() {
        List<FoodDonation> donations = donationRepository.findApprovedPendingDelivery();
        return donations.stream()
                .map(DonationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse acceptDelivery(Long donationId, UserPrincipal currentVolunteer) {
        if (currentVolunteer.getRole() != Role.ROLE_VOLUNTEER) {
            throw new UnauthorizedException("Only users with role VOLUNTEER can accept delivery assignments");
        }

        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Food donation not found with id: " + donationId));

        if (donation.getStatus() != DonationStatus.APPROVED) {
            throw new BadRequestException("Only APPROVED donations can be accepted for delivery (Current status: " + donation.getStatus() + ")");
        }

        if (deliveryRepository.existsByDonationId(donationId)) {
            throw new BadRequestException("This delivery has already been assigned to a volunteer");
        }

        User volunteer = userRepository.findById(currentVolunteer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer user not found"));

        donation.setStatus(DonationStatus.ASSIGNED);
        donationRepository.save(donation);

        Delivery delivery = new Delivery();
        delivery.setDonation(donation);
        delivery.setVolunteer(volunteer);
        delivery.setStatus(DeliveryStatus.ASSIGNED);

        Delivery saved = deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<DeliveryResponse> getMyDeliveries(UserPrincipal currentVolunteer) {
        List<Delivery> deliveries = deliveryRepository.findByVolunteerIdOrderByCreatedAtDesc(currentVolunteer.getId());
        return deliveries.stream()
                .map(DeliveryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryResponse updateDeliveryStatus(Long deliveryId, DeliveryStatus newStatus, UserPrincipal currentVolunteer) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery assignment not found with id: " + deliveryId));

        if (!delivery.getVolunteer().getId().equals(currentVolunteer.getId())) {
            throw new UnauthorizedException("You are not authorized to update this delivery task");
        }

        DeliveryStatus currentStatus = delivery.getStatus();
        FoodDonation donation = delivery.getDonation();

        if (currentStatus == DeliveryStatus.ASSIGNED) {
            if (newStatus == DeliveryStatus.PICKED_UP) {
                delivery.setStatus(DeliveryStatus.PICKED_UP);
                delivery.setPickupTime(LocalDateTime.now());
                donation.setStatus(DonationStatus.PICKED_UP);
                donationRepository.save(donation);
            } else if (newStatus == DeliveryStatus.CANCELLED) {
                delivery.setStatus(DeliveryStatus.CANCELLED);
                donation.setStatus(DonationStatus.APPROVED);
                donationRepository.save(donation);
            } else {
                throw new InvalidStatusTransitionException("From ASSIGNED, status can only transition to PICKED_UP or CANCELLED");
            }
        } else if (currentStatus == DeliveryStatus.PICKED_UP) {
            if (newStatus == DeliveryStatus.DELIVERED) {
                delivery.setStatus(DeliveryStatus.DELIVERED);
                delivery.setDeliveredAt(LocalDateTime.now());
                donation.setStatus(DonationStatus.DELIVERED);
                donationRepository.save(donation);
            } else {
                throw new InvalidStatusTransitionException("From PICKED_UP, status can only transition to DELIVERED");
            }
        } else {
            throw new InvalidStatusTransitionException("Cannot update delivery that is already " + currentStatus);
        }

        Delivery updated = deliveryRepository.save(delivery);
        return DeliveryResponse.fromEntity(updated);
    }
}
