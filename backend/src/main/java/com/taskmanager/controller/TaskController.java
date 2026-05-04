package com.taskmanager.controller;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.entity.User;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskDto.Response>> getTasks(@AuthenticationPrincipal User user,
                                                            @RequestParam(required = false) Long projectId) {
        if (projectId != null) {
            return ResponseEntity.ok(taskService.getTasksByProject(projectId, user));
        }
        return ResponseEntity.ok(taskService.getTasksForUser(user));
    }

    @PostMapping
    public ResponseEntity<TaskDto.Response> createTask(@Valid @RequestBody TaskDto.CreateRequest request,
                                                        @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.createTask(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDto.Response> updateTask(@PathVariable Long id,
                                                        @RequestBody TaskDto.UpdateRequest request,
                                                        @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.updateTask(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User user) {
        taskService.deleteTask(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<TaskService.DashboardStats> getDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getDashboardStats(user));
    }
}
