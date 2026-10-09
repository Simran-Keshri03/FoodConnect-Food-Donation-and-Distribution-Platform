package com.foodconnect.repository;

import com.foodconnect.entity.Delivery;
import com.foodconnect.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    List<Delivery> findByVolunteerIdOrderByCreatedAtDesc(Long volunteerId);

    Optional<Delivery> findByDonationId(Long donationId);

    boolean existsByDonationId(Long donationId);

    List<Delivery> findByStatusOrderByCreatedAtDesc(DeliveryStatus status);
}
