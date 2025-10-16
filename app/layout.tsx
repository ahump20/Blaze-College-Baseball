import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "./_components/BottomNav";

export const metadata: Metadata = {
  title: {
    default: "Blaze Sports Intel | College Baseball Intelligence",
    template: "%s | Blaze Sports Intel",
  },
  description:
    "Mobile-first, dark-mode college baseball intelligence platform with live scores, deep stats, and standings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <header className="rounded-3xl border border-slate-800 bg-slate-900/60 px-6 py-5 shadow-[0_15px_45px_-35px_rgba(0,0,0,0.8)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-brand-gold">Blaze Sports Intel</p>
                <h1 className="font-serif text-2xl font-semibold text-slate-50 sm:text-3xl">
                  NCAA Division I College Baseball
                </h1>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-300">
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300">Live Now</span>
                <span className="rounded-full bg-slate-800/80 px-3 py-1">Mobile-first · Dark mode</span>
              </div>
            </div>
          </header>

          <main className="mt-6 flex-1 pb-10">{children}</main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
