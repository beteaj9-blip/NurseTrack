import React from 'react';

export default function NotificationsContent() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-[1.2rem] font-[800] text-[#111827] m-0">Recent Notifications</h2>
          <div className="flex items-center gap-3">
            <button className="h-[40px] px-4 rounded-lg border border-[#dbe3ee] bg-white text-[#344054] text-[0.92rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] hover:-translate-y-px transition-all">
              Mark all as read
            </button>
            <button className="h-[40px] px-4 rounded-lg border border-[#dbe3ee] bg-white text-[#344054] text-[0.92rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] hover:-translate-y-px transition-all">
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Type</label>
            <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] appearance-none" defaultValue="Validation">
              <option value="Validation">Validation</option>
              <option value="System">System</option>
              <option value="Update">Update</option>
            </select>
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Status</label>
            <select className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] appearance-none" defaultValue="Unread">
              <option value="Unread">Unread</option>
              <option value="Read">Read</option>
              <option value="All">All</option>
            </select>
          </div>
          <div>
            <label className="block text-[0.85rem] font-bold text-[#344054] mb-2">Search</label>
            <input 
              type="search" 
              placeholder="Search notification"
              className="w-full h-[42px] px-3 border border-[#dbe3ee] rounded-lg text-[#111827] bg-white focus:outline-none focus:ring-2 focus:ring-[#FFCF01]/50 focus:border-[#FFCF01] placeholder:text-[#94a3b8]"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex flex-col gap-4 mb-6">
          
          {/* Unread Notification Item */}
          <div className="border border-[#FFCF01] bg-[#FFCF01]/5 rounded-lg p-5 transition-all hover:bg-[#FFCF01]/10">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="pt-1.5 flex-none">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FFCF01] shadow-[0_0_8px_rgba(255,207,1,0.6)]"></div>
                </div>
                <div>
                  <h3 className="text-[1rem] font-[800] text-[#111827] m-0 mb-1">Duty Entry Verified</h3>
                  <p className="text-[#475467] text-[0.92rem] m-0 mb-4">Your Emergency Room duty record was verified and added to your progress.</p>
                  <p className="text-[#64748b] text-[0.85rem] font-semibold m-0">Apr 25, 2026 - 3:18 PM</p>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between self-stretch gap-4">
                <button className="h-[36px] px-3 rounded-md border border-[#dbe3ee] bg-white text-[#344054] text-[0.85rem] font-bold hover:bg-[#f8fafc] hover:border-[#cbd5e1] hover:text-[#0f172a] transition-all">
                  Mark read
                </button>
                <a href="#" className="text-[#8A252C] text-[0.92rem] font-[800] hover:text-[#681920] underline-offset-2 hover:underline">
                  View progress
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-[#e5eaf1] pt-4 mt-2">
          <p className="text-[#64748b] text-[0.85rem] m-0">Showing 1 notification.</p>
        </div>

      </div>
    </div>
  );
}
