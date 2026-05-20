"use client";

import React, { useState, useRef, useEffect } from "react";
import { apiClient } from "@/core/api/axios";
import { useAllClinicalCases, useInstructorCases } from "@/core/api/hooks/useClinicalCases";
import { useAuthStore } from "@/core/store/authStore";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";

type Person = {
  name: string;
  role: string;
  id: string;
  userId?: number;
  section: string;
  site: string;
  group: string;
};

export function ReportsContent() {
  const { showToast } = useToast();
  const user = useAuthStore((state) => state.user);
  const hasAllCaseAccess = user?.role === "ADMIN" || user?.role === "CHAIR" || user?.role === "ASSISTANT" || user?.role === "COORDINATOR";
  const viewerId = (user?.role === "CHAIR" || user?.role === "COORDINATOR") && user?.id != null ? String(user.id) : undefined;
  const { data: instructorCases = [], isLoading: isInstructorCasesLoading } = useInstructorCases(undefined, !hasAllCaseAccess);
  const { data: allCases = [], isLoading: isAllCasesLoading } = useAllClinicalCases(hasAllCaseAccess, viewerId);
  const cases = hasAllCaseAccess ? allCases : instructorCases;
  const isCasesLoading = hasAllCaseAccess ? isAllCasesLoading : isInstructorCasesLoading;
  const [reportScope, setReportScope] = useState("person");
  const [isGenerating, setIsGenerating] = useState(false);
  const getDefaultReportRange = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const startYear = today.getMonth() >= 5 ? currentYear : currentYear - 1;
    return { start: `${startYear}-06-01`, end: `${startYear + 1}-05-31` };
  };
  
  const [personSearch, setPersonSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  
  const [sectionTarget, setSectionTarget] = useState("");
  const [siteTarget, setSiteTarget] = useState("");
  const [groupTarget, setGroupTarget] = useState("");
  
  const [startDate, setStartDate] = useState(() => getDefaultReportRange().start);
  const [endDate, setEndDate] = useState(() => getDefaultReportRange().end);
  
  const [message, setMessage] = useState({ text: "Select a person, section, clinical site, or group, then generate a general report.", type: "" });
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const reportPeople = Object.values((cases as any[]).reduce((acc: Record<string, Person>, clinicalCase: any) => {
      const key = String(clinicalCase.studentId ?? clinicalCase.studentSchoolId ?? clinicalCase.studentName);
      if (!key || acc[key]) return acc;
      acc[key] = {
        name: clinicalCase.studentName || "Nursing Student",
        role: "Student",
        id: clinicalCase.studentSchoolId || "",
        userId: clinicalCase.studentId,
        section: clinicalCase.studentSection || "Nursing Student",
        site: clinicalCase.hospital || "Assigned Site",
        group: clinicalCase.studentSection || "Assigned Group",
      };
      return acc;
    }, {}));
  const sections = Array.from(new Set(reportPeople.map((person) => person.section).filter(Boolean))).sort();
  const sites = Array.from(new Set(reportPeople.map((person) => person.site).filter(Boolean))).sort();
  const groups = Array.from(new Set(reportPeople.map((person) => person.group).filter(Boolean))).sort();
  const reportScopeOptions = [
    { value: "person", label: "One student" },
  ];
  const sectionOptions = sections.map((section) => ({ value: section, label: section }));
  const siteOptions = sites.map((site) => ({ value: site, label: site }));
  const groupOptions = groups.map((group) => ({ value: group, label: group }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPeople = reportPeople.filter(person => {
    const searchable = `${person.name} ${person.role} ${person.id} ${person.section} ${person.site} ${person.group}`.toLowerCase();
    return searchable.includes(personSearch.toLowerCase());
  });

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
    setPersonSearch(person.name);
    setIsDropdownOpen(false);
  };

  const handlePersonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonSearch(e.target.value);
    setSelectedPerson(null);
    setIsDropdownOpen(true);
  };

  const resetForm = () => {
    setReportScope("person");
    setPersonSearch("");
    setSelectedPerson(null);
    setSectionTarget("");
    setSiteTarget("");
    setGroupTarget("");
    const defaultRange = getDefaultReportRange();
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    setMessage({ text: "Select a person, section, clinical site, or group, then generate a general report.", type: "" });
  };

  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (reportScope === "person") {
      const person = selectedPerson ?? reportPeople.find(p => p.name === personSearch);
      if (!person) {
        setMessage({ text: "Please choose a valid person from the dropdown list.", type: "is-error" });
        return;
      }

      if (person.role !== "Student" || person.userId == null) {
        setMessage({ text: "Choose a student record before generating a report.", type: "is-error" });
        showToast({ variant: "error", title: "Choose a student", message: "Reports are generated for students only." });
        return;
      }

      if (person.role === "Student" && person.userId != null) {
        try {
          setIsGenerating(true);
          const { data } = await apiClient.get('/reports/student/export-by-school-id', {
            params: { schoolId: person.id, startDate, endDate },
            responseType: "blob",
          });
          const url = window.URL.createObjectURL(data);
          const link = document.createElement("a");
          link.href = url;
          link.download = `student-report-${person.id || person.userId}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          setMessage({ text: `General report generated for ${person.name}.`, type: "is-success" });
          showToast({ variant: "success", title: "Report downloaded", message: `Report generated for ${person.name}.` });
        } catch {
          setMessage({ text: "The report could not be generated. Please check the selected date range and try again.", type: "is-error" });
          showToast({ variant: "error", title: "Report failed", message: "The report could not be generated." });
        } finally {
          setIsGenerating(false);
        }
      }
    } else if (reportScope === "section") {
      setMessage({ text: "Section report export is not available yet.", type: "is-error" });
      showToast({ variant: "error", title: "Report unavailable", message: "Choose one student to generate a report." });
    } else if (reportScope === "site") {
      setMessage({ text: "Clinical-site report export is not available yet.", type: "is-error" });
      showToast({ variant: "error", title: "Report unavailable", message: "Choose one student to generate a report." });
    } else if (reportScope === "group") {
      setMessage({ text: "Group report export is not available yet.", type: "is-error" });
      showToast({ variant: "error", title: "Report unavailable", message: "Choose one student to generate a report." });
    }
    
    setTimeout(() => {
      setMessage({ text: "Select a person, section, clinical site, or group, then generate a general report.", type: "" });
    }, 5000);
  };

  const inputClass = "w-full min-h-[48px] px-3 py-2 border border-[#dbe3ee] rounded-lg bg-white !text-[#111827] !font-[500] focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const labelClass = "flex flex-col gap-[6px] m-0 !text-[0.875rem] !font-[800] !text-[#344054]";
  const ghostBtn = "inline-flex items-center justify-center min-h-[38px] px-[12px] py-[8px] rounded-[8px] bg-white border border-[#e2e8f0] !text-[#344054] !text-[0.84rem] !font-[800] hover:border-[rgba(138,37,44,0.32)] hover:!text-[#8A252C] hover:shadow-[0_10px_24px_rgba(32,33,36,0.08)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryBtn = "inline-flex items-center justify-center min-h-[38px] px-[12px] py-[8px] rounded-[8px] bg-[#8A252C] border border-[#8A252C] !text-white !text-[0.84rem] !font-[800] hover:bg-[#6b1d22] hover:border-[#6b1d22] hover:shadow-[0_10px_24px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="p-[clamp(24px,4vw,42px)] min-h-[calc(100vh-64px)] content-start">
      <section className="grid grid-cols-[minmax(0,1fr)] w-full">
        <form className="bg-white rounded-xl shadow-[0_14px_34px_rgba(15,23,42,0.06)] border border-[#e2e8f0] p-[1.6rem_1.75rem_1.75rem] w-full mt-0" onSubmit={generateReport} noValidate>
          <div className="flex items-start justify-between gap-[22px] mb-[1.1rem] border-b border-[#e5eaf1] pb-[1.1rem] flex-wrap">
            <div>
              <h2 className="m-0 !text-[#111827] !text-[1.15rem] leading-[1.2] !font-[800] tracking-[-0.03em]">General Report Details</h2>
            </div>
            <span className="inline-flex items-center justify-start w-max min-h-[28px] px-[10px] py-[6px] rounded-full !text-[0.76rem] !font-[800] whitespace-nowrap bg-[#fff8e1] !text-[#6c4c00]">Required</span>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-[1rem] mb-[1.25rem]">
            <label className={labelClass} htmlFor="report-scope">
              Report about
              <InlineSelect value={reportScope} options={reportScopeOptions} placeholder="Select report scope" onChange={setReportScope} />
            </label>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-[1.25rem]">
            {reportScope === "person" && (
              <div className={`relative ${labelClass}`} id="person-field" ref={dropdownRef}>
                <label htmlFor="person-search">Search student</label>
                <input 
                  className={`${inputClass} [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:h-[14px] [&::-webkit-search-cancel-button]:w-[14px] [&::-webkit-search-cancel-button]:bg-[url('data:image/svg+xml;utf8,<svg_xmlns=\"http://www.w3.org/2000/svg\"_viewBox=\"0_0_24_24\"_fill=\"%23800000\"><path_d=\"M19_6.41L17.59_5_12_10.59_6.41_5_5_6.41_10.59_12_5_17.59_6.41_19_12_13.41_17.59_19_19_17.59_13.41_12z\"/></svg>')] [&::-webkit-search-cancel-button]:bg-contain [&::-webkit-search-cancel-button]:bg-no-repeat [&::-webkit-search-cancel-button]:cursor-pointer [&::-webkit-search-cancel-button]:opacity-70 hover:[&::-webkit-search-cancel-button]:opacity-100 transition-opacity`}
                  id="person-search" 
                  name="personSearch" 
                  type="search" 
                  placeholder="Search by name, ID, section, or clinical site" 
                  autoComplete="off"
                  value={personSearch}
                  onChange={handlePersonInputChange}
                  onFocus={() => setIsDropdownOpen(true)}
                />
                {isDropdownOpen && (
                  <div id="custom-person-dropdown" className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white border border-[#e2e8f0] rounded-lg shadow-[0_18px_40px_rgba(15,23,42,0.12)] max-h-[280px] overflow-y-auto z-[80]">
                    {isCasesLoading ? (
                      <LoadingState message="Loading report students" className="!p-4" />
                    ) : filteredPeople.length > 0 ? (
                      filteredPeople.map(person => (
                        <button key={person.id} className="w-full p-[0.9rem_1rem] cursor-pointer border-0 border-b border-[#f1f5f9] bg-white text-left font-inherit transition-colors hover:bg-[#f8fafc] focus:bg-[#f8fafc] focus:outline-none last:border-b-0" type="button" onClick={() => handlePersonSelect(person)}>
                          <strong className="block !text-[#0f172a] !text-[1rem] !font-[800] mb-[0.2rem]">{person.name}</strong>
                          <small className="block !text-[#475569] !text-[0.9rem] !font-[700]">{person.role} | {person.id} | {person.section}</small>
                        </button>
                      ))
                    ) : (
                      <div className="p-[1rem] !text-[#64748b] text-center italic !font-[700]">No results found</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {reportScope === "section" && (
              <label className={labelClass} htmlFor="section-target" id="section-field">
                Select section
                <InlineSelect value={sectionTarget} options={sectionOptions} placeholder="Choose section" onChange={setSectionTarget} />
              </label>
            )}

            {reportScope === "site" && (
              <label className={labelClass} htmlFor="site-target" id="site-field">
                Select clinical site
                <InlineSelect value={siteTarget} options={siteOptions} placeholder="Choose clinical site" onChange={setSiteTarget} />
              </label>
            )}

            {reportScope === "group" && (
              <label className={labelClass} htmlFor="group-target" id="group-field">
                Select group
                <InlineSelect value={groupTarget} options={groupOptions} placeholder="Choose group" onChange={setGroupTarget} />
              </label>
            )}

            <div className="grid grid-cols-2 gap-[1rem] max-[760px]:grid-cols-1">
              <label className={labelClass} htmlFor="start-date">
                Start date
                <input className={inputClass} id="start-date" name="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>

              <label className={labelClass} htmlFor="end-date">
                End date
                <input className={inputClass} id="end-date" name="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </label>
            </div>
          </div>

          <fieldset className="border border-[#e2e8f0] rounded-[0.5rem] p-[1.25rem_1.5rem] mt-[1.5rem]">
            <legend className="px-[0.5rem] !text-[0.95rem] !font-[800] !text-[#0f172a]">Include in report</legend>

            <div className="grid grid-cols-2 gap-y-[0.75rem] gap-x-[1.5rem] max-[680px]:grid-cols-1">
              <label className="flex items-center gap-[0.75rem] cursor-pointer !font-[600] !text-[0.95rem] !text-[#334155] select-none">
                <input className="w-[1.25rem] h-[1.25rem] cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
                Person, section, site, or group details
              </label>

              <label className="flex items-center gap-[0.75rem] cursor-pointer !font-[600] !text-[0.95rem] !text-[#334155] select-none">
                <input className="w-[1.25rem] h-[1.25rem] cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
                Schedule details
              </label>

              <label className="flex items-center gap-[0.75rem] cursor-pointer !font-[600] !text-[0.95rem] !text-[#334155] select-none">
                <input className="w-[1.25rem] h-[1.25rem] cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
                Duty hours and attendance records
              </label>

              <label className="flex items-center gap-[0.75rem] cursor-pointer !font-[600] !text-[0.95rem] !text-[#334155] select-none">
                <input className="w-[1.25rem] h-[1.25rem] cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
                Clinical case progress
              </label>

              <label className="flex items-center gap-[0.75rem] cursor-pointer !font-[600] !text-[0.95rem] !text-[#334155] select-none">
                <input className="w-[1.25rem] h-[1.25rem] cursor-pointer accent-[#8A252C]" type="checkbox" defaultChecked />
                Completion and lacking requirements
              </label>
            </div>
          </fieldset>

          <div id="report-message" className={`flex items-center gap-[0.75rem] px-[1.25rem] py-[0.85rem] rounded-[8px] mt-[1.25rem] !text-[0.85rem] !font-[700] leading-[1.4] ${message.type === 'is-error' ? 'bg-[#fef2f2] !text-[#991b1b] border border-[#fecaca]' : message.type === 'is-success' ? 'bg-[#f0fdf4] !text-[#166534] border border-[#bbf7d0]' : 'bg-[#f8fafc] !text-[#64748b] border border-[#e2e8f0]'}`} role="status" aria-live="polite">
            {message.text}
          </div>

          <div className="flex items-center justify-end gap-[1rem] mt-[1.5rem] pt-[1.5rem] border-t border-[#e2e8f0]">
            <button className={`${ghostBtn} w-auto min-w-[120px]`} type="button" onClick={resetForm}>Reset</button>
            <button className={`${primaryBtn} w-auto min-w-[180px]`} type="submit" disabled={isGenerating || isCasesLoading}>{isGenerating ? "Generating..." : "Generate report"}</button>
          </div>
        </form>
      </section>
    </main>
  );
}
