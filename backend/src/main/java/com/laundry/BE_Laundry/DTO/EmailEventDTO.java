package com.laundry.BE_Laundry.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailEventDTO {
    private String type;
    private String to;
    private String subject;
    private String content;
    private String otp;
    private String token;
}
