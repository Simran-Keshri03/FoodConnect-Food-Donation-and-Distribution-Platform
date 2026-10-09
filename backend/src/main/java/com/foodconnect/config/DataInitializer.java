package com.foodconnect.config;

import com.foodconnect.entity.DonationStatus;
import com.foodconnect.entity.FoodDonation;
import com.foodconnect.entity.Role;
import com.foodconnect.entity.User;
import com.foodconnect.repository.FoodDonationRepository;
import com.foodconnect.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final FoodDonationRepository donationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           FoodDonationRepository donationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            logger.info("Database is empty. Seeding initial demo users and food donations...");

            String defaultPassword = passwordEncoder.encode("password123");

            // 1. Seed Donor
            User donor = new User();
            donor.setFullName("Sunrise Artisan Bakery");
            donor.setEmail("donor@foodconnect.org");
            donor.setPassword(defaultPassword);
            donor.setPhone("+1-555-0101");
            donor.setRole(Role.ROLE_DONOR);
            donor.setAddress("124 Market Street, Metro City");
            User savedDonor = userRepository.save(donor);

            // 2. Seed NGO
            User ngo = new User();
            ngo.setFullName("City Harvest Relief NGO");
            ngo.setEmail("ngo@foodconnect.org");
            ngo.setPassword(defaultPassword);
            ngo.setPhone("+1-555-0202");
            ngo.setRole(Role.ROLE_NGO);
            ngo.setAddress("45 Community Center, Metro City");
            userRepository.save(ngo);

            // 3. Seed Volunteer
            User volunteer = new User();
            volunteer.setFullName("Alex Rivera (Volunteer)");
            volunteer.setEmail("volunteer@foodconnect.org");
            volunteer.setPassword(defaultPassword);
            volunteer.setPhone("+1-555-0303");
            volunteer.setRole(Role.ROLE_VOLUNTEER);
            volunteer.setAddress("78 Oak Avenue, Metro City");
            userRepository.save(volunteer);

            // 4. Seed Initial Food Donations
            FoodDonation donation1 = new FoodDonation();
            donation1.setTitle("Fresh Artisan Sourdough Breads & Baguettes");
            donation1.setDescription("Assorted freshly baked whole wheat and sourdough loaves, packed hygienically.");
            donation1.setCategory("Bakery");
            donation1.setQuantity("25 loaves");
            donation1.setServings(50);
            donation1.setPickupAddress("124 Market Street, Metro City");
            donation1.setPreparedAt(LocalDateTime.now().minusHours(2));
            donation1.setExpiresAt(LocalDateTime.now().plusHours(18));
            donation1.setStatus(DonationStatus.AVAILABLE);
            donation1.setDonor(savedDonor);
            donationRepository.save(donation1);

            FoodDonation donation2 = new FoodDonation();
            donation2.setTitle("Hot Cooked Vegetable Pulao & Lentil Curry");
            donation2.setDescription("Large catering trays of aromatic vegetable pulao and dal, kept warm.");
            donation2.setCategory("Cooked Meals");
            donation2.setQuantity("15 kg");
            donation2.setServings(60);
            donation2.setPickupAddress("124 Market Street, Metro City");
            donation2.setPreparedAt(LocalDateTime.now().minusHours(1));
            donation2.setExpiresAt(LocalDateTime.now().plusHours(6));
            donation2.setStatus(DonationStatus.AVAILABLE);
            donation2.setDonor(savedDonor);
            donationRepository.save(donation2);

            FoodDonation donation3 = new FoodDonation();
            donation3.setTitle("Organic Fresh Apples & Citrus Crates");
            donation3.setDescription("Freshly arrived fruit crates from farmers market surplus.");
            donation3.setCategory("Produce");
            donation3.setQuantity("35 kg");
            donation3.setServings(90);
            donation3.setPickupAddress("124 Market Street, Metro City");
            donation3.setPreparedAt(LocalDateTime.now().minusHours(5));
            donation3.setExpiresAt(LocalDateTime.now().plusHours(48));
            donation3.setStatus(DonationStatus.AVAILABLE);
            donation3.setDonor(savedDonor);
            donationRepository.save(donation3);

            logger.info("Demo users and donations successfully seeded!");
        }
    }
}
