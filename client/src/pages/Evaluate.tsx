import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";

interface EvaluationFormData {
  evaluatorId: number | null;
  category: string;
  item: string;
  score: number | null;
  comment: string;
  improvementRequest: string;
}

export default function Evaluate() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const sampleId = parseInt(params.sampleId || "0");

  const { data: sample } = trpc.samples.getById.useQuery({ id: sampleId });
  const { data: evaluators } = trpc.evaluators.list.useQuery();
  const { data: criteria } = trpc.criteria.list.useQuery();

  const [selectedEvaluator, setSelectedEvaluator] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<EvaluationFormData[]>([]);

  const createMutation = trpc.evaluations.create.useMutation();

  const utils = trpc.useUtils();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvaluator) {
      toast.error("평가자를 선택해주세요.");
      return;
    }

    if (evaluations.length === 0) {
      toast.error("최소 하나 이상의 평가를 입력해주세요.");
      return;
    }

    try {
      for (const evaluation of evaluations) {
        if (evaluation.category && evaluation.item) {
          await createMutation.mutateAsync({
            sampleId,
            category: evaluation.category,
            item: evaluation.item,
            score: evaluation.score || undefined,
            comment: evaluation.comment || undefined,
            improvementRequest: evaluation.improvementRequest || undefined,
          });
        }
      }
      
      await utils.evaluations.getBySample.invalidate({ sampleId });
      toast.success("평가가 저장되었습니다.");
      setLocation(`/samples/${sampleId}`);
    } catch (error: any) {
      toast.error("평가 저장에 실패했습니다: " + error.message);
    }
  };

  const addEvaluation = (category: string, item: string) => {
    if (!selectedEvaluator) {
      toast.error("먼저 평가자를 선택해주세요.");
      return;
    }

    const exists = evaluations.find(e => e.category === category && e.item === item);
    if (exists) {
      toast.error("이미 추가된 평가 항목입니다.");
      return;
    }

    setEvaluations([
      ...evaluations,
      {
        evaluatorId: selectedEvaluator,
        category,
        item,
        score: null,
        comment: "",
        improvementRequest: "",
      },
    ]);
  };

  const updateEvaluation = (index: number, field: keyof EvaluationFormData, value: any) => {
    const updated = [...evaluations];
    updated[index] = { ...updated[index], [field]: value };
    setEvaluations(updated);
  };

  const removeEvaluation = (index: number) => {
    setEvaluations(evaluations.filter((_, i) => i !== index));
  };

  const getCriteriaByCategory = (category: string) => {
    return criteria?.filter(c => c.category === category) || [];
  };

  const categories = ["앰플", "시트", "피부효과"];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/samples/${sampleId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>샘플 평가 입력</CardTitle>
            {sample && (
              <p className="text-sm text-gray-500">
                {sample.round}차 - {sample.labNumber} ({sample.date})
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label>평가자 선택</Label>
              <Select
                value={selectedEvaluator?.toString()}
                onValueChange={(value) => setSelectedEvaluator(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="평가자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {evaluators?.map((evaluator) => (
                    <SelectItem key={evaluator.id} value={evaluator.id.toString()}>
                      {evaluator.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">평가 항목 추가</h3>
              {categories.map((category) => (
                <div key={category} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {getCriteriaByCategory(category).map((criterion) => (
                      <Button
                        key={criterion.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addEvaluation(category, criterion.item)}
                        disabled={!selectedEvaluator}
                      >
                        + {criterion.item}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {evaluations.length > 0 && (
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>평가 내용 입력</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {evaluations.map((evaluation, index) => {
                  const criterion = criteria?.find(
                    c => c.category === evaluation.category && c.item === evaluation.item
                  );

                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{evaluation.category} - {evaluation.item}</h4>
                          {criterion && (
                            <div className="text-xs text-gray-500 mt-2 space-y-1">
                              <p>1점: {criterion.score1Desc}</p>
                              <p>3점: {criterion.score3Desc}</p>
                              <p>5점: {criterion.score5Desc}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvaluation(index)}
                        >
                          제거
                        </Button>
                      </div>

                      <div>
                        <Label>점수 (1-5)</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <Button
                              key={score}
                              type="button"
                              variant={evaluation.score === score ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateEvaluation(index, "score", score)}
                            >
                              {score}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label>한 줄 메모</Label>
                        <Textarea
                          value={evaluation.comment}
                          onChange={(e) => updateEvaluation(index, "comment", e.target.value)}
                          placeholder="평가에 대한 상세한 의견을 입력하세요"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label>유지 및 개선 요청</Label>
                        <Textarea
                          value={evaluation.improvementRequest}
                          onChange={(e) => updateEvaluation(index, "improvementRequest", e.target.value)}
                          placeholder="개선이 필요한 사항을 입력하세요"
                          rows={2}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <div className="flex gap-3 justify-end">
              <Link href={`/samples/${sampleId}`}>
                <Button type="button" variant="outline">취소</Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "저장 중..." : "평가 저장"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
