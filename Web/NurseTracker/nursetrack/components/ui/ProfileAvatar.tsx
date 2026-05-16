import React from "react";

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function ProfileAvatar({ name, imageUrl, size = 42, className = "" }: { name?: string; imageUrl?: string; size?: number; className?: string }) {
  const style = { width: size, height: size };
  if (imageUrl) return <img src={imageUrl} alt={name || "Profile"} style={style} className={`shrink-0 rounded-full object-cover border border-[#e2e8f0] ${className}`} />;
  return <div style={style} className={`shrink-0 rounded-full flex items-center justify-center !font-extrabold bg-[#ffcf01] !text-[#332800] ${size <= 38 ? "!text-[0.75rem]" : "!text-[0.9rem]"} ${className}`}>{getInitials(name)}</div>;
}
