package com.civictwin.model;

import com.civictwin.enums.Role;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Java Concept: Security User Entity & Role Enum Mapping.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String username;

    private String password;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Boolean active = true;
}
