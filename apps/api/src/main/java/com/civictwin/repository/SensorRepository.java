package com.civictwin.repository;

import com.civictwin.enums.Category;
import com.civictwin.model.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, String> {
    List<Sensor> findByCategory(Category category);
}
