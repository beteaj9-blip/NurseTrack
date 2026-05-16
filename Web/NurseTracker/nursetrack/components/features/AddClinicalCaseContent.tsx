"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/core/api/axios";
import { useSubmitCase } from "@/core/api/hooks/useClinicalCases";
import { useHospitals } from "@/core/api/hooks/useHospitals";
import { useSchedules } from "@/core/api/hooks/useSchedules";
import { useInstructors } from "@/core/api/hooks/useUsers";
import { useAuthStore } from "@/core/store/authStore";

type CaseCategoryOption = {
  value: string;
  label: string;
};

function getCaseType(category: string, dutyArea: string) {
  const combined = `${category} ${dutyArea}`.toLowerCase();
  if (combined.includes("operating") || combined.includes("major") || combined.includes("minor")) return "OPERATING_ROOM";
  if (combined.includes("delivery") || combined.includes("newborn") || combined.includes("labor")) return "DELIVERY_ROOM";
  return "WARD";
}

export default function AddClinicalCaseContent() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id != null ? String(user.id) : undefined;
  const { data: schedules = [] } = useSchedules(userId);
  const { data: hospitals = [] } = useHospitals();
  const { data: instructors = [] } = useInstructors();
  const { data: categories = [] } = useQuery<CaseCategoryOption[]>({
    queryKey: ["clinical-case-categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cases/categories");
      return data as CaseCategoryOption[];
    },
  });
  const submitCase = useSubmitCase();
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [patientInitials, setPatientInitials] = useState("");
  const [category, setCategory] = useState("");
  const [procedureDetails, setProcedureDetails] = useState("");
  const [hospital, setHospital] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [dutyArea, setDutyArea] = useState("");
  const [studentReflection, setStudentReflection] = useState("");
  const [message, setMessage] = useState("Complete the required case information before submitting.");

  const selectedSchedule = schedules.find((schedule: any) => String(schedule.id) === selectedScheduleId);
  const selectedHospital = hospitals.find((item: any) => item.name === hospital);
  const wards = useMemo(() => selectedHospital?.wards ?? [], [selectedHospital]);

  const handleScheduleChange = (value: string) => {
    const schedule = schedules.find((item: any) => String(item.id) === value);
    setSelectedScheduleId(value);
    setHospital(schedule?.hospital ?? "");
    setDutyArea(schedule?.area ?? "");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedSchedule || !category || !patientInitials || !procedureDetails || !hospital || !instructorId || !dutyArea) {
      setMessage("Complete the required case information before submitting.");
      return;
    }

    try {
      await submitCase.mutateAsync({
        student: { id: user.id },
        instructor: { id: Number(instructorId) },
        caseType: getCaseType(category, dutyArea),
        patientInitials,
        category,
        hospital,
        dutyArea,
        shiftTime: `${selectedSchedule.startTime} - ${selectedSchedule.endTime}`,
        caseDate: selectedSchedule.date,
        diagnosis: category,
        procedureDetails,
        studentReflection,
      });
      setMessage("Clinical case submitted for CI validation.");
      setPatientInitials("");
      setCategory("");
      setProcedureDetails("");
      setStudentReflection("");
    } catch {
      setMessage("Clinical case could not be submitted.");
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Case Information</h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#fff8e1] !text-[#6c4c00] !text-[0.75rem] font-bold">
            Draft
          </span>
        </div>

        {/* Form Grid */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Case Date</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={selectedScheduleId} onChange={(event) => handleScheduleChange(event.target.value)}>
                <option value="" disabled hidden>Select case date</option>
                {schedules.map((schedule: any) => (
                  <option key={schedule.id} value={schedule.id}>{schedule.date} - {schedule.area}</option>
                ))}
              </select>
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
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={category} onChange={(event) => setCategory(event.target.value)}>
                <option value="" disabled hidden>Select category</option>
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
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
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={hospital} onChange={(event) => { setHospital(event.target.value); setDutyArea(""); }}>
                <option value="" disabled hidden>Select hospital</option>
                {hospitals.map((item: any) => (
                  <option key={item.id} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supervising Clinical Instructor</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={instructorId} onChange={(event) => setInstructorId(event.target.value)}>
                <option value="" disabled hidden>Select supervising CI</option>
                {instructors.map((instructor: any) => (
                  <option key={instructor.id} value={instructor.id}>{instructor.fullName}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Duty Area</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" value={dutyArea} onChange={(event) => setDutyArea(event.target.value)}>
                <option value="" disabled hidden>Select duty area</option>
                {wards.map((ward: string) => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
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
              className="h-[42px] px-6 rounded-lg bg-[#8A252C] text-white text-[0.92rem] font-bold shadow-sm hover:bg-[#681920] transition-colors"
            >
              Submit For CI Validation
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
