import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  TestTube, 
  FileText,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
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
  ];

  return (
    <aside className={cn("w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto", className)}>
      <div className="p-4">
        <Link href="/">
          <div className="flex items-center gap-2 mb-6 cursor-pointer">
            <div className="w-8 h-8 bg-[#93C572] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HP</span>
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#2C3E50]">하우파파</h2>
              <p className="text-xs text-gray-500">프로젝트 관리</p>
            </div>
          </div>
        </Link>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.key}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.key)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
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
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive(item.path!)
                        ? "bg-[#93C572] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </a>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
