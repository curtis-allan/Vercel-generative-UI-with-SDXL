import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { AI } from "./actions/ai";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "GenR8",
  description: "AI Image generation tool with different formats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AI>
      <html lang="en" suppressHydrationWarning>
        <body className={cn("font-sans antialiased", fontSans.variable)}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <div className="grid gap-4 container p-4">
              <Navbar />
              {children}
            </div>
          </ThemeProvider>
        </body>
      </html>
    </AI>
  );
}
