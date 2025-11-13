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

const PROJECT_TYPES = [
  { value: "sampling", label: "샘플링" },
  { value: "detail_page", label: "상세페이지 제작" },
  { value: "new_product", label: "신제품 출시" },
  { value: "influencer", label: "인플루언서 협업" },
];

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
    type: "sampling",
    status: "pending",
    priority: "medium",
    start_date: "",
    target_date: "",
    completed_date: "",
    brand: "",
    product_name: "",
    manufacturer: "",
    description: "",
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
        type: project.type || "sampling",
        status: project.status || "pending",
        priority: project.priority || "medium",
        start_date: project.start_date || "",
        target_date: project.target_date || "",
        completed_date: project.completed_date || "",
        brand: project.brand || "",
        product_name: project.product_name || "",
        manufacturer: project.manufacturer || "",
        description: project.description || "",
      });
    }
  }, [project]);

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
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("프로젝트가 등록되었습니다");
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate("/projects");
    },
    onError: (error: any) => {
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
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      toast.success("프로젝트가 수정되었습니다");
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', params?.id] });
      navigate("/projects");
    },
    onError: (error: any) => {
      toast.error(error.message || "프로젝트 수정에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate("/projects")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-[#2C3E50]">
            {isEdit ? "프로젝트 수정" : "프로젝트 등록"}
          </h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">프로젝트 이름 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">프로젝트 유형 *</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  {PROJECT_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">진행 상태 *</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  {PROJECT_STATUS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">우선순위 *</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  {PRIORITIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">시작일</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_date">목표일</Label>
                <Input
                  id="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completed_date">완료일</Label>
                <Input
                  id="completed_date"
                  type="date"
                  value={formData.completed_date}
                  onChange={(e) => setFormData({ ...formData, completed_date: e.target.value })}
                />
              </div>
            </div>

            {(formData.type === "sampling" || formData.type === "detail_page") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">브랜드</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_name">제품명</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  />
                </div>

                {formData.type === "sampling" && (
                  <div className="space-y-2">
                    <Label htmlFor="manufacturer">제조사</Label>
                    <Input
                      id="manufacturer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => navigate("/projects")}>
                취소
              </Button>
              <Button 
                type="submit" 
                className="bg-[#93C572] hover:bg-[#7FB05B]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "수정" : "등록"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
