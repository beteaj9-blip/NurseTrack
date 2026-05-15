export const mockStudents: Record<string, any> = {
  "maria-cruz": {
    name: "Maria Cruz",
    initials: "MC",
    id: "12-3456-789",
    section: "BSN 3A",
    site: "CCMC",
    area: "Emergency Room",
    status: "In progress",
    extensionDays: 11,
    pending: 14,
  },
  "treasure-abadinas": {
    name: "Treasure Abadinas",
    initials: "TA",
    id: "22-1845-103",
    section: "BSN 3A",
    site: "SAMCH",
    area: "Delivery Room",
    status: "On track",
    extensionDays: 5,
    pending: 6,
  },
};

export const mockWeeklyDutyByStudent: Record<string, any[]> = {
  "maria-cruz": [
    { day: "Monday", date: "Apr 20", area: "Emergency Room", hours: 8, overtime: 0 },
    { day: "Tuesday", date: "Apr 21", area: "Emergency Room", hours: 9.5, overtime: 1.5 },
    { day: "Thursday", date: "Apr 23", area: "Operating Room", hours: 8, overtime: 0 },
    { day: "Friday", date: "Apr 24", area: "Operating Room", hours: 10, overtime: 2 },
  ],
  "treasure-abadinas": [
    { day: "Monday", date: "Apr 20", area: "Delivery Room", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: "Delivery Room", hours: 9, overtime: 1 },
    { day: "Thursday", date: "Apr 23", area: "Delivery Room", hours: 8, overtime: 0 },
    { day: "Friday", date: "Apr 24", area: "Delivery Room", hours: 9.5, overtime: 1.5 },
  ],
};

export function getDefaultWeeklyDuty(student: any) {
  return [
    { day: "Monday", date: "Apr 20", area: student.area || "Assigned area", hours: 8, overtime: 0 },
    { day: "Wednesday", date: "Apr 22", area: student.area || "Assigned area", hours: 8, overtime: 0 },
    { day: "Friday", date: "Apr 24", area: student.area || "Assigned area", hours: 8.5, overtime: 0.5 },
  ];
}
