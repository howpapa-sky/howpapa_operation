import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { notifyProjectCreated, notifyProjectStatusChanged } from "@/lib/naverWorksNotification";
import {
  MAIN_CATEGORIES,
  SUB_CATEGORIES,
  DETAIL_CATEGORIES,
  getRequiredFields,
  FIELD_LABELS,
  type ProjectCategory,
  type MainCategory,
} from "@/types/projectCategories";

const PROJECT_STATUS = [
  { value: "pending", label: "진행 전" },
  { value: "in_progress", label: "진행 중" },
  { value: "completed", label: "완료" },
  { value: "on_hold", label: "보류" },
];

const PRIORITIES = [
  { value: "low", label: "낮음" },
  { value: "medium", label: "보통" },
  { value: "high", label: "높음" },
  { value: "urgent", label: "긴급" },
];

export default function ProjectForm() {
  const { user } = useSupabaseAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/projects/:id/edit");
  const isEdit = !!params?.id;
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    category_main: "인플루언서 협업" as MainCategory,
    category_sub: "",
    category_detail: "",
    status: "pending",
    priority: "medium",
    start_date: "",
    target_date: "",
    completed_date: "",
    brand: "",
    description: "",
    // 추가 필드
    product_name: "",
    manufacturer: "",
    seller_name: "",
    sales_cycle: "",
    commission_rate: "",
    settlement_status: false,
    influencer_name: "",
    follower_count: 0,
    ad_fee: 0,
    order_quantity: 0,
    subsidiary_company: "",
    supply_type: "",
    moq: 0,
  });

  const { data: project } = useQuery({
    queryKey: ['project', params?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        category_main: project.category_main || "인플루언서 협업",
        category_sub: project.category_sub || "",
        category_detail: project.category_detail || "",
        status: project.status || "pending",
        priority: project.priority || "medium",
        start_date: project.start_date || "",
        target_date: project.target_date || "",
        completed_date: project.completed_date || "",
        brand: project.brand || "",
        description: project.description || "",
        product_name: project.product_name || "",
        manufacturer: project.manufacturer || "",
        seller_name: project.seller_name || "",
        sales_cycle: project.sales_cycle || "",
        commission_rate: project.commission_rate || "",
        settlement_status: project.settlement_status || false,
        influencer_name: project.influencer_name || "",
        follower_count: project.follower_count || 0,
        ad_fee: project.ad_fee || 0,
        order_quantity: project.order_quantity || 0,
        subsidiary_company: project.subsidiary_company || "",
        supply_type: project.supply_type || "",
        moq: project.moq || 0,
      });
    }
  }, [project]);

  // 대분류 변경 시 중분류/소분류 초기화
  const handleMainCategoryChange = (value: MainCategory) => {
    setFormData(prev => ({
      ...prev,
      category_main: value,
      category_sub: "",
      category_detail: "",
    }));
  };

  // 중분류 변경 시 소분류 초기화
  const handleSubCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category_sub: value,
      category_detail: "",
    }));
  };

  // 현재 선택된 분류에 필요한 필드 가져오기
  const requiredFields = getRequiredFields({
    main: formData.category_main,
    sub: formData.category_sub,
    detail: formData.category_detail,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('projects')
        .insert({
          ...data,
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) {
        console.error('프로젝트 생성 오류:', error);
        throw error;
      }
      return result;
    },
    onSuccess: async (data) => {
      toast.success("프로젝트가 등록되었습니다");
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      
      // 네이버 웍스 알림 전송
      try {
        await notifyProjectCreated(data);
      } catch (error) {
        console.error('네이버 웍스 알림 전송 실패:', error);
      }
      
      navigate("/projects");
    },
    onError: (error: any) => {
      console.error('프로젝트 등록 실패:', error);
      toast.error(error.message || "프로젝트 등록에 실패했습니다");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from('projects')
        .update(data)
        .eq('id', params?.id)
        .select()
        .single();
      if (error) {
        console.error('프로젝트 수정 오류:', error);
        throw error;
      }
      return result;
    },
    onSuccess: async (data) => {
      toast.success("프로젝트가 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', params?.id] });
      
      // 상태 변경 시 알림
      if (project && project.status !== data.status) {
        try {
          await notifyProjectStatusChanged(data, project.status, data.status);
        } catch (error) {
          console.error('네이버 웍스 알림 전송 실패:', error);
        }
      }
      
      navigate("/projects");
    },
    onError: (error: any) => {
      console.error('프로젝트 수정 실패:', error);
      toast.error(error.message || "프로젝트 수정에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 빈 날짜 필드를 null로 변환
    const dataToSubmit = {
      ...formData,
      start_date: formData.start_date || null,
      target_date: formData.target_date || null,
      completed_date: formData.completed_date || null,
    };
    
    if (isEdit) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/projects")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isEdit ? "프로젝트 수정" : "프로젝트 등록"}
          </h1>
        </div>

        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로젝트 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name" className="required text-base">
                프로젝트 이름
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="[뉴씨오 기미 앰플] 신제품 출시"
                required
                className="text-base"
              />
            </div>

            {/* 프로젝트 분류 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 대분류 */}
              <div className="space-y-2">
                <Label htmlFor="category_main" className="required text-base">
                  대분류
                </Label>
                <select
                  id="category_main"
                  value={formData.category_main}
                  onChange={(e) => handleMainCategoryChange(e.target.value as MainCategory)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                  required
                >
                  {MAIN_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* 중분류 */}
              {SUB_CATEGORIES[formData.category_main].length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="category_sub" className="text-base">
                    중분류
                  </Label>
                  <select
                    id="category_sub"
                    value={formData.category_sub}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                  >
                    <option value="">선택 안 함</option>
                    {SUB_CATEGORIES[formData.category_main].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* 소분류 */}
              {formData.category_sub && DETAIL_CATEGORIES[formData.category_sub]?.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="category_detail" className="text-base">
                    소분류
                  </Label>
                  <select
                    id="category_detail"
                    value={formData.category_detail}
                    onChange={(e) => setFormData({ ...formData, category_detail: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                  >
                    <option value="">선택 안 함</option>
                    {DETAIL_CATEGORIES[formData.category_sub].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 프로젝트 상태 및 우선순위 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="required text-base">
                  진행 상태
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                  required
                >
                  {PROJECT_STATUS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority" className="required text-base">
                  우선순위
                </Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                  required
                >
                  {PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 날짜 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-base">
                  시작일
                </Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date" className="text-base">
                  목표일
                </Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completed_date" className="text-base">
                  완료일
                </Label>
                <Input
                  id="completed_date"
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                  className="text-base"
                />
              </div>
            </div>

            {/* 브랜드 */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-base">
                브랜드
              </Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="뉴씨오"
                className="text-base"
              />
            </div>

            {/* 동적 추가 필드 */}
            {requiredFields.includes('product_name') && (
              <div className="space-y-2">
                <Label htmlFor="product_name" className="text-base">
                  {FIELD_LABELS.product_name}
                </Label>
                <Input
                  id="product_name"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  placeholder="제품명"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('manufacturer') && (
              <div className="space-y-2">
                <Label htmlFor="manufacturer" className="text-base">
                  {FIELD_LABELS.manufacturer}
                </Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                  placeholder="제조사명"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('seller_name') && (
              <div className="space-y-2">
                <Label htmlFor="seller_name" className="text-base">
                  {FIELD_LABELS.seller_name}
                </Label>
                <Input
                  id="seller_name"
                  value={formData.seller_name}
                  onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                  placeholder="공구 셀러명"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('sales_cycle') && (
              <div className="space-y-2">
                <Label htmlFor="sales_cycle" className="text-base">
                  {FIELD_LABELS.sales_cycle}
                </Label>
                <Input
                  id="sales_cycle"
                  value={formData.sales_cycle}
                  onChange={(e) => setFormData({ ...formData, sales_cycle: e.target.value })}
                  placeholder="예: 매주 월요일"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('commission_rate') && (
              <div className="space-y-2">
                <Label htmlFor="commission_rate" className="text-base">
                  {FIELD_LABELS.commission_rate}
                </Label>
                <Input
                  id="commission_rate"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  placeholder="예: 15%"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('settlement_status') && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="settlement_status"
                    checked={formData.settlement_status}
                    onChange={(e) => setFormData({ ...formData, settlement_status: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="settlement_status" className="text-base cursor-pointer">
                    {FIELD_LABELS.settlement_status}
                  </Label>
                </div>
              </div>
            )}

            {requiredFields.includes('influencer_name') && (
              <div className="space-y-2">
                <Label htmlFor="influencer_name" className="text-base">
                  {FIELD_LABELS.influencer_name}
                </Label>
                <Input
                  id="influencer_name"
                  value={formData.influencer_name}
                  onChange={(e) => setFormData({ ...formData, influencer_name: e.target.value })}
                  placeholder="인플루언서명"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('follower_count') && (
              <div className="space-y-2">
                <Label htmlFor="follower_count" className="text-base">
                  {FIELD_LABELS.follower_count}
                </Label>
                <Input
                  id="follower_count"
                  type="number"
                  value={formData.follower_count}
                  onChange={(e) => setFormData({ ...formData, follower_count: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('ad_fee') && (
              <div className="space-y-2">
                <Label htmlFor="ad_fee" className="text-base">
                  {FIELD_LABELS.ad_fee}
                </Label>
                <Input
                  id="ad_fee"
                  type="number"
                  value={formData.ad_fee}
                  onChange={(e) => setFormData({ ...formData, ad_fee: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('order_quantity') && (
              <div className="space-y-2">
                <Label htmlFor="order_quantity" className="text-base">
                  {FIELD_LABELS.order_quantity}
                </Label>
                <Input
                  id="order_quantity"
                  type="number"
                  value={formData.order_quantity}
                  onChange={(e) => setFormData({ ...formData, order_quantity: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('subsidiary_company') && (
              <div className="space-y-2">
                <Label htmlFor="subsidiary_company" className="text-base">
                  {FIELD_LABELS.subsidiary_company}
                </Label>
                <Input
                  id="subsidiary_company"
                  value={formData.subsidiary_company}
                  onChange={(e) => setFormData({ ...formData, subsidiary_company: e.target.value })}
                  placeholder="부자재 업체명"
                  className="text-base"
                />
              </div>
            )}

            {requiredFields.includes('supply_type') && (
              <div className="space-y-2">
                <Label htmlFor="supply_type" className="text-base">
                  {FIELD_LABELS.supply_type}
                </Label>
                <select
                  id="supply_type"
                  value={formData.supply_type}
                  onChange={(e) => setFormData({ ...formData, supply_type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-base"
                >
                  <option value="">선택</option>
                  <option value="turnkey">턴키</option>
                  <option value="sagup">사급</option>
                </select>
              </div>
            )}

            {requiredFields.includes('moq') && (
              <div className="space-y-2">
                <Label htmlFor="moq" className="text-base">
                  {FIELD_LABELS.moq}
                </Label>
                <Input
                  id="moq"
                  type="number"
                  value={formData.moq}
                  onChange={(e) => setFormData({ ...formData, moq: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="text-base"
                />
              </div>
            )}

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base">
                설명
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="프로젝트 설명을 입력하세요"
                rows={5}
                className="text-base resize-none"
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/projects")}
                className="flex-1 sm:flex-none sm:px-8 h-11 text-base"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 sm:flex-none sm:px-8 h-11 text-base"
              >
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "수정" : "등록"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageLayout>
  );
}
