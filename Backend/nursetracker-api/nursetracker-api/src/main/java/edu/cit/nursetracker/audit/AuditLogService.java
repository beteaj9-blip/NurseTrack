package edu.cit.nursetracker.audit;

import edu.cit.nursetracker.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    private final AuditLogRepository repository;

    public List<AuditLog> getAll() {
        return repository.findAllByOrderByOccurredAtDesc();
    }

    public AuditLog create(User actor, String action, String recordName, String context, String category) {
        return create(actor.getFullName(), actor.getRole().name(), action, recordName, context, category);
    }

    public AuditLog create(String actor, String actorRole, String action, String recordName, String context, String category) {
        AuditLog log = new AuditLog();
        log.setActor(actor);
        log.setActorRole(actorRole);
        log.setAction(action);
        log.setRecordName(recordName);
        log.setContext(context);
        log.setCategory(category);
        return repository.save(log);
    }
}
