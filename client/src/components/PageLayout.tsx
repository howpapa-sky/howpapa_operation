import { ReactNode, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "./Sidebar";

interface PageLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  title?: string;
}

export default function PageLayout({ children, showBackButton = true, title }: PageLayoutProps) {
  const [, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF]">
      {/* 사이드바 */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 메인 컨텐츠 */}
      <main className="flex-1 overflow-x-hidden w-full md:w-auto">
        {/* 헤더 */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-3 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
            {/* 모바일 햄버거 메뉴 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden h-9 w-9 p-0"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* 뒤로가기 버튼 */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-gray-100 h-9"
              >
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">뒤로가기</span>
              </Button>
            )}

            {/* 타이틀 */}
            {title && (
              <h1 className="text-base sm:text-lg md:text-xl font-semibold text-[#2C3E50] truncate">
                {title}
              </h1>
            )}
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="p-3 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
