"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/axios";
import { useClinicalCase, useSubmitCase, useUpdateClinicalCase } from "@/core/api/hooks/useClinicalCases";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useInstructors } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { useToast } from "@/components/ui/ToastProvider";

type CaseCategoryOption = {
  value: string;
  categoryName: string;
};

const defaultCaseCategories: CaseCategoryOption[] = [
  { value: "Handled Cases", categoryName: "Handled Case" },
  { value: "Assisted Cases", categoryName: "Assisted Case" },
  { value: "Newborn Care", categoryName: "Newborn Care" },
  { value: "Labor Watch", categoryName: "Labor Watch" },
  { value: "Major Cases - Assist", categoryName: "Major Case - Assist" },
  { value: "Major Cases - Scrub", categoryName: "Major Case - Scrub" },
  { value: "Major Cases - Circulating", categoryName: "Major Case - Circulate" },
];

function errorMessage(error: unknown, fallback: string) {
  const response = (error as { response?: { data?: { message?: string } | string } })?.response;
  if (typeof response?.data === "string" && response.data.trim()) return response.data;
  if (typeof response?.data === "object" && response.data?.message) return response.data.message;
  return fallback;
}

function toCategoryOptions(categories: CaseCategoryOption[]) {
  const options = categories
    .map((item) => ({ value: item.value || item.categoryName, label: item.categoryName || item.value }))
    .filter((item): item is { value: string; label: string } => Boolean(item.value?.trim() && item.label?.trim()));
  return options.length > 0 ? options : defaultCaseCategories.map((item) => ({ value: item.value, label: item.categoryName }));
}

function formatScheduleDate(date?: string) {
  if (!date) return "";
  const datePart = date.includes("T") ? date.split("T")[0] : date;
  return new Date(`${datePart}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getCaseType(category: string, dutyArea: string) {
  const combined = `${category} ${dutyArea}`.toLowerCase();
  if (combined.includes("operating") || combined.includes("major") || combined.includes("minor")) return "OPERATING_ROOM";
  if (combined.includes("delivery") || combined.includes("newborn") || combined.includes("labor")) return "DELIVERY_ROOM";
  return "WARD";
}

function appendOption(options: { value: string; label: string }[], value?: string, label?: string) {
  if (!value || options.some((option) => option.value === value)) return options;
  return [...options, { value, label: label || value }];
}

export default function AddClinicalCaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCaseId = searchParams.get("id") ?? "";
  const isEditMode = Boolean(editCaseId);
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: schedules = [] } = useSchedules(undefined, user?.role);
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors(userId);
  const { data: categories = [] } = useQuery<CaseCategoryOption[]>({
    queryKey: ["clinical-case-categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cases/categories");
      return Array.isArray(data) && data.length > 0 ? data as CaseCategoryOption[] : defaultCaseCategories;
    },
  });
  const submitCase = useSubmitCase();
  const updateCase = useUpdateClinicalCase();
  const { data: editCase } = useClinicalCase(editCaseId || undefined);
  const isSubmitting = submitCase.isPending || updateCase.isPending;
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [patientInitials, setPatientInitials] = useState("");
  const [category, setCategory] = useState("");
  const [procedureDetails, setProcedureDetails] = useState("");
  const [hospital, setHospital] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [dutyArea, setDutyArea] = useState("");
  const [studentReflection, setStudentReflection] = useState("");
  const [message, setMessage] = useState("Complete the required case information before submitting.");

  React.useEffect(() => {
    if (!editCase) return;
    if (editCase.status !== "PENDING") {
      setMessage("Only pending clinical cases can be edited.");
      showToast({ variant: "error", title: "Edit unavailable", message: "Only pending clinical cases can be edited." });
      router.push("/nursing-student/clinical-cases");
      return;
    }
    setPatientInitials(editCase.patientInitials ?? "");
    setCategory(editCase.category ?? "");
    setProcedureDetails(editCase.procedurePerformed ?? editCase.procedureDetails ?? "");
    setHospital(editCase.hospital ?? "");
    setInstructorId(editCase.instructorId != null ? String(editCase.instructorId) : "");
    setDutyArea(editCase.dutyArea ?? editCase.area ?? "");
    setStudentReflection(editCase.studentReflection ?? "");
    setMessage("Update the pending case details before resubmitting.");
  }, [editCase, router, showToast]);

  const selectedSchedule = schedules.find((schedule: any) => String(schedule.id) === selectedScheduleId);
  const selectedHospital = hospitals.find((item: any) => item.name === hospital);
  const allDutyAreas = useMemo(() => Array.from(new Set((hospitals as any[]).flatMap((item: any) => item.wards ?? []).filter(Boolean))).sort(), [hospitals]);
  const wards = useMemo(() => {
    if (selectedHospital?.wards?.length) return selectedHospital.wards;
    return allDutyAreas;
  }, [selectedHospital, allDutyAreas]);
  const hospitalOptions = useMemo(() => appendOption((hospitals as any[]).map((item: any) => ({ value: item.name, label: `${item.name}${item.fullName ? ` - ${item.fullName}` : ""}` })), hospital), [hospitals, hospital]);
  const wardOptions = useMemo(() => appendOption(wards.map((ward: string) => ({ value: ward, label: ward })), dutyArea), [wards, dutyArea]);
  const categoryOptions = useMemo(() => toCategoryOptions(categories), [categories]);
  const instructorOptions = useMemo(() => appendOption((instructors as any[]).map((instructor: any) => ({ value: String(instructor.id), label: instructor.fullName })), instructorId, selectedSchedule?.instructorName ?? editCase?.instructorName), [instructors, instructorId, selectedSchedule?.instructorName, editCase?.instructorName]);
  const eligibleSchedules = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (schedules as any[]).filter((schedule: any) => {
      if (!schedule.date) return false;
      const scheduleDate = new Date(`${schedule.date}T00:00:00`);
      return scheduleDate.getTime() <= today.getTime();
    });
  }, [schedules]);
  const scheduleOptions = useMemo(() => eligibleSchedules.map((schedule: any) => ({ value: String(schedule.id), label: `${formatScheduleDate(schedule.date)} - ${schedule.area}` })), [eligibleSchedules]);

  React.useEffect(() => {
    if (!selectedSchedule || isEditMode) return;
    setHospital(selectedSchedule.hospital ?? "");
    setDutyArea(selectedSchedule.area ?? "");
    setInstructorId(selectedSchedule.instructorId != null ? String(selectedSchedule.instructorId) : "");
  }, [isEditMode, selectedSchedule?.id, selectedSchedule?.hospital, selectedSchedule?.area, selectedSchedule?.instructorId]);

  const handleScheduleChange = (value: string) => {
    setSelectedScheduleId(value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || (!selectedSchedule && !isEditMode) || !category || !patientInitials || !procedureDetails || !hospital || !instructorId || !dutyArea) {
      setMessage("Complete the required case information before submitting.");
      showToast({ variant: "error", title: "Missing case details", message: "Complete the required case information before submitting." });
      return;
    }

    try {
      const payload = {
        student: { id: user.id },
        instructor: { id: Number(instructorId) },
        caseType: getCaseType(category, dutyArea),
        patientInitials,
        category,
        hospital,
        dutyArea,
        shiftTime: selectedSchedule ? `${selectedSchedule.startTime} - ${selectedSchedule.endTime}` : editCase?.shiftTime,
        caseDate: selectedSchedule?.date ?? editCase?.procedureDate ?? editCase?.caseDate,
        diagnosis: category,
        procedureDetails,
        studentReflection,
      };
      if (isEditMode) await updateCase.mutateAsync({ caseId: editCaseId, caseData: payload });
      else await submitCase.mutateAsync(payload);
      setMessage(isEditMode ? "Clinical case updated for CI validation." : "Clinical case submitted for CI validation.");
      showToast({ variant: "success", title: isEditMode ? "Clinical case updated" : "Clinical case submitted", message: "Your case was sent for CI validation." });
      router.push("/nursing-student/clinical-cases");
    } catch (error) {
      const backendMessage = errorMessage(error, "Clinical case could not be submitted.");
      setMessage(backendMessage);
      showToast({ variant: "error", title: "Submission failed", message: backendMessage });
    }
  };

  return (
    <div className="p-10">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Case Information</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.75rem] font-bold">
            {isEditMode ? "Editing pending case" : "Draft"}
          </span>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Case Date</label>
              <InlineSelect value={selectedScheduleId} options={scheduleOptions} placeholder="Select case date" onChange={handleScheduleChange} />
              {eligibleSchedules.length === 0 && <span className="mt-2 text-[0.78rem] font-bold text-[#92400e]">No completed or current schedules are available for case submission.</span>}
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Time of Shift</label>
              <input 
                type="text" 
                placeholder="Select a case date first" 
                value={selectedSchedule ? `${selectedSchedule.startTime} - ${selectedSchedule.endTime}` : ""}
                disabled
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#64748b] font-medium bg-[#f8fafc] focus:outline-none cursor-not-allowed shadow-sm text-[0.9rem]"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Patient Name</label>
              <input 
                type="text" 
                placeholder="Enter patient initials only" 
                value={patientInitials}
                onChange={(event) => setPatientInitials(event.target.value)}
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Category</label>
              <InlineSelect value={category} options={categoryOptions} placeholder="Select category" onChange={setCategory} />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Procedure Performed</label>
              <input 
                type="text" 
                placeholder="Enter procedure performed" 
                value={procedureDetails}
                onChange={(event) => setProcedureDetails(event.target.value)}
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Name of Hospital</label>
              <InlineSelect value={hospital} options={hospitalOptions} placeholder="Select a case date first" onChange={() => undefined} disabled />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supervising Clinical Instructor</label>
              <InlineSelect value={instructorId} options={instructorOptions} placeholder="Select a case date first" onChange={() => undefined} disabled />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Duty Area</label>
              <InlineSelect value={dutyArea} options={wardOptions} placeholder="Select a case date first" onChange={() => undefined} disabled />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Student Reflection</label>
              <textarea 
                placeholder="Enter student reflection" 
                rows={4}
                value={studentReflection}
                onChange={(event) => setStudentReflection(event.target.value)}
                className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8] resize-y"
              ></textarea>
            </div>

          </div>

          {/* Footer Notice */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 mb-6">
            <p className="text-[#64748b] text-[0.85rem] font-semibold m-0">{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="h-[42px] px-6 rounded-lg bg-[#8A252C] text-white text-[0.92rem] font-bold shadow-sm hover:bg-[#681920] transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : isEditMode ? "Save Changes" : "Submit For CI Validation"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
