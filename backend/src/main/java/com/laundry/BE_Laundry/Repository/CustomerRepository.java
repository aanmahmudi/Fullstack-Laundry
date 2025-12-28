package com.laundry.BE_Laundry.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.laundry.BE_Laundry.Model.Customer;

public interface CustomerRepository extends JpaRepository <Customer, Long>{
	
	Optional<Customer> findById(Long id);
	Optional<Customer> findByEmail(String email);
	Optional<Customer> findByVerificationToken(String token);
	
	//Query untuk mengambil email, otp,& data belum terverifikasi.
	@Query("SELECT c FROM Customer c WHERE c.email = :email AND c.verificationOtp = :otp AND c.verified = false")
	Optional<Customer> findUnverifiedByEmailAndOtp(@Param("email") String email, @Param ("otp")String otp);
	
	
	Optional<Customer> findByUsername(String username);
	Optional<Customer> findByPlaceOfBirth(String placeOfBirth);
}
