package com.foodconnect.service;

import com.foodconnect.dto.response.DeliveryResponse;
import com.foodconnect.entity.*;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DeliveryRepository;
import com.foodconnect.repository.FoodDonationRepository;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceTest {

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private FoodDonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    private DeliveryService deliveryService;

    private User volunteerUser;
    private User donorUser;
    private UserPrincipal volunteerPrincipal;
    private FoodDonation approvedDonation;

    @BeforeEach
    void setUp() {
        deliveryService = new DeliveryService(deliveryRepository, donationRepository, userRepository);

        volunteerUser = new User(3L, "Volunteer Val", "vol@test.com", "pass", "789", Role.ROLE_VOLUNTEER, "City");
        donorUser = new User(1L, "Donor Dan", "donor@test.com", "pass", "123", Role.ROLE_DONOR, "Market");
        volunteerPrincipal = new UserPrincipal(3L, "Volunteer Val", "vol@test.com", "pass", Role.ROLE_VOLUNTEER, Collections.emptyList());

        approvedDonation = new FoodDonation(50L, "Hot Soup", "desc", "Cooked Meals", "15L", 40, "Address", null, LocalDateTime.now().plusHours(5), DonationStatus.APPROVED, donorUser);
    }

    @Test
    @DisplayName("Should allow volunteer to accept an APPROVED donation for delivery")
    void testAcceptDelivery_Success() {
        when(donationRepository.findById(50L)).thenReturn(Optional.of(approvedDonation));
        when(deliveryRepository.existsByDonationId(50L)).thenReturn(false);
        when(userRepository.findById(3L)).thenReturn(Optional.of(volunteerUser));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(i -> {
            Delivery d = i.getArgument(0);
            d.setId(500L);
            return d;
        });

        DeliveryResponse res = deliveryService.acceptDelivery(50L, volunteerPrincipal);

        assertNotNull(res);
        assertEquals(500L, res.getId());
        assertEquals(DeliveryStatus.ASSIGNED, res.getStatus());
        assertEquals(DonationStatus.ASSIGNED, approvedDonation.getStatus());
        verify(donationRepository, times(1)).save(approvedDonation);
    }

    @Test
    @DisplayName("Should reject accepting delivery if donation is not APPROVED")
    void testAcceptDelivery_InvalidDonationStatus() {
        approvedDonation.setStatus(DonationStatus.AVAILABLE);
        when(donationRepository.findById(50L)).thenReturn(Optional.of(approvedDonation));

        assertThrows(BadRequestException.class, () -> deliveryService.acceptDelivery(50L, volunteerPrincipal));
    }

    @Test
    @DisplayName("Should advance delivery status to PICKED_UP then DELIVERED")
    void testUpdateDeliveryStatus_Lifecycle() {
        Delivery delivery = new Delivery(500L, approvedDonation, volunteerUser, DeliveryStatus.ASSIGNED);

        when(deliveryRepository.findById(500L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(i -> i.getArgument(0));

        // Advance to PICKED_UP
        DeliveryResponse pickedUpRes = deliveryService.updateDeliveryStatus(500L, DeliveryStatus.PICKED_UP, volunteerPrincipal);
        assertEquals(DeliveryStatus.PICKED_UP, pickedUpRes.getStatus());
        assertNotNull(delivery.getPickupTime());
        assertEquals(DonationStatus.PICKED_UP, approvedDonation.getStatus());

        // Advance to DELIVERED
        DeliveryResponse deliveredRes = deliveryService.updateDeliveryStatus(500L, DeliveryStatus.DELIVERED, volunteerPrincipal);
        assertEquals(DeliveryStatus.DELIVERED, deliveredRes.getStatus());
        assertNotNull(delivery.getDeliveredAt());
        assertEquals(DonationStatus.DELIVERED, approvedDonation.getStatus());
    }

    @Test
    @DisplayName("Should prevent another volunteer from updating an unassigned delivery")
    void testUpdateDeliveryStatus_UnauthorizedVolunteer() {
        Delivery delivery = new Delivery(500L, approvedDonation, volunteerUser, DeliveryStatus.ASSIGNED);
        when(deliveryRepository.findById(500L)).thenReturn(Optional.of(delivery));

        UserPrincipal otherVolunteerPrincipal = new UserPrincipal(99L, "Other Vol", "other@vol.com", "pass", Role.ROLE_VOLUNTEER, Collections.emptyList());

        assertThrows(UnauthorizedException.class, () -> deliveryService.updateDeliveryStatus(500L, DeliveryStatus.PICKED_UP, otherVolunteerPrincipal));
    }
}
