import { Button } from "@/components/ui/button";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Bot } from "lucide-react";

export default function AIAssistant() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50]">AI 업무 도우미</h1>
          <Link href="/">
            <Button variant="outline">홈으로</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-6 h-6" />
              AI 업무 도우미
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI 도우미 기능</h3>
              <p className="text-gray-600 mb-6">
                AI 업무 도우미 기능은 현재 개발 중입니다.<br />
                추후 업데이트 예정입니다.
              </p>
              <Link href="/dashboard">
                <Button className="bg-[#93C572] hover:bg-[#7FB05B]">
                  대시보드로 이동
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
