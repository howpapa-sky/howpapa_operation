import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import PageLayout from '../components/PageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Users, Shield, Settings, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const ROLE_LABELS = {
  super_admin: '통합 관리자',
  admin: '관리자',
  manager: '매니저',
  user: '사용자'
};

const ROLE_COLORS = {
  super_admin: 'bg-purple-100 text-purple-800 border-purple-300',
  admin: 'bg-blue-100 text-blue-800 border-blue-300',
  manager: 'bg-green-100 text-green-800 border-green-300',
  user: 'bg-gray-100 text-gray-800 border-gray-300'
};

const MENU_LABELS = {
  dashboard: '대시보드',
  projects: '프로젝트',
  samples: '샘플 평가',
  my_tasks: 'My Tasks',
  account_info: '계정 정보',
  admin: '관리자'
};

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      setCurrentUser(data);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 사용자 목록 로드
      const { data: usersData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      // 권한 목록 로드
      const { data: permissionsData } = await supabase
        .from('menu_permissions')
        .select('*')
        .order('role', { ascending: true });

      setUsers(usersData || []);
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role || 'user');
    setShowEditDialog(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id);

      if (error) throw error;

      alert('사용자 권한이 업데이트되었습니다.');
      setShowEditDialog(false);
      loadData();
    } catch (error) {
      console.error('권한 업데이트 오류:', error);
      alert('권한 업데이트에 실패했습니다.');
    }
  };

  const getPermissionsByRole = (role: string) => {
    return permissions.filter(p => p.role === role);
  };

  if (loading) {
    return (
      <PageLayout title="사용자 권한 관리">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </PageLayout>
    );
  }

  // 권한 체크: super_admin만 접근 가능
  if (currentUser?.role !== 'super_admin') {
    return (
      <PageLayout title="사용자 권한 관리">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-600">이 페이지는 통합 관리자만 접근할 수 있습니다.</p>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="사용자 권한 관리">
      <div className="space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-[#93C572]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">통합 관리자</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'super_admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">관리자</CardTitle>
              <Settings className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">일반 사용자</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.role === 'user' || !u.role).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사용자 관리 */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 권한 관리</CardTitle>
            <CardDescription>사용자별 역할을 관리하고 권한을 부여합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{user.name || '이름 없음'}</h4>
                      <Badge className={ROLE_COLORS[user.role as keyof typeof ROLE_COLORS] || ROLE_COLORS.user}>
                        {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || '사용자'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      가입일: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditUser(user)}
                  >
                    권한 수정
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 권한 매트릭스 */}
        <Card>
          <CardHeader>
            <CardTitle>역할별 권한 매트릭스</CardTitle>
            <CardDescription>각 역할별로 부여된 메뉴 접근 권한을 확인합니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border p-3 text-left font-semibold">메뉴</th>
                    <th className="border p-3 text-center font-semibold">통합 관리자</th>
                    <th className="border p-3 text-center font-semibold">관리자</th>
                    <th className="border p-3 text-center font-semibold">매니저</th>
                    <th className="border p-3 text-center font-semibold">사용자</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(MENU_LABELS).map(([key, label]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="border p-3 font-medium">{label}</td>
                      {['super_admin', 'admin', 'manager', 'user'].map((role) => {
                        const perm = permissions.find(p => p.role === role && p.menu_key === key);
                        return (
                          <td key={role} className="border p-3 text-center">
                            {perm?.can_view ? (
                              <div className="flex flex-col items-center gap-1">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <div className="flex gap-1 text-xs">
                                  {perm.can_create && <span className="text-blue-600">생성</span>}
                                  {perm.can_edit && <span className="text-yellow-600">수정</span>}
                                  {perm.can_delete && <span className="text-red-600">삭제</span>}
                                </div>
                              </div>
                            ) : (
                              <XCircle className="w-5 h-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 권한 수정 다이얼로그 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 권한 수정</DialogTitle>
            <DialogDescription>
              {selectedUser?.name}님의 역할을 변경합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>이메일</Label>
              <Input value={selectedUser?.email || ''} disabled />
            </div>

            <div>
              <Label>역할</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">통합 관리자</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                  <SelectItem value="manager">매니저</SelectItem>
                  <SelectItem value="user">사용자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">권한 안내</h4>
              <ul className="text-xs space-y-1 text-gray-700">
                <li>• <strong>통합 관리자:</strong> 모든 기능 접근 및 사용자 권한 관리</li>
                <li>• <strong>관리자:</strong> 관리자 페이지 제외 모든 기능 접근</li>
                <li>• <strong>매니저:</strong> 프로젝트 및 샘플 관리 (삭제 제외)</li>
                <li>• <strong>사용자:</strong> 읽기 및 자신의 작업만 수정 가능</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              취소
            </Button>
            <Button
              onClick={handleUpdateRole}
              className="bg-[#93C572] hover:bg-[#7FB05B]"
            >
              권한 변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
