package com.erp.auth.controller;

import com.erp.org.entity.Project;
import com.erp.org.entity.ProjectTask;
import com.erp.org.entity.Timesheet;
import com.erp.org.repository.ProjectRepository;
import com.erp.org.repository.ProjectTaskRepository;
import com.erp.org.repository.TimesheetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;
    private final TimesheetRepository timesheetRepository;

    public ProjectController(ProjectRepository projectRepository,
                             ProjectTaskRepository projectTaskRepository,
                             TimesheetRepository timesheetRepository) {
        this.projectRepository = projectRepository;
        this.projectTaskRepository = projectTaskRepository;
        this.timesheetRepository = timesheetRepository;
    }

    // 1. Projects
    @GetMapping
    public ResponseEntity<List<Project>> getProjects(@RequestParam Long companyId) {
        return ResponseEntity.ok(projectRepository.findByCompanyId(companyId));
    }

    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        return ResponseEntity.ok(projectRepository.save(project));
    }

    // 2. Tasks
    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<ProjectTask>> getProjectTasks(@PathVariable Long id, @RequestParam Long companyId) {
        return ResponseEntity.ok(projectTaskRepository.findByCompanyIdAndProjectId(companyId, id));
    }

    @PostMapping("/tasks")
    public ResponseEntity<ProjectTask> createProjectTask(@RequestBody ProjectTask task) {
        return ResponseEntity.ok(projectTaskRepository.save(task));
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        Optional<ProjectTask> opt = projectTaskRepository.findById(id);
        if (opt.isPresent()) {
            ProjectTask task = opt.get();
            task.setStatus(status);
            return ResponseEntity.ok(projectTaskRepository.save(task));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Task not found."));
    }

    // 3. Timesheets
    @PostMapping("/timesheets")
    public ResponseEntity<Timesheet> createTimesheet(@RequestBody Timesheet timesheet) {
        return ResponseEntity.ok(timesheetRepository.save(timesheet));
    }
}
