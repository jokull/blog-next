import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full p-6 sm:p-10 md:p-14">
      <div className="fixed sm:hidden h-6 sm:h-10 md:h-14 w-full top-0 left-0 z-30 pointer-events-none content-fade-out" />
      <div className="flex flex-col mobile:flex-row">
        <Navbar />
        <main className="relative flex-1 max-w-2xl [contain:inline-size]">
          <div className="absolute w-full h-px opacity-50 bg-rurikon-border right-0 mobile:right-auto mobile:left-0 mobile:w-px mobile:h-full mobile:opacity-100" />
          <article className="pl-0 pt-6 mobile:pt-0 mobile:pl-6 sm:pl-10 md:pl-14">
            {children}
          </article>
        </main>
      </div>
    </div>
  );
}
