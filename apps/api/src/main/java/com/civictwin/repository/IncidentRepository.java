package com.civictwin.repository;

import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Java Concept: Spring Data JPA Repository Abstraction & Derived Queries.
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {

    List<Incident> findByStatusNot(Status status);

    List<Incident> findByStatus(Status status);

    List<Incident> findByCategory(Category category);

    @Query("SELECT i FROM Incident i WHERE i.status != 'RESOLVED'")
    List<Incident> findActiveIncidents();

    @Query("SELECT i FROM Incident i WHERE i.status = 'RESOLVED' AND i.updatedAt >= :sinceTimestamp")
    List<Incident> findResolvedSince(Long sinceTimestamp);
}
