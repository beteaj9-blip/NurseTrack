"use client";

import React from "react";
import Link from "next/link";

export default function AddClinicalCaseContent() {
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
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            
            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Case Date</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select case date</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Time of Shift</label>
              <input 
                type="text" 
                placeholder="Select a case date first" 
                disabled
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#64748b] font-medium bg-[#f8fafc] focus:outline-none cursor-not-allowed shadow-sm text-[0.9rem]"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Patient Name</label>
              <input 
                type="text" 
                placeholder="Enter patient initials only" 
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Category</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select category</option>
                <option value="major-assist">Major Case - Assist</option>
                <option value="major-circulate">Major Case - Circulate</option>
                <option value="handled">Handled Case</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Procedure Performed</label>
              <input 
                type="text" 
                placeholder="Enter procedure performed" 
                className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8]"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Name of Hospital</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select hospital</option>
                <option value="ccmc">CCMC</option>
                <option value="vsmmc">VSMMC</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Supervising Clinical Instructor</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select supervising CI</option>
                <option value="jane-doe">Jane Doe</option>
                <option value="john-smith">John Smith</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Duty Area</label>
              <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] cursor-pointer shadow-sm text-[0.9rem]" defaultValue="">
                <option value="" disabled hidden>Select duty area</option>
                <option value="delivery-room">Delivery Room</option>
                <option value="operating-room">Operating Room</option>
              </select>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Student Reflection</label>
              <textarea 
                placeholder="Enter student reflection" 
                rows={4}
                className="w-full p-3 border border-[#dbe3ee] rounded-lg text-[#111827] font-medium bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] shadow-sm text-[0.9rem] placeholder:text-[#94a3b8] resize-y"
              ></textarea>
            </div>

          </div>

          {/* Footer Notice */}
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4 mb-6">
            <p className="text-[#64748b] text-[0.85rem] font-semibold m-0">Complete the required case information before submitting.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button 
              type="button" 
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
