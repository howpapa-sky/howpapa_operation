import { ReactNode } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
}

export default function PageLayout({ children, showBackButton = true, title }: PageLayoutProps) {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF]">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {showBackButton && (
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로가기
              </Button>
              {title && (
                <h1 className="text-xl font-semibold text-[#2C3E50]">{title}</h1>
              )}
            </div>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
