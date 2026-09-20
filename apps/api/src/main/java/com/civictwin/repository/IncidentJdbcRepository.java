package com.civictwin.repository;

import com.civictwin.enums.Category;
import com.civictwin.enums.Status;
import com.civictwin.model.Incident;
import com.civictwin.model.InfrastructureIncident;
import com.civictwin.model.Location;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Java Concept: Direct JDBC API Usage, PreparedStatement, ResultSet, & Try-With-Resources.
 * Hand-written plain-JDBC repository created specifically for college lab evaluation.
 * Demonstrates low-level SQL database interaction without ORM abstractions.
 */
@Repository
public class IncidentJdbcRepository {

    private final DataSource dataSource;

    public IncidentJdbcRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    /**
     * Java Concept: Try-With-Resources (Automatic Resource Management) & PreparedStatement.
     */
    public Optional<Incident> findByIdPlainJdbc(String id) {
        String sql = "SELECT id, title, category, description, status, severity, lat, lng, address, report_count, created_at, updated_at " +
                     "FROM incidents WHERE id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, id);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToIncident(rs));
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("JDBC Execution Error during findById: " + e.getMessage(), e);
        }
        return Optional.empty();
    }

    /**
     * Java Concept: JDBC Query Execution & ResultSet Iteration.
     */
    public List<Incident> findAllPlainJdbc() {
        List<Incident> list = new ArrayList<>();
        String sql = "SELECT id, title, category, description, status, severity, lat, lng, address, report_count, created_at, updated_at " +
                     "FROM incidents";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                list.add(mapResultSetToIncident(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("JDBC Execution Error during findAll: " + e.getMessage(), e);
        }
        return list;
    }

    private Incident mapResultSetToIncident(ResultSet rs) throws SQLException {
        String id = rs.getString("id");
        String title = rs.getString("title");
        String categoryCode = rs.getString("category");
        String description = rs.getString("description");
        String statusStr = rs.getString("status");
        int severity = rs.getInt("severity");
        double lat = rs.getDouble("lat");
        double lng = rs.getDouble("lng");
        String address = rs.getString("address");
        int reportCount = rs.getInt("report_count");
        long createdAt = rs.getLong("created_at");
        long updatedAt = rs.getLong("updated_at");

        Location loc = new Location(lat, lng, address);
        Incident incident = new InfrastructureIncident(id, title, description, loc, severity);
        incident.setCategory(Category.fromCode(categoryCode));
        if (statusStr != null) {
            try {
                incident.setStatus(Status.valueOf(statusStr));
            } catch (Exception ignored) {}
        }
        incident.setReportCount(reportCount);
        incident.setCreatedAt(createdAt);
        incident.setUpdatedAt(updatedAt);
        return incident;
    }
}
