
import { Separator } from "@/sidepanel/components/ui/separator";
import { Header } from "../layouts/header";
import { Footer } from "../layouts/footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <Header />
      <Separator />
      {children}
      <Separator />
      <Footer />
    </div>
  );
}
