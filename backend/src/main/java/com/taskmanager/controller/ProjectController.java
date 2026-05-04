package com.taskmanager.controller;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.entity.User;
import com.taskmanager.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectDto.Response>> getProjects(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.getProjectsForUser(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto.Response> getProject(@PathVariable Long id,
                                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.getProject(id, user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDto.Response> createProject(@Valid @RequestBody ProjectDto.CreateRequest request,
                                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.createProject(request, user));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDto.Response> updateProject(@PathVariable Long id,
                                                              @RequestBody ProjectDto.CreateRequest request,
                                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.updateProject(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id,
                                               @AuthenticationPrincipal User user) {
        projectService.deleteProject(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectDto.Response> addMember(@PathVariable Long id,
                                                          @RequestBody Map<String, Long> body,
                                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.addMember(id, body.get("userId"), user));
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeMember(@PathVariable Long id,
                                              @PathVariable Long userId,
                                              @AuthenticationPrincipal User user) {
        projectService.removeMember(id, userId, user);
        return ResponseEntity.noContent().build();
    }
}
