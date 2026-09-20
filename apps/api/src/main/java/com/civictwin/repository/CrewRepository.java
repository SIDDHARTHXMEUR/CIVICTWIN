package com.civictwin.repository;

import com.civictwin.enums.Category;
import com.civictwin.model.Crew;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrewRepository extends JpaRepository<Crew, String> {
    List<Crew> findBySpecialty(Category specialty);
    List<Crew> findByStatus(String status);
}
