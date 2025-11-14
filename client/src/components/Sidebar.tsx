import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TestTube, 
  FileText,
  KeyRound,
  ChevronDown,
  ChevronRight,
  Shield,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ className, isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { hasPermission, loading } = usePermissions();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    dashboard: true,
    samples: true,
  });

  const toggleMenu = (key: string) => {
    setExpandedMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(path + '?');
  };

  const handleLinkClick = () => {
    // 모바일에서 링크 클릭 시 사이드바 닫기
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      label: '대시보드',
      icon: LayoutDashboard,
      subItems: [
        { label: '전체 프로젝트', path: '/projects' },
        { label: '완료된 프로젝트', path: '/projects?status=completed' },
        { label: '긴급 프로젝트', path: '/projects?priority=urgent' },
        { label: '지연 프로젝트', path: '/projects?overdue=true' },
      ]
    },
    {
      key: 'samples',
      label: '샘플 관리',
      icon: TestTube,
      subItems: [
        { label: '앰플', path: '/samples?type=ampoule' },
        { label: '토너패드', path: '/samples?type=toner_pad' },
        { label: '크림&로션', path: '/samples?type=cream_lotion' },
      ]
    },
    {
      key: 'detail_page',
      label: '상세페이지',
      icon: FileText,
      path: '/projects?type=detail_page',
    },
    {
      key: 'account_info',
      label: '계정 정보',
      icon: KeyRound,
      path: '/account-info',
    },
    {
      key: 'user_management',
      label: '사용자 권한',
      icon: Shield,
      path: '/user-management',
    },
  ];

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <aside 
        className={cn(
          "fixed md:sticky top-0 left-0 w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto z-50 transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
        <div className="p-4">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" onClick={handleLinkClick}>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 bg-[#93C572] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">HP</span>
                </div>
                <div>
                  <h2 className="font-bold text-lg text-[#2C3E50]">하우파파</h2>
                  <p className="text-xs text-gray-500">프로젝트 관리</p>
                </div>
              </div>
            </Link>

            {/* 모바일 닫기 버튼 */}
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* 메뉴 */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              // 권한 체크
              const menuKey = item.key === 'user_management' ? 'admin' : item.key;
              if (!loading && !hasPermission(menuKey, 'view')) {
                return null;
              }
              
              return (
              <div key={item.key}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.key)}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </div>
                      {expandedMenus[item.key] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    {expandedMenus[item.key] && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link key={subItem.path} href={subItem.path}>
                            <a
                              onClick={handleLinkClick}
                              className={cn(
                                "block px-3 py-2 text-sm rounded-lg transition-colors",
                                isActive(subItem.path)
                                  ? "bg-[#93C572] text-white font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              )}
                            >
                              {subItem.label}
                            </a>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link href={item.path!}>
                    <a
                      onClick={handleLinkClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                        isActive(item.path!)
                          ? "bg-[#93C572] text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </a>
                  </Link>
                )}
              </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
