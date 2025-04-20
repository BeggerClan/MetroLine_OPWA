package com.opwa.opwa_be.Model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Document(collection = "staff")
@Data
@AllArgsConstructor
@NoArgsConstructor

public class Staff {

    @Transient
    public static final String SEQUENCE_NAME = "staff_sequence";
    @Id
    private int staff_id;
    
    private String staff_usename;

    private int staff_nationID;

    private String staff_firstname;

    private String staff_lastname;

    private String staff_email;

    private String staff_password;
    
    private String staff_phone;
    private String staff_address;
    private String staff_role;
    private LocalDate staff_birthday; 



    
}
