import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Package, 
  FileText, 
  ShoppingCart, 
  Megaphone,
  ArrowRight,
  BarChart3
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF]">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#2C3E50] mb-4">
            하우파파 프로젝트 관리 시스템
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            브랜드 업무를 효율적으로 관리하세요
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-[#93C572] hover:bg-[#7FB05B]">
                <BarChart3 className="w-5 h-5 mr-2" />
                대시보드 보기
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button size="lg" variant="outline">
                샘플 관리 시작하기
              </Button>
            </Link>
          </div>
        </div>

        {/* 4개 업무 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link href="/projects?type=sampling">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">샘플</h3>
                <p className="text-gray-600 text-sm mb-4">
                  샘플링 프로젝트 관리
                </p>
                <Button variant="ghost" size="sm">
                  바로가기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </Link>

          <Link href="/projects?type=detail_page">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">상세페이지</h3>
                <p className="text-gray-600 text-sm mb-4">
                  상세페이지 제작 관리
                </p>
                <Button variant="ghost" size="sm">
                  바로가기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </Link>

          <Link href="/projects?type=new_product">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">공구운영</h3>
                <p className="text-gray-600 text-sm mb-4">
                  공구 운영 관리
                </p>
                <Button variant="ghost" size="sm">
                  바로가기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </Link>

          <Link href="/projects?type=influencer">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Megaphone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">인플루언서</h3>
                <p className="text-gray-600 text-sm mb-4">
                  인플루언서 협업 관리
                </p>
                <Button variant="ghost" size="sm">
                  바로가기 <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          </Link>
        </div>

        {/* 하단 버튼 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/projects?type=sampling">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2 text-blue-900">샘플 관리 시작하기</h3>
              <p className="text-sm text-blue-700">샘플링 프로젝트를 생성하고 관리하세요</p>
            </Card>
          </Link>

          <Link href="/projects?type=detail_page">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2 text-green-900">상세페이지 관리 시작하기</h3>
              <p className="text-sm text-green-700">상세페이지 제작을 관리하세요</p>
            </Card>
          </Link>

          <Link href="/projects?type=new_product">
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2 text-purple-900">공구운영 관리 시작하기</h3>
              <p className="text-sm text-purple-700">공구 운영을 관리하세요</p>
            </Card>
          </Link>

          <Link href="/projects?type=influencer">
            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2 text-orange-900">인플루언서 관리 시작하기</h3>
              <p className="text-sm text-orange-700">인플루언서 협업을 관리하세요</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2025 하우파파 프로젝트 관리 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
