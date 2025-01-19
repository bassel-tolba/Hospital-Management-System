// UserActivityController.java
package mine.profile.website.rest.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import mine.profile.website.dtos.UserActivityDTO;
import mine.profile.website.service.UserActivityService;

@RestController
@RequestMapping("/api/activities")
public class UserActivityController {

    @Autowired
    private UserActivityService userActivityService;

    @PostMapping
    public ResponseEntity<UserActivityDTO> createUserActivity(@RequestBody UserActivityDTO userActivityDTO) {
        UserActivityDTO createdActivity = userActivityService.createUserActivity(userActivityDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdActivity);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserActivityDTO>> getAvailableActivitiesForUser(@PathVariable Long userId) {
        List<UserActivityDTO> activities = userActivityService.getAvailableActivitiesForUser(userId);
        return ResponseEntity.ok(activities);
    }

    @PutMapping("/{id}/state/{state}")
    public ResponseEntity<UserActivityDTO> updateActivityState(@PathVariable Long id, @PathVariable String state) {
        UserActivityDTO updatedActivity = userActivityService.updateActivityState(id, state);
        return ResponseEntity.ok(updatedActivity);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserActivityDTO> getActivityById(@PathVariable Long id) {
        UserActivityDTO activity = userActivityService.getActivityById(id);
        return ResponseEntity.ok(activity);
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserActivityDTO>> getAllActivities() {
        List<UserActivityDTO> activities = userActivityService.getAllActivities();
        return ResponseEntity.ok(activities);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivityById(@PathVariable Long id) {
        userActivityService.deleteActivityById(id);
        return ResponseEntity.noContent().build();
    }

}