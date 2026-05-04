package com.taskmanager.service;

import com.taskmanager.dto.TaskDto;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;

    public List<TaskDto.Response> getTasksForUser(User user) {
        List<Task> tasks = user.getRole() == User.Role.ADMIN
                ? taskRepository.findAll()
                : taskRepository.findTasksForUser(user.getId());
        return tasks.stream().map(TaskDto.Response::from).toList();
    }

    public List<TaskDto.Response> getTasksByProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (user.getRole() != User.Role.ADMIN && !isMember(project, user)) {
            throw new AccessDeniedException("No access to this project");
        }
        return taskRepository.findByProjectId(projectId).stream().map(TaskDto.Response::from).toList();
    }

    @Transactional
    public TaskDto.Response createTask(TaskDto.CreateRequest request, User creator) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (creator.getRole() != User.Role.ADMIN && !isMember(project, creator)) {
            throw new AccessDeniedException("No access to this project");
        }
        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new NoSuchElementException("Assignee not found"));
        }
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .project(project)
                .assignee(assignee)
                .status(request.getStatus() != null ? request.getStatus() : Task.Status.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Task.Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .build();
        return TaskDto.Response.from(taskRepository.save(task));
    }

    @Transactional
    public TaskDto.Response updateTask(Long id, TaskDto.UpdateRequest request, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));
        if (user.getRole() != User.Role.ADMIN && !isMember(task.getProject(), user)) {
            throw new AccessDeniedException("No access to this task");
        }
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new NoSuchElementException("Assignee not found"));
            task.setAssignee(assignee);
        }
        return TaskDto.Response.from(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Task not found"));
        if (user.getRole() != User.Role.ADMIN && !task.getProject().getOwner().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only admin or project owner can delete tasks");
        }
        taskRepository.delete(task);
    }

    public DashboardStats getDashboardStats(User user) {
        List<Task> tasks = user.getRole() == User.Role.ADMIN
                ? taskRepository.findAll()
                : taskRepository.findTasksForUser(user.getId());

        long total = tasks.size();
        long todo = tasks.stream().filter(t -> t.getStatus() == Task.Status.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == Task.Status.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == Task.Status.DONE).count();
        long overdue = tasks.stream().filter(t ->
                t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()) && t.getStatus() != Task.Status.DONE
        ).count();

        List<Project> projects = user.getRole() == User.Role.ADMIN
                ? projectRepository.findAll()
                : projectRepository.findProjectsByUserId(user.getId());

        return new DashboardStats(total, todo, inProgress, done, overdue, projects.size());
    }

    public record DashboardStats(long total, long todo, long inProgress, long done, long overdue, long totalProjects) {}

    private boolean isMember(Project project, User user) {
        return project.getOwner().getId().equals(user.getId()) ||
                memberRepository.existsByProjectIdAndUserId(project.getId(), user.getId());
    }
}
