import { StudentProgressDetailContent } from "@/components/features/StudentProgressDetailContent";

export default function StudentProgressPage() {
  return (
    <StudentProgressDetailContent 
      basePath="/nursing-student" 
      searchParams={Promise.resolve({ student: "treasure-abadinas" })} 
    />
  );
}
