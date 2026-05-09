import { Inter, Amiri_Quran } from "next/font/google";
import "./globals.css";   
import { AppShell } from "@/components/layout/AppShell";
import { Providers } from "@/components/context/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const amiriQuran = Amiri_Quran({ 
  weight: "400", 
  subsets: ["arabic"],
  variable: "--font-amiri-quran"
});

export const metadata = {
  title: "Quran Mazid",
  description: "Read, Study, and Learn The Quran",
  icons: {
    icon: "./logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('quranSettings');
                  var isDark = true;
                  if (saved) {
                    var settings = JSON.parse(saved);
                    if (settings.isDarkMode !== undefined) {
                      isDark = settings.isDarkMode;
                    }
                  }
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${amiriQuran.variable}`}>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}