package com.foodconnect.service;

import com.foodconnect.dto.request.CreateDonationRequest;
import com.foodconnect.dto.request.UpdateDonationRequest;
import com.foodconnect.dto.response.DonationResponse;
import com.foodconnect.entity.DonationStatus;
import com.foodconnect.entity.FoodDonation;
import com.foodconnect.entity.Role;
import com.foodconnect.entity.User;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.UnauthorizedException;
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
class DonationServiceTest {

    @Mock
    private FoodDonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    private DonationService donationService;

    private User donorUser;
    private UserPrincipal donorPrincipal;
    private UserPrincipal nonDonorPrincipal;

    @BeforeEach
    void setUp() {
        donationService = new DonationService(donationRepository, userRepository);

        donorUser = new User(1L, "Bakery Owner", "donor@test.com", "pass", "123", Role.ROLE_DONOR, "Market Street");
        donorPrincipal = new UserPrincipal(1L, "Bakery Owner", "donor@test.com", "pass", Role.ROLE_DONOR, Collections.emptyList());
        nonDonorPrincipal = new UserPrincipal(2L, "NGO Rep", "ngo@test.com", "pass", Role.ROLE_NGO, Collections.emptyList());
    }

    @Test
    @DisplayName("Should create donation when user is DONOR and times are valid")
    void testCreateDonation_Success() {
        CreateDonationRequest req = new CreateDonationRequest();
        req.setTitle("Fresh Rolls");
        req.setDescription("Hot bakery rolls");
        req.setCategory("Bakery");
        req.setQuantity("20 rolls");
        req.setServings(20);
        req.setPickupAddress("Market Street");
        req.setPreparedAt(LocalDateTime.now().minusHours(1));
        req.setExpiresAt(LocalDateTime.now().plusHours(12));

        when(userRepository.findById(1L)).thenReturn(Optional.of(donorUser));
        when(donationRepository.save(any(FoodDonation.class))).thenAnswer(invocation -> {
            FoodDonation d = invocation.getArgument(0);
            d.setId(10L);
            return d;
        });

        DonationResponse res = donationService.createDonation(req, donorPrincipal);

        assertNotNull(res);
        assertEquals("Fresh Rolls", res.getTitle());
        assertEquals(DonationStatus.AVAILABLE, res.getStatus());
        assertEquals(10L, res.getId());
    }

    @Test
    @DisplayName("Should reject donation creation if user is not a DONOR")
    void testCreateDonation_UnauthorizedRole() {
        CreateDonationRequest req = new CreateDonationRequest();
        req.setTitle("Fresh Rolls");
        req.setCategory("Bakery");
        req.setQuantity("20 rolls");
        req.setPickupAddress("Market Street");
        req.setExpiresAt(LocalDateTime.now().plusHours(12));

        assertThrows(UnauthorizedException.class, () -> donationService.createDonation(req, nonDonorPrincipal));
        verify(donationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject donation if expiration date is in the past")
    void testCreateDonation_PastExpiration() {
        CreateDonationRequest req = new CreateDonationRequest();
        req.setTitle("Fresh Rolls");
        req.setCategory("Bakery");
        req.setQuantity("20 rolls");
        req.setPickupAddress("Market Street");
        req.setExpiresAt(LocalDateTime.now().minusHours(2));

        assertThrows(BadRequestException.class, () -> donationService.createDonation(req, donorPrincipal));
    }

    @Test
    @DisplayName("Should reject donation update by non-owner")
    void testUpdateDonation_UnauthorizedNonOwner() {
        FoodDonation existing = new FoodDonation(10L, "Rolls", "desc", "Bakery", "10", 10, "Addr", null, LocalDateTime.now().plusHours(5), DonationStatus.AVAILABLE, donorUser);

        when(donationRepository.findById(10L)).thenReturn(Optional.of(existing));

        UpdateDonationRequest updateReq = new UpdateDonationRequest();
        updateReq.setTitle("Updated Title");
        updateReq.setCategory("Bakery");
        updateReq.setQuantity("15");
        updateReq.setPickupAddress("Addr");
        updateReq.setExpiresAt(LocalDateTime.now().plusHours(6));

        UserPrincipal otherDonorPrincipal = new UserPrincipal(99L, "Other Donor", "other@donor.com", "pass", Role.ROLE_DONOR, Collections.emptyList());

        assertThrows(UnauthorizedException.class, () -> donationService.updateDonation(10L, updateReq, otherDonorPrincipal));
    }
}
