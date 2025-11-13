import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CATEGORIES = ["토너패드", "앰플", "크림", "세럼", "로션", "클렌저", "미스트", "스킨"];

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("토너패드");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<any>(null);
  const [formData, setFormData] = useState({
    criteriaName: "",
    score1Description: "",
    score3Description: "",
    score5Description: "",
  });

  const { data: criteria, refetch } = trpc.evaluationCriteria.list.useQuery();

  const createMutation = trpc.evaluationCriteria.create.useMutation({
    onSuccess: () => {
      toast.success("평가 기준이 추가되었습니다");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("평가 기준 추가에 실패했습니다");
    },
  });

  const updateMutation = trpc.evaluationCriteria.update.useMutation({
    onSuccess: () => {
      toast.success("평가 기준이 수정되었습니다");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast.error("평가 기준 수정에 실패했습니다");
    },
  });

  const deleteMutation = trpc.evaluationCriteria.delete.useMutation({
    onSuccess: () => {
      toast.success("평가 기준이 삭제되었습니다");
      refetch();
    },
    onError: () => {
      toast.error("평가 기준 삭제에 실패했습니다");
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
        <Card className="max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">관리자 권한이 필요합니다</h2>
            <Button asChild className="bg-[#93C572] hover:bg-[#78A85E]">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetForm = () => {
    setFormData({
      criteriaName: "",
      score1Description: "",
      score3Description: "",
      score5Description: "",
    });
    setEditingCriteria(null);
  };

  const handleOpenDialog = (criterion?: any) => {
    if (criterion) {
      setEditingCriteria(criterion);
      setFormData({
        criteriaName: criterion.item,
        score1Description: criterion.score1Desc || "",
        score3Description: criterion.score3Desc || "",
        score5Description: criterion.score5Desc || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.criteriaName) {
      toast.error("평가 항목명을 입력해주세요");
      return;
    }

    const data = {
      category: selectedCategory,
      item: formData.criteriaName,
      score1Desc: formData.score1Description || undefined,
      score3Desc: formData.score3Description || undefined,
      score5Desc: formData.score5Description || undefined,
    };

    if (editingCriteria) {
      updateMutation.mutate({ id: editingCriteria.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 이 평가 기준을 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredCriteria = criteria?.filter((c: any) => c.category === selectedCategory) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="hover:bg-[#93C572]/10">
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#93C572] to-[#589B6A] bg-clip-text text-transparent">
              {APP_TITLE} - 관리자
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">평가 기준 관리</h2>
          <p className="text-gray-600">카테고리별 평가 항목과 점수 설명을 관리합니다</p>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                className={
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-[#93C572] to-[#589B6A] text-white"
                    : "border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                }
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <Button
            onClick={() => handleOpenDialog()}
            className="bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            평가 항목 추가
          </Button>
        </div>

        {/* 평가 기준 목록 */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredCriteria.length === 0 ? (
            <Card className="col-span-2 border-none shadow-lg">
              <CardContent className="p-16 text-center">
                <p className="text-gray-500">등록된 평가 기준이 없습니다</p>
              </CardContent>
            </Card>
          ) : (
            filteredCriteria.map((criterion: any) => (
              <Card key={criterion.id} className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{criterion.item}</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(criterion)}
                        className="hover:bg-[#93C572]/10"
                      >
                        <EditIcon className="w-4 h-4 text-[#589B6A]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(criterion.id)}
                        className="hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    {criterion.score1Desc && (
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="font-semibold">1점:</span> {criterion.score1Desc}
                      </div>
                    )}
                    {criterion.score3Desc && (
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="font-semibold">3점:</span> {criterion.score3Desc}
                      </div>
                    )}
                    {criterion.score5Desc && (
                      <div className="p-2 bg-gray-50 rounded">
                        <span className="font-semibold">5점:</span> {criterion.score5Desc}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* 평가 기준 추가/수정 다이얼로그 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCriteria ? "평가 기준 수정" : "평가 기준 추가"} - {selectedCategory}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="criteriaName">
                평가 항목명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="criteriaName"
                value={formData.criteriaName}
                onChange={(e) => setFormData({ ...formData, criteriaName: e.target.value })}
                placeholder="예: 겉보습"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="score1Description">1점 설명</Label>
              <Textarea
                id="score1Description"
                value={formData.score1Description}
                onChange={(e) => setFormData({ ...formData, score1Description: e.target.value })}
                placeholder="1점에 해당하는 상태를 설명하세요"
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="score3Description">3점 설명</Label>
              <Textarea
                id="score3Description"
                value={formData.score3Description}
                onChange={(e) => setFormData({ ...formData, score3Description: e.target.value })}
                placeholder="3점에 해당하는 상태를 설명하세요"
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="score5Description">5점 설명</Label>
              <Textarea
                id="score5Description"
                value={formData.score5Description}
                onChange={(e) => setFormData({ ...formData, score5Description: e.target.value })}
                placeholder="5점에 해당하는 상태를 설명하세요"
                rows={2}
                className="mt-1.5"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                취소
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingCriteria ? "수정" : "추가"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
