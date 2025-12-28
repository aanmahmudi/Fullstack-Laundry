package com.laundry.BE_Laundry.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.laundry.BE_Laundry.Model.CustomerPhoto;

@Repository
public interface CustomerPhotoRepository extends JpaRepository<CustomerPhoto, Long>{
	List<CustomerPhoto> findByCustomerId(Long customerId);

}
