"use client";

import React, { useMemo, useState } from "react";
import { InlineSelect } from "@/components/ui/InlineSelect";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useAddHospitalWard, useCreateHospital, useDeleteHospital, useHospitals, useUpdateHospital } from "@/core/api/hooks/useHospitals";

type Hospital = {
  id: number;
  name: string;
  fullName?: string;
  label?: string;
  address?: string;
  active?: boolean | number | string | null;
  wards?: string[];
  inactiveWards?: string[];
};

type DutyArea = {
  name: string;
  hospitalId: number;
  hospital: string;
  active: boolean;
};

type StatusFilter = "all" | "active" | "deactivated";

const isActive = (value?: boolean | number | string | null) => value === undefined || value === null || value === true || value === 1 || String(value).toLowerCase() === "true" || value === "1";

const statusBadge = (active: boolean) => active
  ? "bg-[#e9f8ef] !text-[#078033]"
  : "bg-[#fef2f2] !text-[#b42318]";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "deactivated", label: "Deactivated" },
];

const hospitalPayload = (code: string, fullName: string, wards: string[] = [], address = "", active = true, inactiveWards: string[] = []) => ({
  name: code.trim().toUpperCase(),
  fullName: fullName.trim(),
  label: `${code.trim().toUpperCase()} - ${fullName.trim()}`,
  address: address || fullName.trim(),
  active,
  wards,
  inactiveWards,
});

const normalizedName = (value?: string) => (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

const hasHospitalDuplicate = (hospitals: Hospital[], code: string, fullName: string, ignoreId?: number) => {
  const normalizedCode = normalizedName(code);
  const normalizedFullName = normalizedName(fullName);
  return hospitals.some(hospital => hospital.id !== ignoreId && ((normalizedCode && normalizedName(hospital.name) === normalizedCode) || (normalizedFullName && normalizedName(hospital.fullName) === normalizedFullName)));
};

const hasDutyAreaDuplicate = (hospital: Hospital, areaName: string, ignoreArea?: DutyArea | null) => {
  const normalizedArea = normalizedName(areaName);
  return [...(hospital.wards ?? []), ...(hospital.inactiveWards ?? [])].some(ward => {
    const isCurrentArea = ignoreArea && hospital.id === ignoreArea.hospitalId && normalizedName(ward) === normalizedName(ignoreArea.name);
    return !isCurrentArea && normalizedName(ward) === normalizedArea;
  });
};

const errorMessage = (error: unknown, fallback: string) => {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
};

const PER_PAGE = 5;

export function HospitalsDutyAreasContent() {
  const { data: hospitalData = [], isLoading } = useHospitals();
  const createHospital = useCreateHospital();
  const updateHospital = useUpdateHospital();
  const addHospitalWard = useAddHospitalWard();
  const deleteHospital = useDeleteHospital();
  const { showToast } = useToast();
  const hospitals = hospitalData as Hospital[];

  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [editingDutyArea, setEditingDutyArea] = useState<DutyArea | null>(null);
  const [message, setMessage] = useState("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [dutyAreaSearch, setDutyAreaSearch] = useState("");
  const [hospitalStatus, setHospitalStatus] = useState<StatusFilter>("all");
  const [dutyAreaStatus, setDutyAreaStatus] = useState<StatusFilter>("all");
  const [dutyAreaHospitalFilter, setDutyAreaHospitalFilter] = useState("all");
  const [newDutyHospitalId, setNewDutyHospitalId] = useState("");
  const [editDutyHospitalId, setEditDutyHospitalId] = useState("");
  const [hospitalPage, setHospitalPage] = useState(1);
  const [dutyAreaPage, setDutyAreaPage] = useState(1);

  const activeHospitals = useMemo(() => hospitals.filter(hospital => isActive(hospital.active)), [hospitals]);
  const hospitalOptions = useMemo(() => hospitals.map(hospital => ({ value: String(hospital.id), label: `${hospital.name}${isActive(hospital.active) ? "" : " (Deactivated)"}` })), [hospitals]);
  const dutyAreaHospitalOptions = useMemo(() => [{ value: "all", label: "All hospitals" }, ...hospitalOptions], [hospitalOptions]);
  const editHospitalOptions = useMemo(() => {
    const options = [...hospitalOptions];
    if (editingDutyArea && !options.some(option => option.value === String(editingDutyArea.hospitalId))) {
      const current = hospitals.find(hospital => hospital.id === editingDutyArea.hospitalId);
      if (current) options.unshift({ value: String(current.id), label: current.name });
    }
    return options;
  }, [editingDutyArea, hospitalOptions, hospitals]);
  const dutyAreas = useMemo<DutyArea[]>(() => hospitals.flatMap(hospital => [
    ...(hospital.wards ?? []).map(name => ({ name, hospitalId: hospital.id, hospital: hospital.name, active: isActive(hospital.active) })),
    ...(hospital.inactiveWards ?? []).map(name => ({ name, hospitalId: hospital.id, hospital: hospital.name, active: false })),
  ]), [hospitals]);
  const filteredHospitals = useMemo(() => {
    const query = hospitalSearch.trim().toLowerCase();
    return hospitals.filter(hospital => {
      const matchesSearch = !query || `${hospital.name} ${hospital.fullName ?? ""} ${hospital.label ?? ""}`.toLowerCase().includes(query);
      const active = isActive(hospital.active);
      const matchesStatus = hospitalStatus === "all" || (hospitalStatus === "active" ? active : !active);
      return matchesSearch && matchesStatus;
    });
  }, [hospitalSearch, hospitals, hospitalStatus]);
  const filteredDutyAreas = useMemo(() => {
    const query = dutyAreaSearch.trim().toLowerCase();
    return dutyAreas.filter(area => {
      const matchesSearch = !query || `${area.name} ${area.hospital}`.toLowerCase().includes(query);
      const matchesStatus = dutyAreaStatus === "all" || (dutyAreaStatus === "active" ? area.active : !area.active);
      const matchesHospital = dutyAreaHospitalFilter === "all" || String(area.hospitalId) === dutyAreaHospitalFilter;
      return matchesSearch && matchesStatus && matchesHospital;
    });
  }, [dutyAreaHospitalFilter, dutyAreaSearch, dutyAreas, dutyAreaStatus]);
  const hospitalTotalPages = Math.max(1, Math.ceil(filteredHospitals.length / PER_PAGE));
  const dutyAreaTotalPages = Math.max(1, Math.ceil(filteredDutyAreas.length / PER_PAGE));
  const pagedHospitals = filteredHospitals.slice((hospitalPage - 1) * PER_PAGE, hospitalPage * PER_PAGE);
  const pagedDutyAreas = filteredDutyAreas.slice((dutyAreaPage - 1) * PER_PAGE, dutyAreaPage * PER_PAGE);

  React.useEffect(() => {
    setHospitalPage(page => Math.min(page, hospitalTotalPages));
  }, [hospitalTotalPages]);

  React.useEffect(() => {
    setDutyAreaPage(page => Math.min(page, dutyAreaTotalPages));
  }, [dutyAreaTotalPages]);

  React.useEffect(() => {
    if (!newDutyHospitalId && hospitals.length) setNewDutyHospitalId(String(hospitals[0].id));
    if (newDutyHospitalId && !hospitals.some(hospital => String(hospital.id) === newDutyHospitalId)) setNewDutyHospitalId(hospitals[0] ? String(hospitals[0].id) : "");
  }, [hospitals, newDutyHospitalId]);

  const handleAddHospital = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const hospitalName = String(form.get("hospitalName") ?? "");
    const hospitalCode = String(form.get("hospitalCode") ?? "");
    if (hasHospitalDuplicate(hospitals, hospitalCode, hospitalName)) {
      showToast({ variant: "error", title: "Duplicate hospital", message: "A hospital with the same code or name already exists." });
      return;
    }
    try {
      await createHospital.mutateAsync(hospitalPayload(hospitalCode, hospitalName, [], "", true));
      formElement.reset();
      setMessage("Hospital saved.");
      showToast({ variant: "success", title: "Hospital added", message: "Hospital record was saved." });
    } catch (error) {
      showToast({ variant: "error", title: "Save failed", message: errorMessage(error, "Hospital record could not be saved.") });
    }
  };

  const handleAddDutyArea = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const hospital = hospitals.find(item => item.id === Number(newDutyHospitalId));
    const areaName = String(form.get("dutyAreaName") ?? "").trim();
    if (!hospital || !areaName) return;
    if (hasDutyAreaDuplicate(hospital, areaName)) {
      showToast({ variant: "error", title: "Duplicate duty area", message: "This duty area already exists for the selected hospital." });
      return;
    }
    try {
      await addHospitalWard.mutateAsync({ hospitalId: hospital.id, name: areaName });
      formElement.reset();
      setMessage("Duty area saved to the selected hospital.");
      showToast({ variant: "success", title: "Duty area added", message: "Duty area was saved to the hospital." });
    } catch (error) {
      showToast({ variant: "error", title: "Save failed", message: errorMessage(error, "Duty area could not be saved.") });
    }
  };

  const handleEdit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      if (editingHospital) {
        const fullName = String(form.get("name") ?? "");
        const code = String(form.get("code") ?? "");
        if (hasHospitalDuplicate(hospitals, code, fullName, editingHospital.id)) {
          showToast({ variant: "error", title: "Duplicate hospital", message: "A hospital with the same code or name already exists." });
          return;
        }
        await updateHospital.mutateAsync({ id: editingHospital.id, updates: hospitalPayload(code, fullName, editingHospital.wards ?? [], editingHospital.address ?? "", isActive(editingHospital.active), editingHospital.inactiveWards ?? []) });
        setMessage("Hospital updated.");
        showToast({ variant: "success", title: "Hospital updated", message: "Hospital changes were saved." });
      }
      if (editingDutyArea) {
        const source = hospitals.find(hospital => hospital.id === editingDutyArea.hospitalId);
        const target = hospitals.find(hospital => hospital.id === Number(editDutyHospitalId));
        const newName = String(form.get("name") ?? "").trim();
        if (source && target && newName) {
          if (hasDutyAreaDuplicate(target, newName, editingDutyArea)) {
            showToast({ variant: "error", title: "Duplicate duty area", message: "This duty area already exists for the selected hospital." });
            return;
          }
          const sourceActive = editingDutyArea.active;
          const sourceWards = (source.wards ?? []).filter(ward => ward !== editingDutyArea.name);
          const sourceInactiveWards = (source.inactiveWards ?? []).filter(ward => ward !== editingDutyArea.name);
          if (source.id !== target.id) {
            await updateHospital.mutateAsync({ id: source.id, updates: { ...source, wards: sourceWards, inactiveWards: sourceInactiveWards } });
            await updateHospital.mutateAsync({ id: target.id, updates: { ...target, wards: sourceActive ? Array.from(new Set([...(target.wards ?? []), newName])) : (target.wards ?? []), inactiveWards: sourceActive ? (target.inactiveWards ?? []) : Array.from(new Set([...(target.inactiveWards ?? []), newName])) } });
          } else {
            await updateHospital.mutateAsync({ id: source.id, updates: { ...source, wards: sourceActive ? Array.from(new Set([...sourceWards, newName])) : sourceWards, inactiveWards: sourceActive ? sourceInactiveWards : Array.from(new Set([...sourceInactiveWards, newName])) } });
          }
          setMessage("Duty area updated.");
          showToast({ variant: "success", title: "Duty area updated", message: "Duty area changes were saved." });
        }
      }
      setEditingHospital(null);
      setEditingDutyArea(null);
    } catch {
      showToast({ variant: "error", title: "Update failed", message: "Location changes could not be saved." });
    }
  };

  const handleDeactivate = async () => {
    try {
      if (editingHospital) {
        if (isActive(editingHospital.active)) {
          await deleteHospital.mutateAsync(editingHospital.id);
          setMessage("Hospital deactivated.");
          showToast({ variant: "success", title: "Hospital deactivated", message: "Hospital was removed from the active list." });
        } else {
          await updateHospital.mutateAsync({ id: editingHospital.id, updates: { ...editingHospital, active: true } });
          setMessage("Hospital reactivated.");
          showToast({ variant: "success", title: "Hospital reactivated", message: "Hospital is active again." });
        }
      }
      if (editingDutyArea) {
        const hospital = hospitals.find(item => item.id === editingDutyArea.hospitalId);
        if (hospital) {
          const activeWards = editingDutyArea.active
            ? (hospital.wards ?? []).filter(ward => ward !== editingDutyArea.name)
            : Array.from(new Set([...(hospital.wards ?? []), editingDutyArea.name]));
          const inactiveWards = editingDutyArea.active
            ? Array.from(new Set([...(hospital.inactiveWards ?? []), editingDutyArea.name]))
            : (hospital.inactiveWards ?? []).filter(ward => ward !== editingDutyArea.name);
          await updateHospital.mutateAsync({ id: hospital.id, updates: { ...hospital, wards: activeWards, inactiveWards } });
          setMessage(editingDutyArea.active ? "Duty area deactivated." : "Duty area reactivated.");
          showToast({ variant: "success", title: editingDutyArea.active ? "Duty area deactivated" : "Duty area reactivated", message: editingDutyArea.active ? "Duty area was removed from active selections." : "Duty area is active again." });
        }
      }
      setEditingHospital(null);
      setEditingDutyArea(null);
    } catch {
      showToast({ variant: "error", title: "Deactivate failed", message: "Location could not be deactivated." });
    }
  };

  const inputClass = "min-h-[48px] px-3 py-2 border border-[#d0d5dd] rounded-lg bg-white !text-[#111827] !font-medium focus:ring-2 focus:ring-[#8A252C]/20 focus:border-[#8A252C] outline-none transition-all";
  const ghostBtn = "min-h-[40px] px-5 rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-extrabold hover:bg-[#f8fafc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer";

  return (
    <>
      <main className="min-w-0 overflow-x-hidden p-[clamp(24px,4vw,42px)] content-start grid gap-6 w-full">
        <section className="grid min-w-0 grid-cols-1 gap-6 items-stretch min-[1280px]:grid-cols-2">
          <article className="min-w-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap"><div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Hospital Record</h2></div><span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Required</span></div>
            <form className="grid min-w-0 grid-cols-2 gap-4 gap-y-5 items-start flex-1 max-[720px]:grid-cols-1" onSubmit={handleAddHospital}>
              <label className="min-w-0 flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="hospital-name">Hospital Name<input className={inputClass} id="hospital-name" name="hospitalName" type="text" placeholder="Enter Hospital Name" required /></label>
              <label className="min-w-0 flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="hospital-code">Short Code<input className={inputClass} id="hospital-code" name="hospitalCode" type="text" placeholder="Enter Short Code" required /></label>
              <div className="col-span-full grid min-w-0 grid-cols-2 gap-4 items-center mt-[0.15rem] max-[720px]:grid-cols-1"><div className="min-w-0 w-full min-h-[56px] flex items-center m-0 p-[0.9rem_1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg !text-[#4c5d7d] !text-sm !font-bold" role="status">Add a hospital that can be used in schedules and duty assignments.</div><div className="min-w-0 flex justify-end items-center"><button className="inline-flex items-center justify-center w-full min-h-[50px] px-[30px] whitespace-nowrap rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60" type="submit" disabled={createHospital.isPending}>Add Hospital</button></div></div>
            </form>
          </article>

          <article className="min-w-0 mt-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)] flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap"><div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Area Record</h2></div><span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#fff6cc] !text-[#6c4c00]">Required</span></div>
            <form className="grid min-w-0 grid-cols-2 gap-4 gap-y-5 items-start flex-1 max-[720px]:grid-cols-1" onSubmit={handleAddDutyArea}>
              <label className="min-w-0 flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="duty-area-name">Duty Area<input className={inputClass} id="duty-area-name" name="dutyAreaName" type="text" placeholder="Enter Duty Area" required /></label>
              <label className="min-w-0 flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="duty-area-hospital">Hospital<InlineSelect value={newDutyHospitalId} options={hospitalOptions} placeholder="Select hospital" onChange={setNewDutyHospitalId} /></label>
              <div className="col-span-full grid min-w-0 grid-cols-2 gap-4 items-center mt-[0.15rem] max-[720px]:grid-cols-1"><div className="min-w-0 w-full min-h-[56px] flex items-center m-0 p-[0.9rem_1rem] bg-[#f8fafc] border border-[#e2e8f0] rounded-lg !text-[#4c5d7d] !text-sm !font-bold" role="status">Save appends this ward to the hospital record.</div><div className="min-w-0 flex justify-end items-center"><button className="inline-flex items-center justify-center w-full min-h-[50px] px-[30px] whitespace-nowrap rounded-[10px] bg-[#8A252C] !text-white !text-[0.95rem] !font-extrabold shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer disabled:opacity-60" type="submit" disabled={addHospitalWard.isPending || !hospitals.length}>Add Duty Area</button></div></div>
            </form>
          </article>
        </section>

        <section className="min-w-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]"><div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap"><div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Hospital List</h2></div>{isLoading ? <span className="h-[26px] w-20 animate-pulse rounded-full bg-[#f1f5f9]" aria-hidden="true" /> : <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#078033]">{activeHospitals.length} active</span>}</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3 mb-4"><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="hospital-list-search">Search Hospitals<input className={inputClass} id="hospital-list-search" type="search" placeholder="Search hospital name or code" value={hospitalSearch} onChange={(event) => { setHospitalSearch(event.target.value); setHospitalPage(1); }} /></label><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Status Filter<InlineSelect value={hospitalStatus} options={statusOptions} placeholder="All" onChange={(value) => { setHospitalStatus(value as StatusFilter); setHospitalPage(1); }} /></label></div>
          <div className="min-w-0 w-full overflow-x-auto overflow-y-hidden border border-[#dbe3ee] rounded-xl"><div className="grid grid-cols-[minmax(260px,1fr)_minmax(120px,180px)_minmax(130px,170px)_110px] items-center gap-4 w-full min-w-[760px] p-[1rem_1.25rem] bg-[#f8fafc] border-b border-[#dbe3ee]"><span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Hospital</span><span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Code</span><span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Status</span><span className="justify-self-end whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Action</span></div>
            {isLoading ? <LoadingState message="Loading hospitals..." className="min-w-[760px]" /> : pagedHospitals.map(hospital => <div className="grid grid-cols-[minmax(260px,1fr)_minmax(120px,180px)_minmax(130px,170px)_110px] items-center gap-4 w-full min-w-[760px] p-[1rem_1.25rem] border-b border-[#e5eaf1] last:border-b-0" key={hospital.id}><span className="min-w-0 whitespace-nowrap !text-[#111827] !text-sm"><strong className="!font-[800] whitespace-nowrap">{hospital.fullName || hospital.name}</strong></span><span className="min-w-0 whitespace-nowrap !text-[#4c5d7d] !text-sm !font-semibold">{hospital.name}</span><span className={`w-fit rounded-full px-3 py-1 !text-[0.76rem] !font-extrabold ${statusBadge(isActive(hospital.active))}`}>{isActive(hospital.active) ? "Active" : "Deactivated"}</span><span className="justify-self-end whitespace-nowrap"><button className="flex items-center justify-center w-[88px] min-w-[88px] min-h-[42px] px-[18px] whitespace-nowrap rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => setEditingHospital(hospital)}>Edit</button></span></div>)}
            {!isLoading && !pagedHospitals.length && <div className="p-5 text-center !text-[#64748b] !text-sm !font-bold">No hospitals match your search.</div>}
          </div>
          {hospitalTotalPages > 1 && <div className="flex justify-between items-center p-[1rem_1.5rem] gap-2 border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]"><button className={ghostBtn} onClick={() => setHospitalPage(page => Math.max(1, page - 1))} disabled={hospitalPage === 1}>Previous</button><span className="!text-[0.875rem] !font-[600] !text-[#64748b] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{hospitalPage} of {hospitalTotalPages}</span><button className={ghostBtn} onClick={() => setHospitalPage(page => Math.min(hospitalTotalPages, page + 1))} disabled={hospitalPage === hospitalTotalPages}>Next</button></div>}
        </section>

        <section className="min-w-0 p-[1.45rem] rounded-lg border border-[#e2e8f0] bg-white shadow-[0_16px_44px_rgba(32,33,36,0.07)]"><div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e5eaf1] flex-wrap"><div><h2 className="m-0 !text-[#111827] !text-[1.25rem] leading-[1.15] !font-bold">Duty Area List</h2></div>{isLoading ? <span className="h-[26px] w-20 animate-pulse rounded-full bg-[#f1f5f9]" aria-hidden="true" /> : <span className="inline-flex items-center px-[10px] py-[4px] rounded-full !text-[0.76rem] !font-extrabold whitespace-nowrap bg-[#e9f8ef] !text-[#078033]">{dutyAreas.filter(area => area.active).length} active</span>}</div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-3 mb-4"><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="duty-area-list-search">Search Duty Areas<input className={inputClass} id="duty-area-list-search" type="search" placeholder="Search duty area or hospital" value={dutyAreaSearch} onChange={(event) => { setDutyAreaSearch(event.target.value); setDutyAreaPage(1); }} /></label><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Hospital Filter<InlineSelect value={dutyAreaHospitalFilter} options={dutyAreaHospitalOptions} placeholder="All hospitals" onChange={(value) => { setDutyAreaHospitalFilter(value); setDutyAreaPage(1); }} /></label><label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]">Status Filter<InlineSelect value={dutyAreaStatus} options={statusOptions} placeholder="All" onChange={(value) => { setDutyAreaStatus(value as StatusFilter); setDutyAreaPage(1); }} /></label></div>
          <div className="min-w-0 w-full overflow-x-auto overflow-y-hidden border border-[#dbe3ee] rounded-xl"><div className="grid grid-cols-[minmax(260px,1fr)_minmax(120px,180px)_minmax(130px,170px)_110px] items-center gap-4 w-full min-w-[760px] p-[1rem_1.25rem] bg-[#f8fafc] border-b border-[#dbe3ee]"><span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Duty Area</span><span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Hospital</span><span className="min-w-0 whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Status</span><span className="justify-self-end whitespace-nowrap !text-[#0b1b3a] !text-[0.85rem] !font-extrabold uppercase">Action</span></div>
            {isLoading ? <LoadingState message="Loading duty areas..." className="min-w-[760px]" /> : pagedDutyAreas.map(area => <div className="grid grid-cols-[minmax(260px,1fr)_minmax(120px,180px)_minmax(130px,170px)_110px] items-center gap-4 w-full min-w-[760px] p-[1rem_1.25rem] border-b border-[#e5eaf1] last:border-b-0" key={`${area.hospitalId}-${area.name}-${area.active ? "active" : "inactive"}`}><span className="min-w-0 whitespace-nowrap !text-[#111827] !text-sm"><strong className="!font-[800] whitespace-nowrap">{area.name}</strong></span><span className="min-w-0 whitespace-nowrap !text-[#4c5d7d] !text-sm !font-semibold">{area.hospital}</span><span className={`w-fit rounded-full px-3 py-1 !text-[0.76rem] !font-extrabold ${statusBadge(area.active)}`}>{area.active ? "Active" : "Deactivated"}</span><span className="justify-self-end whitespace-nowrap"><button className="flex items-center justify-center w-[88px] min-w-[88px] min-h-[42px] px-[18px] whitespace-nowrap rounded-lg bg-white border border-[#e2e8f0] !text-[#334155] !text-sm !font-bold hover:bg-[#f8fafc] transition-colors cursor-pointer" type="button" onClick={() => { setEditingDutyArea(area); setEditDutyHospitalId(String(area.hospitalId)); }}>Edit</button></span></div>)}
            {!isLoading && !pagedDutyAreas.length && <div className="p-5 text-center !text-[#64748b] !text-sm !font-bold">No duty areas match your search.</div>}
          </div>
          {dutyAreaTotalPages > 1 && <div className="flex justify-between items-center p-[1rem_1.5rem] gap-2 border border-[#e2e8f0] border-t-0 rounded-b-lg bg-[#f8fafc]"><button className={ghostBtn} onClick={() => setDutyAreaPage(page => Math.max(1, page - 1))} disabled={dutyAreaPage === 1}>Previous</button><span className="!text-[0.875rem] !font-[600] !text-[#64748b] whitespace-nowrap"><span className="hidden sm:inline">Page </span>{dutyAreaPage} of {dutyAreaTotalPages}</span><button className={ghostBtn} onClick={() => setDutyAreaPage(page => Math.min(dutyAreaTotalPages, page + 1))} disabled={dutyAreaPage === dutyAreaTotalPages}>Next</button></div>}
        </section>

        {message && <div className="flex items-center min-h-[48px] px-4 rounded-lg bg-[#e9f8ef] !text-[#078033] !text-sm !font-bold border border-[#bbf7d0]" role="status" aria-live="polite">{message}</div>}
      </main>

      {(editingHospital || editingDutyArea) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-[1.25rem] bg-[#0f172a]/[0.45]">
          <section className="w-[min(620px,calc(100vw-2rem))] p-0 overflow-hidden rounded-lg bg-white shadow-[0_26px_68px_rgba(15,23,42,0.24)]" role="dialog" aria-modal="true" aria-labelledby="edit-location-title">
            <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-4 items-start p-[1.65rem_1.75rem_1.1rem] border-b border-[#e5eaf1] bg-white"><div className="min-w-0"><h2 className="m-0 !text-[#111827] !text-[1.45rem] leading-[1.2] !font-bold" id="edit-location-title">{editingHospital ? "Edit Hospital" : "Edit Duty Area"}</h2><p className="mt-[0.45rem] mb-0 !text-[#4c5d7d] !text-[0.95rem] !font-bold leading-[1.45]">{editingHospital ? "Rename the hospital or update the short code." : "Rename the duty area or update its hospital."}</p></div><button className="relative grid place-items-center w-[48px] h-[48px] min-w-[48px] border border-[#dbe3ee] rounded-lg bg-white !text-[#0f1b33] cursor-pointer transition-all hover:border-[#8a252c] hover:!text-[#8a252c] before:absolute before:content-[''] before:w-[15px] before:h-[2px] before:rounded-full before:bg-current before:rotate-45 after:absolute after:content-[''] after:w-[15px] after:h-[2px] after:rounded-full after:bg-current after:-rotate-45" type="button" aria-label="Close modal" onClick={() => { setEditingHospital(null); setEditingDutyArea(null); }} /></div>
            <form className="grid grid-cols-2 gap-4 gap-y-[1.15rem] p-[1.4rem_1.75rem_1.25rem] max-[780px]:grid-cols-1" id="edit-location-form" onSubmit={handleEdit}>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="edit-location-name"><span>{editingHospital ? "Hospital Name" : "Duty Area"}</span><input className={inputClass} id="edit-location-name" name="name" type="text" defaultValue={editingHospital ? editingHospital.fullName || editingHospital.name : editingDutyArea?.name} required /></label>
              <label className="flex flex-col gap-1.5 m-0 !text-sm !font-bold !text-[#344054]" htmlFor="edit-location-code"><span>{editingHospital ? "Short Code" : "Hospital"}</span>{editingHospital ? <input className={inputClass} id="edit-location-code" name="code" type="text" defaultValue={editingHospital.name} required /> : <InlineSelect value={editDutyHospitalId} options={editHospitalOptions} placeholder="Select hospital" onChange={setEditDutyHospitalId} />}</label>
            </form>
            <div className="flex items-center justify-end gap-4 p-[1.25rem_1.75rem_1.65rem] border-t border-[#e5eaf1] bg-[#f8fafc] max-[780px]:flex-col max-[780px]:items-stretch"><button className="inline-flex items-center justify-center w-auto min-w-[150px] min-h-[50px] px-[26px] rounded-xl !text-[0.95rem] !font-extrabold whitespace-nowrap bg-white border border-[#8a252c]/32 !text-[#8a252c] hover:border-[#8a252c]/55 hover:bg-[#fff5f5] transition-colors cursor-pointer max-[780px]:w-full max-[780px]:min-w-0" type="button" onClick={handleDeactivate}>{(editingHospital && !isActive(editingHospital.active)) || (editingDutyArea && !editingDutyArea.active) ? "Reactivate" : "Deactivate"}</button><button className="inline-flex items-center justify-center w-auto min-w-[150px] min-h-[50px] px-[26px] rounded-xl !text-[0.95rem] !font-extrabold whitespace-nowrap bg-[#8A252C] !text-white shadow-[0_10px_22px_rgba(138,37,44,0.18)] hover:bg-[#6d1d23] hover:shadow-[0_16px_34px_rgba(138,37,44,0.22)] transition-all cursor-pointer max-[780px]:w-full max-[780px]:min-w-0" type="submit" form="edit-location-form">Save Changes</button></div>
          </section>
        </div>
      )}
    </>
  );
}
