package main.java.com.laundry.BE_Laundry.DTO;

import com.laundry.BE_Laundry.Model.Customer;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerSummaryDTO {
	private Long id;
	private String username;
	private String email;
	private String phoneNumber;
	private Customer.RoleType role;
}
