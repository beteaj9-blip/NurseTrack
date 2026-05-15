package edu.cit.nursetracker.checklist;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;

    public List<ChecklistItem> getStudentChecklist(Long studentId) {
        return checklistItemRepository.findByStudentId(studentId);
    }

    public ChecklistItem updateItem(Long id, ChecklistItem item) {
        return checklistItemRepository.save(item);
    }

    public ChecklistItem createItem(ChecklistItem item) {
        return checklistItemRepository.save(item);
    }
}
