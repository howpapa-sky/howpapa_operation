import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Users } from "lucide-react";

export default function Vendors() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50]">거래처 관리</h1>
          <Link href="/">
            <Button variant="outline">홈으로</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              거래처 관리 시스템
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">거래처 관리 기능</h3>
              <p className="text-gray-600 mb-6">
                거래처 관리 기능은 현재 개발 중입니다.<br />
                프로젝트에서 제조사, 협력사 정보를 입력하여 관리하세요.
              </p>
              <Link href="/projects">
                <Button className="bg-[#93C572] hover:bg-[#7FB05B]">
                  프로젝트 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
