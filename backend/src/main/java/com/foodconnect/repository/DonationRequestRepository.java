package com.foodconnect.repository;

import com.foodconnect.entity.DonationRequest;
import com.foodconnect.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DonationRequestRepository extends JpaRepository<DonationRequest, Long> {

    List<DonationRequest> findByNgoIdOrderByRequestedAtDesc(Long ngoId);

    List<DonationRequest> findByDonationDonorIdOrderByRequestedAtDesc(Long donorId);

    List<DonationRequest> findByDonationId(Long donationId);

    List<DonationRequest> findByDonationIdAndStatus(Long donationId, RequestStatus status);

    boolean existsByDonationIdAndNgoIdAndStatus(Long donationId, Long ngoId, RequestStatus status);
}
