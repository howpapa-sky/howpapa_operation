import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftIcon, StarIcon } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { EVALUATION_ITEMS_BY_CATEGORY } from "../../../shared/evaluationData";

const CATEGORIES = Object.keys(EVALUATION_ITEMS_BY_CATEGORY) as Array<keyof typeof EVALUATION_ITEMS_BY_CATEGORY>;

export default function EvaluateForm() {
  const { user, isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: sample } = trpc.samples.getById.useQuery({ id: Number(id) });
  
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof EVALUATION_ITEMS_BY_CATEGORY>("토너패드");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [oneLinerMemo, setOneLinerMemo] = useState("");
  const [improvementRequest, setImprovementRequest] = useState("");

  const createEvaluationMutation = trpc.evaluations.create.useMutation({
    onSuccess: () => {
      toast.success("평가가 등록되었습니다");
      navigate(`/samples/${id}`);
    },
    onError: () => {
      toast.error("평가 등록에 실패했습니다");
    },
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
        <Card className="max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h2>
            <Button asChild className="bg-[#93C572] hover:bg-[#78A85E]">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const items = EVALUATION_ITEMS_BY_CATEGORY[selectedCategory];
    const missingScores = items.filter(item => !scores[item.name]);
    
    if (missingScores.length > 0) {
      toast.error("모든 평가 항목에 점수를 입력해주세요");
      return;
    }

    // 각 평가 항목별로 평가 데이터 생성
    const evaluations = items.map(item => ({
      sampleId: Number(id),
      category: selectedCategory,
      item: item.name,
      score: scores[item.name],
      comment: oneLinerMemo || undefined,
      improvementRequest: improvementRequest || undefined,
    }));

    // 모든 평가 항목을 순차적으로 저장
    Promise.all(evaluations.map(ev => createEvaluationMutation.mutateAsync(ev)))
      .then(() => {
        toast.success("평가가 등록되었습니다");
        navigate(`/samples/${id}`);
      })
      .catch(() => {
        toast.error("평가 등록에 실패했습니다");
      });
  };

  const renderStarRating = (itemName: string, currentScore: number) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => setScores({ ...scores, [itemName]: score })}
            className="transition-transform hover:scale-110"
          >
            <StarIcon
              className={`w-8 h-8 ${
                score <= currentScore
                  ? "fill-[#93C572] text-[#93C572]"
                  : "fill-gray-200 text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const items = EVALUATION_ITEMS_BY_CATEGORY[selectedCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={`/samples/${id}`}>
              <Button variant="ghost" size="icon" className="hover:bg-[#93C572]/10">
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#93C572] to-[#589B6A] bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="border-none shadow-lg mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">샘플 평가 입력</h2>
            {sample && (
              <div className="text-gray-600">
                <p>{sample.round}차 - {sample.labNumber}</p>
                {sample.productName && <p className="text-sm">{sample.productName}</p>}
              </div>
            )}
            <div className="mt-4 p-3 bg-[#93C572]/10 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>평가자:</strong> {user.name || user.email}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 카테고리 탭 */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  카테고리 선택 <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
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

              {/* 평가 항목 */}
              <div className="space-y-6 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  {selectedCategory} 평가 항목
                </h3>
                
                {items.map((item) => (
                  <div key={item.name} className="p-4 bg-gray-50 rounded-lg">
                    <Label className="text-base font-medium text-gray-900 mb-3 block">
                      {item.name} <span className="text-red-500">*</span>
                    </Label>
                    
                    {/* 별점 */}
                    <div className="mb-3">
                      {renderStarRating(item.name, scores[item.name] || 0)}
                    </div>

                    {/* 점수별 설명 */}
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="font-semibold">1점:</span> {item.score1}
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="font-semibold">3점:</span> {item.score3}
                      </div>
                      <div className="p-2 bg-white rounded border border-gray-200">
                        <span className="font-semibold">5점:</span> {item.score5}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 한 줄 메모 */}
              <div>
                <Label htmlFor="oneLinerMemo" className="text-base font-medium text-gray-900">
                  한 줄 메모
                </Label>
                <Textarea
                  id="oneLinerMemo"
                  value={oneLinerMemo}
                  onChange={(e) => setOneLinerMemo(e.target.value)}
                  placeholder="샘플에 대한 간단한 의견을 입력하세요"
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* 유지 및 개선 요청 */}
              <div>
                <Label htmlFor="improvementRequest" className="text-base font-medium text-gray-900">
                  유지 및 개선 요청
                </Label>
                <Textarea
                  id="improvementRequest"
                  value={improvementRequest}
                  onChange={(e) => setImprovementRequest(e.target.value)}
                  placeholder="유지하거나 개선이 필요한 사항을 입력하세요"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/samples/${id}`)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white"
                  disabled={createEvaluationMutation.isPending}
                >
                  평가 제출
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
