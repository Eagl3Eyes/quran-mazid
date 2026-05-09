"use client";

import React, { ReactNode } from "react";
import { SettingsProvider } from "@/components/context/SettingsContext";
import { AudioProvider } from "@/components/audio/AudioContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <AudioProvider>{children}</AudioProvider>
    </SettingsProvider>
  );
}
