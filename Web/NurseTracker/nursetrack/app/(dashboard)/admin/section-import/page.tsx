"use client";

import React, { useRef, useState } from "react";
import { ProfileAvatar } from "@/components/ui/ProfileAvatar";
import { useToast } from "@/components/ui/ToastProvider";
import { usePreviewSectionAssignments, usePublishSectionAssignments, useUsers } from "@/core/api/hooks/useUsers";

const PAGE_SIZE = 8;

type SectionStudent = {
  studentNo: string;
  name: string;
  schoolId: string;
  courseYear: string;
  level?: number;
  matched: boolean;
  userId?: number;
  databaseName: string;
  currentSection: string;
  profileImageUrl: string;
};

type SectionPreview = {
  filename: string;
  schoolYear: string;
  semester: string;
  section: string;
  level?: number;
  totalStudents: number;
  matchedStudents: number;
  skippedStudents: number;
  updatedStudents?: number;
  students: SectionStudent[];
};

type ApiUser = {
  id: number;
  fullName: string;
  schoolId: string;
  sectionInfo?: string;
  assignedLevels?: number[];
  profileImageUrl?: string;
  role: string;
};

export default function SectionImportPage() {
  const { data: databaseStudents = [] } = useUsers("STUDENT");
  const previewSections = usePreviewSectionAssignments();
  const publishSections = usePublishSectionAssignments();
  const { showToast } = useToast();
  const [fileName, setFileName] = useState<string>("No file selected");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<SectionPreview | null>(null);
  const [status, setStatus] = useState<string>("Waiting for file");
  const [message, setMessage] = useState<string>("Upload a class-record Excel file to preview section assignments.");
  const [messageClass, setMessageClass] = useState<string>("");
  const [addStudentSearch, setAddStudentSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const matchedStudents = preview?.students.filter((student) => student.matched) ?? [];
  const unmatchedStudents = preview?.students.filter((student) => !student.matched) ?? [];
  const addableStudents = (databaseStudents as ApiUser[]).filter((student) => {
    if (!preview) return false;
    const alreadyIncluded = preview.students.some((record) => String(record.userId) === String(student.id) || record.schoolId === student.schoolId);
    if (alreadyIncluded) return false;
    const q = addStudentSearch.toLowerCase().trim();
    return !q || `${student.fullName} ${student.schoolId} ${student.sectionInfo ?? ""}`.toLowerCase().includes(q);
  }).slice(0, 6);

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSelectedFile(file);
    setPreview(null);
    setAddStudentSearch("");
    setStatus("File selected");
    setMessage(`${file.name} selected. Preview the class record before publishing section assignments.`);
    setMessageClass("is-success");
    showToast({ variant: "success", title: "File selected", message: `${file.name} is ready for preview.` });
  };

  const handleReset = () => {
    setFileName("No file selected");
    setSelectedFile(null);
    setPreview(null);
    setStatus("Waiting for file");
    setMessage("Upload a class-record Excel file to preview section assignments.");
    setMessageClass("");
    setAddStudentSearch("");
  };

  const withStudents = (students: SectionStudent[]): SectionPreview | null => {
    if (!preview) return null;
    const matched = students.filter((student) => student.matched).length;
    return {
      ...preview,
      students,
      totalStudents: students.length,
      matchedStudents: matched,
      skippedStudents: students.length - matched,
    };
  };

  const removeStudent = (student: SectionStudent) => {
    setPreview((current) => {
      if (!current) return current;
      const students = current.students.filter((record) => studentKey(record) !== studentKey(student));
      const matched = students.filter((record) => record.matched).length;
      return { ...current, students, totalStudents: students.length, matchedStudents: matched, skippedStudents: students.length - matched };
    });
  };

  const addDatabaseStudent = (student: ApiUser) => {
    if (!preview) return;
    const level = preview.level ?? student.assignedLevels?.[0];
    const nextStudent: SectionStudent = {
      studentNo: String((preview.students.map((record) => Number(record.studentNo)).filter(Number.isFinite).sort((a, b) => b - a)[0] ?? preview.students.length) + 1),
      name: student.fullName,
      schoolId: student.schoolId,
      courseYear: level ? `BSN ${level}` : "",
      level,
      matched: true,
      userId: student.id,
      databaseName: student.fullName,
      currentSection: student.sectionInfo ?? "",
      profileImageUrl: student.profileImageUrl ?? "",
    };
    setPreview(withStudents([...preview.students, nextStudent]));
    setAddStudentSearch("");
    showToast({ variant: "success", title: "Student added", message: `${student.fullName} was added to the import list.` });
  };

  const handlePreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setMessage("Choose a CSV or Excel file before previewing section assignments.");
      setMessageClass("");
      showToast({ variant: "error", title: "No file selected", message: "Choose a CSV or Excel file before previewing." });
      return;
    }
    try {
      const result = await previewSections.mutateAsync(selectedFile);
      setPreview(result);
      setAddStudentSearch("");
      setStatus("Preview ready");
      setMessage(`Preview ready: ${result.matchedStudents} matched, ${result.skippedStudents} need review. Section ${result.section || "not detected"}, level ${result.level ?? "not detected"}.`);
      setMessageClass("is-success");
      showToast({ variant: "success", title: "Preview ready", message: `${result.matchedStudents} matched, ${result.skippedStudents} unmatched.` });
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data || "Section assignments could not be previewed.";
      setStatus("Preview failed");
      setMessage(String(backendMessage));
      setMessageClass("");
      showToast({ variant: "error", title: "Preview failed", message: String(backendMessage) });
    }
  };

  const handlePublish = async () => {
    if (!preview) return;
    try {
      const result = await publishSections.mutateAsync(preview);
      setPreview(null);
      setSelectedFile(null);
      setFileName("No file selected");
      setAddStudentSearch("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setStatus("Import complete");
      setMessage(`${result.updatedStudents} students updated to section ${result.section || ""}, level ${result.level ?? ""}. Academic term set to ${result.semester || ""}, ${result.schoolYear || ""}.`);
      setMessageClass("is-success");
      showToast({ variant: "success", title: "Import complete", message: `${result.updatedStudents} students updated.` });
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || error?.response?.data || "Section assignments could not be imported.";
      setStatus("Import failed");
      setMessage(String(backendMessage));
      setMessageClass("");
      showToast({ variant: "error", title: "Import failed", message: String(backendMessage) });
    }
  };

  return (
    <main className="p-[clamp(24px,4vw,42px)] content-start grid gap-4 w-full">
      <section className="mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]">
        <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap">
          <div>
            <h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Upload Section Class Record</h2>
            <p className="m-[0.45rem_0_0] !text-[#64748b] !text-[0.9rem] !font-[700]">Updates the active academic term, student section, and student level for matched students only.</p>
          </div>
          <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">{status}</span>
        </div>

        <form className="grid gap-5" id="section-import-form" onReset={handleReset} onSubmit={handlePreview}>
          <div className="flex flex-col justify-between gap-8 min-h-[210px] p-[1.9rem] border border-dashed border-[#8A252C]/28 rounded-[0.85rem] bg-[linear-gradient(135deg,#fff7d6_0%,#fffaf0_55%,#ffffff_100%)]">
            <div>
              <strong className="block !text-[#0f172a] !text-[1.15rem] !font-[800] mb-4">Drop class-record file here</strong>
              <p className="max-w-[1180px] m-0 !text-[#475569] !text-base !font-[700] leading-[1.55]">The importer reads Term & School Year, Section, Student No., and Course & Year. Existing students are matched by school ID for faster and safer updates.</p>
            </div>
            <div className="flex items-center justify-end gap-3 flex-wrap max-[900px]:justify-start">
              <input id="section-file" type="file" accept=".csv,.xlsx,.xls" hidden required ref={fileInputRef} onChange={handleFileChange} />
              <button className="inline-flex items-center justify-center w-auto min-w-[175px] min-h-[48px] whitespace-nowrap px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-[0.95rem] !font-extrabold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" id="choose-section-file" onClick={handleFileClick}>Choose class record</button>
              <span className="!text-[#475569] !text-[0.9rem] !font-[800]" id="section-file-name">{fileName}</span>
            </div>
          </div>

          <div id="section-import-message" className={`flex items-center min-h-[48px] px-4 rounded-lg !text-sm !font-bold border ${messageClass === "is-success" ? "bg-[#e9f8ef] !text-[#078033] border-[#bbf7d0]" : "bg-[#f8fafc] !text-[#4c5d7d] border-[#e2e8f0]"}`} role="status" aria-live="polite">{message}</div>

          {(selectedFile || preview) && <div className="flex items-center justify-end gap-[0.85rem] flex-wrap max-[900px]:justify-start">
            <button className="inline-flex items-center justify-center w-auto min-w-[145px] min-h-[52px] px-[24px] whitespace-nowrap rounded-[10px] bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer max-[900px]:w-full max-[900px]:min-w-0" type="reset">Clear</button>
            {selectedFile && !preview && <button className="inline-flex items-center justify-center w-auto min-w-[220px] min-h-[52px] px-[30px] whitespace-nowrap rounded-[10px] bg-white border border-[#8A252C]/30 !text-[#8A252C] !text-[0.95rem] tracking-[-0.01em] !font-extrabold hover:bg-[#fff7f7] transition-all cursor-pointer disabled:opacity-60 max-[900px]:w-full max-[900px]:min-w-0" type="submit" disabled={previewSections.isPending}>{previewSections.isPending ? "Previewing..." : "Preview Students"}</button>}
            {preview && <button className="inline-flex items-center justify-center w-auto min-w-[255px] min-h-[52px] px-[30px] whitespace-nowrap rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] tracking-[-0.01em] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60 max-[900px]:w-full max-[900px]:min-w-0" type="button" disabled={matchedStudents.length === 0 || publishSections.isPending} onClick={handlePublish}>{publishSections.isPending ? "Importing..." : "Import Matched Students"}</button>}
          </div>}
        </form>
      </section>

      {preview && <section className="grid gap-4">
        <article className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <div><h3 className="m-0 !text-[#111827] !text-[1rem] !font-[900]">Add Existing Student</h3><p className="m-[0.35rem_0_0] !text-[#64748b] !text-[0.84rem] !font-[700]">Search students and add them to the matched import list before publishing.</p></div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f8fafc] !text-[#475569] !text-[0.75rem] !font-[900]">{matchedStudents.length} matched</span>
          </div>
          <input className="w-full min-h-[48px] px-4 rounded-lg border border-[#d0d5dd] bg-white !text-[#111827] !font-[800] outline-none focus:border-[#8A252C] focus:ring-2 focus:ring-[#8A252C]/15" placeholder="Search by name, school ID, or current section" value={addStudentSearch} onChange={(event) => setAddStudentSearch(event.target.value)} />
          {addStudentSearch && <div className="grid gap-2 mt-3">
            {addableStudents.length === 0 ? <p className="m-0 p-3 rounded-lg bg-[#f8fafc] !text-[#64748b] !font-[800]">No available students found.</p> : addableStudents.map((student) => <div key={student.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[#e2e8f0] bg-[#fcfcfd]">
              <div className="flex items-center gap-3"><ProfileAvatar name={student.fullName} imageUrl={student.profileImageUrl} size={36} /><div><strong className="block !text-[#111827] !font-[900]">{student.fullName}</strong><span className="block !text-[#64748b] !text-[0.78rem] !font-[800]">{student.schoolId} · {student.sectionInfo || "No section"}</span></div></div>
              <button type="button" onClick={() => addDatabaseStudent(student)} className="min-h-[38px] px-4 rounded-lg bg-[#8A252C] !text-white !font-[900] cursor-pointer hover:bg-[#6d1d23]">Add</button>
            </div>)}
          </div>}
        </article>

        <section className="grid grid-cols-2 gap-4 max-[1100px]:grid-cols-1">
          <StudentTable title="Matched" tone="success" students={matchedStudents} section={preview.section} empty="No students from this file matched existing users." onRemove={removeStudent} />
          <StudentTable title="Unmatched" tone="danger" students={unmatchedStudents} section={preview.section} empty="Every student in this file matched an existing user." onRemove={removeStudent} />
        </section>
      </section>}
    </main>
  );
}

function studentKey(student: SectionStudent) {
  return `${student.userId ?? ""}|${student.schoolId}|${student.studentNo}|${student.name}`;
}

function StudentTable({ title, tone, students, section, empty, onRemove }: { title: string; tone: "success" | "danger"; students: SectionStudent[]; section: string; empty: string; onRemove: (student: SectionStudent) => void }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStudents = students.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  React.useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return <article className="rounded-xl border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] overflow-hidden">
    <div className="flex items-center justify-between gap-4 p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
      <h3 className="m-0 !text-[#111827] !text-[1rem] !font-[900]">{title}</h3>
      <span className={`inline-flex items-center px-3 py-1 rounded-full !text-[0.75rem] !font-[900] ${tone === "success" ? "bg-[#dcfce7] !text-[#166534]" : "bg-[#fef2f2] !text-[#991b1b]"}`}>{students.length} students</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead><tr className="border-b border-[#e2e8f0] !text-[#475569] !text-[0.74rem] !font-[900] uppercase"><th className="p-4 w-[72px]">No.</th><th className="p-4">Student</th><th className="p-4 w-[145px]">School ID</th><th className="p-4 w-[120px]">Level</th><th className="p-4 w-[130px]">Section</th><th className="p-4 w-[120px]">Action</th></tr></thead>
        <tbody>
          {students.length === 0 ? <tr><td className="p-5 !text-[#64748b] !font-[800]" colSpan={6}>{empty}</td></tr> : pageStudents.map((student) => <tr key={studentKey(student)} className="border-b border-[#e2e8f0] last:border-0">
            <td className="p-4 !font-[900] !text-[#111827]">{student.studentNo || "-"}</td>
            <td className="p-4"><div className="flex items-center gap-3"><ProfileAvatar name={student.databaseName || student.name || "Student"} imageUrl={student.profileImageUrl} size={38} /><strong className="block !text-[#111827] !font-[900]">{student.databaseName || student.name || "Unnamed student"}</strong></div></td>
            <td className="p-4 !text-[#334155] !font-[800]">{student.schoolId || "-"}</td>
            <td className="p-4 !text-[#334155] !font-[800]">{student.level ? `Level ${student.level}` : student.courseYear || "-"}</td>
            <td className="p-4 !text-[#334155] !font-[800]">{section || "-"}</td>
            <td className="p-4"><button type="button" onClick={() => onRemove(student)} className="min-h-[38px] px-4 rounded-lg bg-white border border-[#fca5a5] !text-[#b91c1c] !font-[900] cursor-pointer hover:bg-[#fef2f2]">Remove</button></td>
          </tr>)}
        </tbody>
      </table>
    </div>
    {students.length > PAGE_SIZE && <div className="flex items-center justify-between gap-3 p-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
      <button type="button" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="min-h-[38px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !font-[900] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
      <span className="!text-[#475569] !text-[0.84rem] !font-[900] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{currentPage} of {pageCount}</span>
      <button type="button" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="min-h-[38px] px-4 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !font-[900] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
    </div>}
  </article>;
}
