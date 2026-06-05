package com.aeris.auth_service.repository;

import com.aeris.auth_service.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String Email);
    boolean existsByEmail(String email);
}
