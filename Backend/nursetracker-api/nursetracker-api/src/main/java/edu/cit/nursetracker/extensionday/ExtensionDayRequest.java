package edu.cit.nursetracker.extensionday;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExtensionDayRequest {
    private Long studentId;
    private Long instructorId;
    private Integer days;
    private String basis;
    private String reason;
}
