"use client";
import React from "react";
import { SearchIcon, ThemeMoonIcon, ThemeSunIcon, SettingsGearIcon, SupportHeartIcon } from "@/components/shared/icons";
import { motion } from "framer-motion";
import { TextAlignJustify, X } from "lucide-react";
import { useSettings } from "@/components/context/SettingsContext";


/* ================= Icon Button ================= */
const IconButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) => {
  return (
    <div className="relative group flex flex-col items-center">
      <button
        onClick={onClick}
        className={`
          cursor-pointer
          flex size-[34px] min-w-[34px]
          items-center justify-center
          rounded-full
          bg-[var(--surface-secondary)]
          text-[var(--primary-green)]
          transition-all duration-300 ease-out
          hover:scale-105 active:scale-90
          [&>svg]:size-[18px]
          ${label=='Settings' ? "xl:hidden" : ""}  
        `}
      >
        {icon}
      </button>

      <span
        className={`
          pointer-events-none
          absolute top-full mt-2
          whitespace-nowrap
          rounded-md
          bg-[var(--bg-surface)] text-[var(--text-primary)] text-[12px]
          px-3 py-1
          opacity-0 scale-95
          transition-all duration-200
          group-hover:opacity-100 group-hover:scale-100
          ${label=='Settings' ? "xl:hidden" : ""}  
        `}
      >
        {label}
      </span>
    </div>
  );
};
/* ================= Navbar ================= */
export const Navbar = ({
  onMenuClick,
  isDrawerOpen,
  onSearchClick,
  isVisible = true,
}: {
  onMenuClick?: () => void;
  isDrawerOpen?: boolean;
  onSearchClick?: () => void;
  isVisible?: boolean;
}) => {
  const { isMobileSettingsOpen, setIsMobileSettingsOpen, toggleDarkMode, isDarkMode } = useSettings();

  const items = [
    { label: "Search", icon: <SearchIcon />, onClick: onSearchClick },
    { label: isDarkMode ? "Light Mode" : "Dark Mode", icon: isDarkMode ? <ThemeSunIcon /> : <ThemeMoonIcon />, onClick: toggleDarkMode },
    { 
      label: "Settings", 
      icon: <SettingsGearIcon />, 
      onClick: () => {
        setIsMobileSettingsOpen(true);
      } 
    },
  ];

  return (
    <nav
      className={`
        sticky top-0 z-50
        flex h-[60px] w-full
        items-center justify-between
        border-b border-[var(--border)]/10
        bg-[var(--surface)]
        px-6 py-2
        transition-all duration-300
        ${isVisible ? "translate-y-0 mt-0" : "-translate-y-full -mt-[60px]"}
      `}
    >
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="relative z-50 flex size-[34px] items-center justify-center rounded-full bg-[var(--surface-secondary)] text-[var(--primary-green)] transition-all duration-300 hover:scale-105 active:scale-90 lg:hidden"
          aria-label="Toggle surah drawer"
        >
          <div className="flex size-[18px] flex-col items-center justify-center gap-[3px]">
            <motion.span
              animate={isDrawerOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="h-[2px] w-full rounded-full bg-current"
            />
            <motion.span
              animate={isDrawerOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="h-[2px] w-full rounded-full bg-current"
            />
            <motion.span
              animate={isDrawerOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="h-[2px] w-full rounded-full bg-current"
            />
          </div>
        </button>
        <div className="leading-tight">
          <p className="text-base font-bold md:text-lg text-[var(--text-primary)]">
            Quran Mazid
          </p>
          <p className="text-[10px] text-[var(--text-secondary)] max-md:hidden">
            Read, Study, and Learn The Quran
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {items.map((item, i) => (
          <IconButton key={i} label={item.label} icon={item.icon} onClick={item.onClick} />
        ))}

        <a
          href="#"
          className="
            cursor-pointer
            flex h-[36px] items-center gap-2
            rounded-full px-4
            bg-[var(--primary-green)]
            text-white text-sm font-medium
            transition-all duration-300
            hover:opacity-90 active:scale-95
            max-lg:hidden
          "
        >
          Support Us <SupportHeartIcon />
        </a>
      </div>
    </nav>
  );
};
