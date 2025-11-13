import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

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

const IMPORTANCE_LEVELS = [
  { value: "low", label: "낮음" },
  { value: "high", label: "높음" },
];

const URGENCY_LEVELS = [
  { value: "low", label: "낮음" },
  { value: "high", label: "높음" },
];

export default function ProjectForm() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/projects/:id");
  const isEdit = !!params?.id;

  const [formData, setFormData] = useState({
    name: "",
    type: "sampling" as any,
    status: "pending" as any,
    priority: "medium" as any,
    importance: "low" as any,
    urgency: "low" as any,
    startDate: "",
    targetDate: "",
    completedDate: "",
    deadline: "",
    brand: "",
    productName: "",
    developmentType: "",
    manufacturer: "",
    progressStatus: "",
    notes: "",
    sampleConfirmed: 0,
    sampleConfirmedDate: "",
    sampleCompany: "",
    partner: "",
    description: "",
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [showCompletedDatePicker, setShowCompletedDatePicker] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showSampleConfirmedDatePicker, setShowSampleConfirmedDatePicker] = useState(false);

  const { data: project } = trpc.projects.getById.useQuery(
    { id: parseInt(params?.id || "0") },
    { enabled: isEdit }
  );

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("프로젝트가 등록되었습니다");
      navigate("/projects");
    },
    onError: (error) => {
      toast.error(error.message || "프로젝트 등록에 실패했습니다");
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("프로젝트가 수정되었습니다");
      navigate(`/projects/${params?.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "프로젝트 수정에 실패했습니다");
    },
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        type: project.type,
        status: project.status,
        priority: project.priority,
        importance: project.importance || "low",
        urgency: project.urgency || "low",
        startDate: project.startDate || "",
        targetDate: project.targetDate || "",
        completedDate: project.completedDate || "",
        deadline: project.deadline || "",
        brand: project.brand || "",
        productName: project.productName || "",
        developmentType: project.developmentType || "",
        manufacturer: project.manufacturer || "",
        progressStatus: project.progressStatus || "",
        notes: project.notes || "",
        sampleConfirmed: project.sampleConfirmed || 0,
        sampleConfirmedDate: project.sampleConfirmedDate || "",
        sampleCompany: "",
        partner: "",
        description: project.description || "",
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("프로젝트 이름을 입력해주세요");
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id: parseInt(params?.id || "0"),
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDateSelect = (date: Date | undefined, field: string) => {
    if (date) {
      const formatted = date.toISOString().split("T")[0];
      setFormData({ ...formData, [field]: formatted });
    }
    if (field === "startDate") setShowStartDatePicker(false);
    if (field === "targetDate") setShowTargetDatePicker(false);
    if (field === "completedDate") setShowCompletedDatePicker(false);
    if (field === "deadline") setShowDeadlinePicker(false);
    if (field === "sampleConfirmedDate") setShowSampleConfirmedDatePicker(false);
  };

  const canEdit = user && (user.role === "admin" || user.role === "manager");

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">권한이 없습니다</h2>
          <p className="text-gray-600 mb-6">관리자 또는 매니저만 프로젝트를 생성/수정할 수 있습니다</p>
          <Button onClick={() => navigate("/projects")} className="bg-[#93C572] hover:bg-[#7AB05C]">
            프로젝트 목록으로
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(isEdit ? `/projects/${params?.id}` : "/projects")}
          className="mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로 가기
        </Button>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            프로젝트 등록
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로젝트 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 이름 <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="예: 누씨오 부활초 패드 리뉴얼"
                className="border-2 border-gray-200 focus:border-[#93C572]"
              />
            </div>

            {/* 프로젝트 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로젝트 유형 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PROJECT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      formData.type === type.value
                        ? "bg-[#93C572] text-white border-[#93C572]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#93C572]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 진행 상태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">진행 상태</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PROJECT_STATUS.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: status.value as any })}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      formData.status === status.value
                        ? "bg-[#93C572] text-white border-[#93C572]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#93C572]"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 중요도 (기존 - 호환성 유지) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">중요도 (기존 방식)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value as any })}
                    className={`p-3 rounded-lg border-2 font-medium transition-all ${
                      formData.priority === priority.value
                        ? "bg-[#93C572] text-white border-[#93C572]"
                        : "bg-white text-gray-700 border-gray-200 hover:border-[#93C572]"
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 아이젠하워 매트릭스 */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                아이젠하워 매트릭스 (우선순위 분석)
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                중요도와 긴급성을 분리하여 작업의 우선순위를 명확하게 관리하세요.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* 중요도 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    📊 중요도 (Importance)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">비즈니스 가치, 영향력, 의사결정 범위</p>
                  <div className="grid grid-cols-2 gap-3">
                    {IMPORTANCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, importance: level.value as any })}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          formData.importance === level.value
                            ? level.value === "high"
                              ? "bg-purple-500 text-white border-purple-500"
                              : "bg-gray-300 text-gray-700 border-gray-300"
                            : "bg-white text-gray-700 border-gray-300 hover:border-purple-400"
                        }`}
                      >
                        {level.value === "high" ? "⭐ " : ""}{level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 긴급성 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    ⏰ 긴급성 (Urgency)
                  </label>
                  <p className="text-xs text-gray-600 mb-2">마감일 임박, 타 업무 영향, 병목 여부</p>
                  <div className="grid grid-cols-2 gap-3">
                    {URGENCY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, urgency: level.value as any })}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                          formData.urgency === level.value
                            ? level.value === "high"
                              ? "bg-red-500 text-white border-red-500"
                              : "bg-gray-300 text-gray-700 border-gray-300"
                            : "bg-white text-gray-700 border-gray-300 hover:border-red-400"
                        }`}
                      >
                        {level.value === "high" ? "🔥 " : ""}{level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 우선순위 분석 결과 */}
              <div className="mt-6 p-4 bg-white rounded-lg border-2 border-dashed">
                <p className="text-sm font-semibold text-gray-700 mb-2">현재 설정된 우선순위:</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${
                  formData.importance === "high" && formData.urgency === "high"
                    ? "bg-red-100 text-red-800 border-2 border-red-400"
                    : formData.importance === "high" && formData.urgency === "low"
                    ? "bg-blue-100 text-blue-800 border-2 border-blue-400"
                    : formData.importance === "low" && formData.urgency === "high"
                    ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-400"
                    : "bg-gray-100 text-gray-800 border-2 border-gray-400"
                }`}>
                  {formData.importance === "high" && formData.urgency === "high" && (
                    <><span className="text-xl">🔥</span> Q1: 즉시 실행 (Do First)</>
                  )}
                  {formData.importance === "high" && formData.urgency === "low" && (
                    <><span className="text-xl">📅</span> Q2: 계획 (Schedule)</>
                  )}
                  {formData.importance === "low" && formData.urgency === "high" && (
                    <><span className="text-xl">🤝</span> Q3: 위임 (Delegate)</>
                  )}
                  {formData.importance === "low" && formData.urgency === "low" && (
                    <><span className="text-xl">🗑️</span> Q4: 제거 (Eliminate)</>
                  )}
                </div>
              </div>
            </div>

            {/* 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">시작일 (업무 요청일)</label>
              <div className="relative">
                <Input
                  value={formData.startDate}
                  onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                  placeholder="날짜를 선택하세요"
                  readOnly
                  className="border-2 border-gray-200 focus:border-[#93C572] cursor-pointer"
                />
                {showStartDatePicker && (
                  <div className="absolute z-10 mt-2 bg-white border-2 border-[#93C572]/30 rounded-lg shadow-xl p-4">
                    <DayPicker
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => handleDateSelect(date, "startDate")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 목표일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">목표일</label>
              <div className="relative">
                <Input
                  value={formData.targetDate}
                  onClick={() => setShowTargetDatePicker(!showTargetDatePicker)}
                  placeholder="날짜를 선택하세요"
                  readOnly
                  className="border-2 border-gray-200 focus:border-[#93C572] cursor-pointer"
                />
                {showTargetDatePicker && (
                  <div className="absolute z-10 mt-2 bg-white border-2 border-[#93C572]/30 rounded-lg shadow-xl p-4">
                    <DayPicker
                      mode="single"
                      selected={formData.targetDate ? new Date(formData.targetDate) : undefined}
                      onSelect={(date) => handleDateSelect(date, "targetDate")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 완료일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">완료일</label>
              <div className="relative">
                <Input
                  value={formData.completedDate}
                  onClick={() => setShowCompletedDatePicker(!showCompletedDatePicker)}
                  placeholder="날짜를 선택하세요"
                  readOnly
                  className="border-2 border-gray-200 focus:border-[#93C572] cursor-pointer"
                />
                {showCompletedDatePicker && (
                  <div className="absolute z-10 mt-2 bg-white border-2 border-[#93C572]/30 rounded-lg shadow-xl p-4">
                    <DayPicker
                      mode="single"
                      selected={formData.completedDate ? new Date(formData.completedDate) : undefined}
                      onSelect={(date) => handleDateSelect(date, "completedDate")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 제품 정보 - 프로젝트 유형별 */}
            <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">제품 정보</h3>
              
              {/* 샘플링 */}
              {formData.type === 'sampling' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="예: 누씨오"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제조사</label>
                    <Input
                      value={formData.manufacturer}
                      onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      placeholder="예: 제조사명"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">샘플명</label>
                    <Input
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="예: 부활초 패드"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">샘플 회사</label>
                    <Input
                      value={formData.sampleCompany}
                      onChange={(e) => setFormData({ ...formData, sampleCompany: e.target.value })}
                      placeholder="예: 샘플 제작 회사"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                </div>
              )}

              {/* 상세페이지 */}
              {formData.type === 'detail_page' && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="예: 누씨오"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제품명</label>
                    <Input
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="예: 부활초 패드"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">협력사</label>
                    <Input
                      value={formData.partner}
                      onChange={(e) => setFormData({ ...formData, partner: e.target.value })}
                      placeholder="예: 디자인 업체명"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                </div>
              )}

              {/* 기타 유형 */}
              {(formData.type === 'new_product' || formData.type === 'influencer') && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">브랜드명</label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="예: 누씨오, 하우파파"
                      className="border-2 border-gray-200 focus:border-[#93C572]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">제품명</label>
                    <Input
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      placeholder="예: 부활초 패드"
                    className="border-2 border-gray-200 focus:border-[#93C572]"
                  />
                  </div>
                </div>
              )}
            </div>

            {/* 샘플 확정 */}
            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">샘플 확정</h3>
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.sampleConfirmed === 1}
                    onChange={(e) => setFormData({ ...formData, sampleConfirmed: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5 text-[#93C572] border-gray-300 rounded focus:ring-[#93C572]"
                  />
                  <span className="text-sm font-medium text-gray-700">샘플 확정 완료</span>
                </label>
              </div>
              {formData.sampleConfirmed === 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">샘플 확정일</label>
                  <div className="relative">
                    <Input
                      value={formData.sampleConfirmedDate}
                      onClick={() => setShowSampleConfirmedDatePicker(!showSampleConfirmedDatePicker)}
                      placeholder="날짜를 선택하세요"
                      readOnly
                      className="border-2 border-gray-200 focus:border-[#93C572] cursor-pointer"
                    />
                    {showSampleConfirmedDatePicker && (
                      <div className="absolute z-10 mt-2 bg-white border-2 border-[#93C572]/30 rounded-lg shadow-xl p-4">
                        <DayPicker
                          mode="single"
                          selected={formData.sampleConfirmedDate ? new Date(formData.sampleConfirmedDate) : undefined}
                          onSelect={(date) => handleDateSelect(date, "sampleConfirmedDate")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 설명</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="프로젝트에 대한 상세 설명을 입력하세요"
                rows={5}
                className="border-2 border-gray-200 focus:border-[#93C572]"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#93C572] hover:bg-[#7AB05C] text-white py-6 text-lg font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>저장 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    <span>{isEdit ? "수정 완료" : "등록하기"}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
