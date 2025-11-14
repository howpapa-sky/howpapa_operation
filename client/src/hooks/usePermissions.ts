import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MenuPermission {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export function usePermissions() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Record<string, MenuPermission>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // 사용자 역할 가져오기
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('email', user.email)
        .single();

      const role = userData?.role || 'user';
      setUserRole(role);

      // 역할별 권한 가져오기
      const { data: permissionsData } = await supabase
        .from('menu_permissions')
        .select('*')
        .eq('role', role);

      // 권한을 객체로 변환
      const permissionsMap: Record<string, MenuPermission> = {};
      permissionsData?.forEach((perm: any) => {
        permissionsMap[perm.menu_key] = {
          can_view: perm.can_view,
          can_create: perm.can_create,
          can_edit: perm.can_edit,
          can_delete: perm.can_delete,
        };
      });

      setPermissions(permissionsMap);
    } catch (error) {
      console.error('권한 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (menuKey: string, action: 'view' | 'create' | 'edit' | 'delete' = 'view'): boolean => {
    const perm = permissions[menuKey];
    if (!perm) return false;

    switch (action) {
      case 'view':
        return perm.can_view;
      case 'create':
        return perm.can_create;
      case 'edit':
        return perm.can_edit;
      case 'delete':
        return perm.can_delete;
      default:
        return false;
    }
  };

  const isSuperAdmin = () => userRole === 'super_admin';
  const isAdmin = () => userRole === 'admin' || userRole === 'super_admin';
  const isManager = () => ['manager', 'admin', 'super_admin'].includes(userRole || '');

  return {
    userRole,
    permissions,
    loading,
    hasPermission,
    isSuperAdmin,
    isAdmin,
    isManager,
  };
}
