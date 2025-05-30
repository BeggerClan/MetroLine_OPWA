package com.opwa.opwa_be.auth;

import com.opwa.opwa_be.config.JwtService;
import com.opwa.opwa_be.model.Role;
import com.opwa.opwa_be.model.User;
import com.opwa.opwa_be.Repository.UserRepo;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        // Check for unique email
        if (userRepo.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists. Please use a different email.");
        }
        // Check for unique nationalId
        if (userRepo.existsByNationalId(request.getNationalId())) {
            throw new IllegalArgumentException("National ID already exists. Please use a different ID.");
        }

        var user = User.builder()
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nationalId(request.getNationalId())
                .dateOfBirth(request.getDateOfBirth())
                .addressNumber(request.getAddressNumber())
                .street(request.getStreet())
                .ward(request.getWard())
                .district(request.getDistrict())
                .city(request.getCity())
                .phone(request.getPhone())
                .employed(request.getEmployed())
                .role(request.getRole() != null ? request.getRole() : Role.USER)
                .shift(request.getShift())
                .build();
        userRepo.save(user);

        var jwtToken = jwtService.generateTokenWithRoles(user, Collections.singletonList(user.getRole().name()));
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepo.findByEmail(request.getEmail()).orElseThrow();

        var jwtToken = jwtService.generateTokenWithRoles(user, Collections.singletonList(user.getRole().name()));
        return AuthenticationResponse.builder().token(jwtToken).build();
    }
}
