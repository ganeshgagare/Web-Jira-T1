package com.taskmanager.dto;

import com.taskmanager.entity.Project;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ProjectDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Project name is required")
        private String name;
        private String description;
        private LocalDate deadline;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private LocalDate deadline;
        private LocalDateTime createdAt;
        private String ownerName;
        private Long ownerId;
        private List<MemberInfo> members;
        private int totalTasks;
        private int completedTasks;

        @Data
        public static class MemberInfo {
            private Long userId;
            private String name;
            private String email;
        }

        public static Response from(Project project) {
            Response r = new Response();
            r.id = project.getId();
            r.name = project.getName();
            r.description = project.getDescription();
            r.deadline = project.getDeadline();
            r.createdAt = project.getCreatedAt();
            r.ownerName = project.getOwner().getName();
            r.ownerId = project.getOwner().getId();
            r.totalTasks = project.getTasks().size();
            r.completedTasks = (int) project.getTasks().stream()
                    .filter(t -> t.getStatus() == com.taskmanager.entity.Task.Status.DONE).count();
            r.members = project.getMembers().stream().map(pm -> {
                MemberInfo mi = new MemberInfo();
                mi.userId = pm.getUser().getId();
                mi.name = pm.getUser().getName();
                mi.email = pm.getUser().getEmail();
                return mi;
            }).toList();
            return r;
        }
    }
}
