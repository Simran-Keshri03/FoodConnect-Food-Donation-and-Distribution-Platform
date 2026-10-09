package com.foodconnect.repository;

import com.foodconnect.entity.DonationStatus;
import com.foodconnect.entity.FoodDonation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

    List<FoodDonation> findByDonorIdOrderByCreatedAtDesc(Long donorId);

    List<FoodDonation> findByStatusOrderByCreatedAtDesc(DonationStatus status);

    @Query("SELECT d FROM FoodDonation d WHERE (:category IS NULL OR d.category = :category) " +
           "AND (:status IS NULL OR d.status = :status) " +
           "ORDER BY d.createdAt DESC")
    List<FoodDonation> findFiltered(@Param("category") String category, 
                                    @Param("status") DonationStatus status);

    @Query("SELECT d FROM FoodDonation d WHERE d.status = 'AVAILABLE' AND d.expiresAt > :now " +
           "AND (:category IS NULL OR LOWER(d.category) = LOWER(:category)) " +
           "ORDER BY d.createdAt DESC")
    List<FoodDonation> findAvailableActive(@Param("now") LocalDateTime now, 
                                           @Param("category") String category);

    @Query("SELECT d FROM FoodDonation d WHERE d.status = 'APPROVED' " +
           "AND NOT EXISTS (SELECT del FROM Delivery del WHERE del.donation.id = d.id) " +
           "ORDER BY d.createdAt DESC")
    List<FoodDonation> findApprovedPendingDelivery();
}
