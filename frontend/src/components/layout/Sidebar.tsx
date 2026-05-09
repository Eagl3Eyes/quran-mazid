"use client";
import Link from "next/link";
import React from "react";
import { LogoIcon, HomeIcon, DashboardIcon, ExploreIcon, BookmarkIcon, MenuIcon } from "@/components/shared/icons";

/* ================= Button ================= */
const ShowButton = ({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) => {
  return (
    <button
      className={`
        group
        flex size-6 items-center justify-center rounded-xl
        cursor-pointer
        transition-all duration-300 ease-out
        [&_svg]:size-[24px]

        ${
          active
            ? "text-[var(--text-green)] border-(--primary-green)/40 bg-(--primary-green)/10"
            : "text-[var(--text-secondary)] border-transparent hover:text-[var(--primary-green)] hover:border-(--primary-green)/20"
        }
      `}
    >
      {children}
    </button>
  );
};

/* ================= Sidebar ================= */
export const Sidebar = () => {
  return (
    <aside className="fixed left-0 z-50 flex bg-[var(--surface-secondary)] 
      max-lg:bottom-0 max-lg:h-16 max-lg:w-full
      lg:top-0 lg:h-screen lg:w-15 lg:flex-col">

      <div className="flex h-full w-full items-center max-lg:flex-row max-lg:justify-evenly lg:flex-col lg:justify-center relative">
        <div className="hidden lg:flex absolute top-0 py-4 w-full justify-center">
          <Link href="/"><LogoIcon /></Link>
        </div>

        <nav className="flex items-center lg:flex-col lg:gap-8 max-lg:gap-10">
            <div className="flex items-center gap-2.5 max-lg:hidden">
          <Link href="/" className="cursor-pointer"><ShowButton><HomeIcon/></ShowButton></Link>
          </div>
          <Link href="/1"><ShowButton><DashboardIcon /></ShowButton></Link>
          <ShowButton><ExploreIcon /></ShowButton>
          <Link href="/profile/bookmarks"><ShowButton><BookmarkIcon /></ShowButton></Link>
          <ShowButton><MenuIcon /></ShowButton>
        </nav>
      </div>
    </aside>
  );
};
