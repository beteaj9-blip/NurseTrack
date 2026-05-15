package edu.cit.nursetracker.checklist;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist")
@RequiredArgsConstructor

public class ChecklistItemController {

    private final ChecklistItemService checklistItemService;

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ChecklistItem>> getStudentChecklist(@PathVariable Long studentId) {
        return ResponseEntity.ok(checklistItemService.getStudentChecklist(studentId));
    }

    @PostMapping
    public ResponseEntity<ChecklistItem> createItem(@RequestBody ChecklistItem item) {
        return ResponseEntity.ok(checklistItemService.createItem(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChecklistItem> updateItem(@PathVariable Long id, @RequestBody ChecklistItem item) {
        item.setId(id);
        return ResponseEntity.ok(checklistItemService.updateItem(id, item));
    }
}
