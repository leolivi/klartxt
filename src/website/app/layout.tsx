
import { Separator } from "@/sidepanel/components/ui/separator";
import { Header } from "../layouts/header";
import { Footer } from "../layouts/footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text font-sans">
      <Header />
      <Separator />
      <div className="flex-1 flex flex-col">{children}</div>
      <Separator />
      <Footer />
    </div>
  );
}
