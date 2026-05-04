package com.taskmanager.dto;

import com.taskmanager.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;
        private String description;

        @NotNull(message = "Project ID is required")
        private Long projectId;

        private Long assigneeId;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
    }

    @Data
    public static class UpdateRequest {
        private String title;
        private String description;
        private Long assigneeId;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private Long projectId;
        private String projectName;
        private Long assigneeId;
        private String assigneeName;
        private Task.Status status;
        private Task.Priority priority;
        private LocalDate dueDate;
        private LocalDateTime createdAt;
        private boolean overdue;

        public static Response from(Task task) {
            Response r = new Response();
            r.id = task.getId();
            r.title = task.getTitle();
            r.description = task.getDescription();
            r.projectId = task.getProject().getId();
            r.projectName = task.getProject().getName();
            r.status = task.getStatus();
            r.priority = task.getPriority();
            r.dueDate = task.getDueDate();
            r.createdAt = task.getCreatedAt();
            if (task.getAssignee() != null) {
                r.assigneeId = task.getAssignee().getId();
                r.assigneeName = task.getAssignee().getName();
            }
            r.overdue = task.getDueDate() != null
                    && task.getDueDate().isBefore(LocalDate.now())
                    && task.getStatus() != Task.Status.DONE;
            return r;
        }
    }
}
