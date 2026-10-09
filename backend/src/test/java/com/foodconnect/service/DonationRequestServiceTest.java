package com.foodconnect.service;

import com.foodconnect.dto.request.CreateDonationRequestDto;
import com.foodconnect.dto.response.DonationRequestResponse;
import com.foodconnect.entity.*;
import com.foodconnect.exception.BadRequestException;
import com.foodconnect.exception.DuplicateRequestException;
import com.foodconnect.exception.UnauthorizedException;
import com.foodconnect.repository.DonationRequestRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DonationRequestServiceTest {

    @Mock
    private DonationRequestRepository requestRepository;

    @Mock
    private FoodDonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    private DonationRequestService requestService;

    private User donorUser;
    private User ngoUser;
    private UserPrincipal ngoPrincipal;
    private UserPrincipal donorPrincipal;
    private FoodDonation donation;

    @BeforeEach
    void setUp() {
        requestService = new DonationRequestService(requestRepository, donationRepository, userRepository);

        donorUser = new User(1L, "Donor", "donor@test.com", "pass", "123", Role.ROLE_DONOR, "Addr");
        ngoUser = new User(2L, "Hope NGO", "ngo@test.com", "pass", "456", Role.ROLE_NGO, "Shelter");

        donorPrincipal = new UserPrincipal(1L, "Donor", "donor@test.com", "pass", Role.ROLE_DONOR, Collections.emptyList());
        ngoPrincipal = new UserPrincipal(2L, "Hope NGO", "ngo@test.com", "pass", Role.ROLE_NGO, Collections.emptyList());

        donation = new FoodDonation(10L, "Fresh Rice", "desc", "Cooked Meals", "10 kg", 30, "Addr", null, LocalDateTime.now().plusHours(4), DonationStatus.AVAILABLE, donorUser);
    }

    @Test
    @DisplayName("Should create donation request when user is NGO and donation is available")
    void testCreateRequest_Success() {
        CreateDonationRequestDto dto = new CreateDonationRequestDto(10L, "We can distribute this to 30 people");

        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(requestRepository.existsByDonationIdAndNgoIdAndStatus(10L, 2L, RequestStatus.PENDING)).thenReturn(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(ngoUser));
        when(requestRepository.save(any(DonationRequest.class))).thenAnswer(i -> {
            DonationRequest r = i.getArgument(0);
            r.setId(100L);
            return r;
        });

        DonationRequestResponse res = requestService.createRequest(dto, ngoPrincipal);

        assertNotNull(res);
        assertEquals(RequestStatus.PENDING, res.getStatus());
        assertEquals(DonationStatus.REQUESTED, donation.getStatus());
        verify(donationRepository, times(1)).save(donation);
    }

    @Test
    @DisplayName("Should prevent non-NGO user from creating donation request")
    void testCreateRequest_UnauthorizedRole() {
        CreateDonationRequestDto dto = new CreateDonationRequestDto(10L, "Message");

        assertThrows(UnauthorizedException.class, () -> requestService.createRequest(dto, donorPrincipal));
    }

    @Test
    @DisplayName("Should throw DuplicateRequestException if NGO already requested this donation")
    void testCreateRequest_DuplicatePending() {
        CreateDonationRequestDto dto = new CreateDonationRequestDto(10L, "Another request");

        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));
        when(requestRepository.existsByDonationIdAndNgoIdAndStatus(10L, 2L, RequestStatus.PENDING)).thenReturn(true);

        assertThrows(DuplicateRequestException.class, () -> requestService.createRequest(dto, ngoPrincipal));
    }

    @Test
    @DisplayName("Should approve request and automatically reject other pending requests")
    void testUpdateRequestStatus_Approve() {
        DonationRequest targetRequest = new DonationRequest(100L, donation, ngoUser, "First request", RequestStatus.PENDING);
        DonationRequest otherRequest = new DonationRequest(101L, donation, ngoUser, "Second request", RequestStatus.PENDING);

        when(requestRepository.findById(100L)).thenReturn(Optional.of(targetRequest));
        when(requestRepository.findByDonationIdAndStatus(10L, RequestStatus.PENDING)).thenReturn(List.of(targetRequest, otherRequest));
        when(requestRepository.save(any(DonationRequest.class))).thenAnswer(i -> i.getArgument(0));

        DonationRequestResponse res = requestService.updateRequestStatus(100L, RequestStatus.APPROVED, donorPrincipal);

        assertEquals(RequestStatus.APPROVED, res.getStatus());
        assertEquals(DonationStatus.APPROVED, donation.getStatus());
        assertEquals(RequestStatus.REJECTED, otherRequest.getStatus());
        verify(donationRepository, times(1)).save(donation);
    }
}
