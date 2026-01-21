package com.laundry.BE_Laundry.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.laundry.BE_Laundry.DTO.UpdatePasswordRequestDTO;
import com.laundry.BE_Laundry.Model.Customer;
import com.laundry.BE_Laundry.Service.CustomerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

	private final CustomerService customerService;

	@PutMapping("/update-password")
	public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordRequestDTO updatePasswordDTO) {
		try {
			customerService.updatePassword(updatePasswordDTO);
			return ResponseEntity.ok(Map.of("message", "Update password successfuly"));
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Update password failed: " + ex.getMessage()));
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An error occured: " + ex.getMessage()));
		}
	}
	
	@GetMapping
	public ResponseEntity<?> getAllCustomers() {
		List<Customer> customer = customerService.getAllCustomers();
		if (customer.isEmpty()) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No Customers found.");
		}
		return ResponseEntity.ok(customer);
	}

	@GetMapping("/{id}")
	public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
		try {
			Customer customer = customerService.getCustomerById(id);
			if (customer != null) {
				return ResponseEntity.ok(customer);
			} else {
				return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No Customers found.");
			}
		} catch (Exception ex) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occured: " + ex.getMessage());
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
		return ResponseEntity.ok(customerService.updateCustomer(id, customer));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
		customerService.deleteCustomer(id);
		return ResponseEntity.noContent().build();
	}

}
