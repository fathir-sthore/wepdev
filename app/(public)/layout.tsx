import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { GlobalBottomNav } from "@/components/layout/global-bottom-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20 md:pb-0">
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <GlobalBottomNav />
    </div>
  );
}
