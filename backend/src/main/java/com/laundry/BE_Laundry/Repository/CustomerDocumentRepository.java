package com.laundry.BE_Laundry.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.laundry.BE_Laundry.Model.CustomerDocument;

@Repository
public interface CustomerDocumentRepository extends JpaRepository <CustomerDocument, Long>{
	List<CustomerDocument> findByCustomerId(Long customerId);

}
