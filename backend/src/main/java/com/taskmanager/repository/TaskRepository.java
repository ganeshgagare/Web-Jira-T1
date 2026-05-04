package com.taskmanager.repository;

import com.taskmanager.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssigneeId(Long assigneeId);

    @Query("SELECT t FROM Task t WHERE t.dueDate < :today AND t.status <> 'DONE' AND t.status <> 'OVERDUE'")
    List<Task> findOverdueTasks(@Param("today") LocalDate today);

    @Query("SELECT t FROM Task t JOIN t.project p LEFT JOIN p.members pm WHERE p.owner.id = :userId OR pm.user.id = :userId")
    List<Task> findTasksForUser(@Param("userId") Long userId);

    long countByAssigneeId(Long assigneeId);
    long countByAssigneeIdAndStatus(Long assigneeId, Task.Status status);
    long countByProjectId(Long projectId);
    long countByProjectIdAndStatus(Long projectId, Task.Status status);
}
