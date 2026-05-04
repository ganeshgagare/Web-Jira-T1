package com.taskmanager.service;

import com.taskmanager.dto.ProjectDto;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository memberRepository;

    public List<ProjectDto.Response> getProjectsForUser(User user) {
        List<Project> projects = user.getRole() == User.Role.ADMIN
                ? projectRepository.findAll()
                : projectRepository.findProjectsByUserId(user.getId());
        return projects.stream().map(ProjectDto.Response::from).toList();
    }

    public ProjectDto.Response getProject(Long id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (user.getRole() != User.Role.ADMIN && !isMember(project, user)) {
            throw new AccessDeniedException("You are not a member of this project");
        }
        return ProjectDto.Response.from(project);
    }

    @Transactional
    public ProjectDto.Response createProject(ProjectDto.CreateRequest request, User owner) {
        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .deadline(request.getDeadline())
                .owner(owner)
                .build();
        project = projectRepository.save(project);
        return ProjectDto.Response.from(project);
    }

    @Transactional
    public ProjectDto.Response updateProject(Long id, ProjectDto.CreateRequest request, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (!project.getOwner().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the owner or admin can update this project");
        }
        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getDeadline() != null) project.setDeadline(request.getDeadline());
        return ProjectDto.Response.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Long id, User user) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (!project.getOwner().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the owner or admin can delete this project");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectDto.Response addMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the owner or admin can add members");
        }
        User newMember = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        if (!memberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            ProjectMember pm = ProjectMember.builder().project(project).user(newMember).build();
            memberRepository.save(pm);
        }
        return ProjectDto.Response.from(projectRepository.findById(projectId).get());
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, User currentUser) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NoSuchElementException("Project not found"));
        if (!project.getOwner().getId().equals(currentUser.getId()) && currentUser.getRole() != User.Role.ADMIN) {
            throw new AccessDeniedException("Only the owner or admin can remove members");
        }
        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    private boolean isMember(Project project, User user) {
        return project.getOwner().getId().equals(user.getId()) ||
                memberRepository.existsByProjectIdAndUserId(project.getId(), user.getId());
    }
}
