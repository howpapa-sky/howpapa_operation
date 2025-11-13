import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { toast } from "sonner";
import { Bell, Mail, Save, AlertCircle } from "lucide-react";

export default function Settings() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  
  const [emailNotifications, setEmailNotifications] = useState({
    deadlineReminder: true,
    overdueAlert: true,
    statusChange: false,
    dailyDigest: false,
  });

  const [emailAddress, setEmailAddress] = useState(user?.email || "");

  const handleSaveSettings = async () => {
    try {
      // 여기서는 로컬 스토리지에 저장 (실제로는 Supabase에 저장해야 함)
      localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
      localStorage.setItem('notificationEmail', emailAddress);
      
      toast.success("설정이 저장되었습니다");
    } catch (error) {
      toast.error("설정 저장에 실패했습니다");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">설정</h1>
          <p className="text-gray-600">알림 및 시스템 설정을 관리합니다</p>
        </div>

        {/* 이메일 알림 설정 */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#93C572]" />
              이메일 알림 설정
            </CardTitle>
            <CardDescription>
              프로젝트 마감일 및 중요 이벤트에 대한 이메일 알림을 설정합니다
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이메일 주소 */}
            <div className="space-y-2">
              <Label htmlFor="email">알림 받을 이메일 주소</Label>
              <Input
                id="email"
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            {/* 알림 옵션 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">마감일 리마인더</h4>
                  <p className="text-sm text-gray-600">프로젝트 마감일 3일 전에 알림을 받습니다</p>
                </div>
                <Switch
                  checked={emailNotifications.deadlineReminder}
                  onCheckedChange={(checked) =>
                    setEmailNotifications({ ...emailNotifications, deadlineReminder: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">지연 프로젝트 알림</h4>
                  <p className="text-sm text-gray-600">목표일이 지난 프로젝트에 대한 알림을 받습니다</p>
                </div>
                <Switch
                  checked={emailNotifications.overdueAlert}
                  onCheckedChange={(checked) =>
                    setEmailNotifications({ ...emailNotifications, overdueAlert: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">상태 변경 알림</h4>
                  <p className="text-sm text-gray-600">프로젝트 상태가 변경될 때 알림을 받습니다</p>
                </div>
                <Switch
                  checked={emailNotifications.statusChange}
                  onCheckedChange={(checked) =>
                    setEmailNotifications({ ...emailNotifications, statusChange: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">일일 요약 이메일</h4>
                  <p className="text-sm text-gray-600">매일 오전 9시에 프로젝트 현황 요약을 받습니다</p>
                </div>
                <Switch
                  checked={emailNotifications.dailyDigest}
                  onCheckedChange={(checked) =>
                    setEmailNotifications({ ...emailNotifications, dailyDigest: checked })
                  }
                />
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">이메일 알림 기능 안내</h4>
                <p className="text-sm text-blue-700">
                  이메일 알림 기능은 현재 개발 중입니다. 설정은 저장되지만 실제 이메일 발송은 추후 활성화될 예정입니다.
                  Gmail API 연동을 통해 자동 알림 기능이 제공될 예정입니다.
                </p>
              </div>
            </div>

            <Button 
              onClick={handleSaveSettings} 
              className="w-full bg-[#93C572] hover:bg-[#7FB05B]"
            >
              <Save className="w-4 h-4 mr-2" />
              설정 저장
            </Button>
          </CardContent>
        </Card>

        {/* 시스템 정보 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#93C572]" />
              시스템 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">버전</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">로그인 사용자</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">권한</span>
                <span className="font-medium capitalize">{user?.role || 'user'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">데이터베이스</span>
                <span className="font-medium">Supabase PostgreSQL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
