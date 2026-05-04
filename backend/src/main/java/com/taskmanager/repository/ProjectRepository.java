package com.taskmanager.repository;

import com.taskmanager.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members pm WHERE p.owner.id = :userId OR pm.user.id = :userId")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    List<Project> findByOwnerId(Long ownerId);
}
