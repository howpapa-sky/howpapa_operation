import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftIcon, EditIcon, TrashIcon, ClipboardListIcon } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function SampleDetail() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const sampleId = parseInt(params.id || "0");

  const { data: sample, isLoading: sampleLoading } = trpc.samples.getById.useQuery({ id: sampleId });
  const { data: evaluations, isLoading: evaluationsLoading } = trpc.evaluations.getBySample.useQuery({ sampleId });
  const { data: evaluators } = trpc.evaluators.list.useQuery();

  const deleteMutation = trpc.samples.delete.useMutation({
    onSuccess: () => {
      toast.success("샘플이 삭제되었습니다");
      setLocation("/samples");
    },
    onError: () => {
      toast.error("샘플 삭제에 실패했습니다");
    },
  });

  const handleDelete = () => {
    if (confirm("정말 이 샘플을 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id: sampleId });
    }
  };

  if (sampleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!sample) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
        <Card className="max-w-md shadow-lg border-none">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">샘플을 찾을 수 없습니다</h2>
            <Button asChild className="bg-[#93C572] hover:bg-[#78A85E]">
              <Link href="/samples">목록으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEvaluatorName = (evaluatorId: number) => {
    return evaluators?.find(e => e.id === evaluatorId)?.name || "알 수 없음";
  };

  // 평가 데이터 집계
  const evaluationsByCategory = evaluations?.reduce((acc: any, ev: any) => {
    if (!acc[ev.category]) {
      acc[ev.category] = {};
    }
    if (!acc[ev.category][ev.item]) {
      acc[ev.category][ev.item] = [];
    }
    acc[ev.category][ev.item].push(ev);
    return acc;
  }, {}) || {};

  // 카테고리별 평균 점수 계산
  const categoryAverages = Object.entries(evaluationsByCategory).map(([category, items]: [string, any]) => {
    const allScores = Object.values(items).flat().map((ev: any) => ev.score).filter((s: any) => s !== null);
    const avgScore = allScores.length > 0 ? (allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length).toFixed(1) : 0;
    return { category, avgScore: Number(avgScore) };
  });

  // 항목별 평균 점수 (레이더 차트용)
  const itemAverages = Object.entries(evaluationsByCategory).flatMap(([category, items]: [string, any]) => 
    Object.entries(items).map(([item, evals]: [string, any]) => {
      const scores = evals.map((ev: any) => ev.score).filter((s: any) => s !== null);
      const avgScore = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : 0;
      return { item, avgScore: Number(avgScore), fullMark: 5 };
    })
  ).slice(0, 8); // 최대 8개 항목만 표시

  const groupedEvaluations = evaluations?.reduce((acc, evaluation) => {
    const key = evaluation.evaluatorId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(evaluation);
    return acc;
  }, {} as Record<number, typeof evaluations>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#F5F5F5]">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/samples">
              <Button variant="ghost" size="icon" className="hover:bg-[#93C572]/10">
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#93C572] to-[#589B6A] bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button asChild className="bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white">
                <Link href={`/samples/${sampleId}/evaluate`}>
                  <ClipboardListIcon className="w-4 h-4 mr-2" />
                  평가하기
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10">
                <Link href={`/samples/${sampleId}/edit`}>
                  <EditIcon className="w-4 h-4 mr-2" />
                  수정
                </Link>
              </Button>
              <Button variant="outline" onClick={handleDelete} className="border-red-300 text-red-600 hover:bg-red-50">
                <TrashIcon className="w-4 h-4 mr-2" />
                삭제
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 샘플 기본 정보 */}
        <Card className="mb-8 border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#93C572]/10 to-[#589B6A]/10">
            <CardTitle className="text-2xl text-gray-900">샘플 정보</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">차수</p>
                <p className="text-lg font-semibold text-gray-900">{sample.round}차</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">날짜</p>
                <p className="text-lg font-semibold text-gray-900">{sample.date}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">제조사</p>
                <p className="text-lg font-semibold text-gray-900">{sample.manufacturer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">랩넘버 (샘플 코드)</p>
                <p className="text-lg font-semibold text-gray-900">{sample.labNumber}</p>
              </div>
              {sample.productName && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">제품명</p>
                  <p className="text-lg font-semibold text-gray-900">{sample.productName}</p>
                </div>
              )}
              {sample.brand && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">브랜드</p>
                  <p className="text-lg font-semibold text-gray-900">{sample.brand}</p>
                </div>
              )}
              {sample.category && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">카테고리</p>
                  <p className="text-lg font-semibold text-gray-900">{sample.category}</p>
                </div>
              )}
              {sample.memo && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">메모</p>
                  <p className="text-gray-700">{sample.memo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 평가 결과 시각화 */}
        {evaluations && evaluations.length > 0 ? (
          <>
            {/* 카테고리별 평균 점수 */}
            {categoryAverages.length > 0 && (
              <Card className="mb-8 border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#93C572]/10 to-[#589B6A]/10">
                  <CardTitle className="text-xl text-gray-900">카테고리별 평균 점수</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryAverages}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="category" stroke="#6b7280" />
                      <YAxis domain={[0, 5]} stroke="#6b7280" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="avgScore" fill="#93C572" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 항목별 평균 점수 (레이더 차트) */}
            {itemAverages.length > 0 && (
              <Card className="mb-8 border-none shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#93C572]/10 to-[#589B6A]/10">
                  <CardTitle className="text-xl text-gray-900">항목별 평가 점수</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={itemAverages}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="item" stroke="#6b7280" />
                      <PolarRadiusAxis domain={[0, 5]} stroke="#6b7280" />
                      <Radar name="평균 점수" dataKey="avgScore" stroke="#93C572" fill="#93C572" fillOpacity={0.6} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 평가자별 상세 평가 내역 */}
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#93C572]/10 to-[#589B6A]/10">
                <CardTitle className="text-xl text-gray-900">평가자별 상세 내역</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {evaluationsLoading ? (
                  <div className="text-center py-8 text-gray-500">로딩 중...</div>
                ) : (
                  <div className="space-y-8">
                    {groupedEvaluations && Object.entries(groupedEvaluations).map(([evaluatorId, evals]) => (
                      <div key={evaluatorId} className="border-b pb-6 last:border-b-0">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">{getEvaluatorName(parseInt(evaluatorId))}</h3>
                        <div className="space-y-4">
                          {evals.map((evaluation) => (
                            <div key={evaluation.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="font-semibold text-gray-800">{evaluation.category}</span>
                                  <span className="text-gray-500 mx-2">•</span>
                                  <span className="text-gray-700">{evaluation.item}</span>
                                </div>
                                {evaluation.score && (
                                  <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <svg
                                        key={star}
                                        className={`w-5 h-5 ${star <= (evaluation.score || 0) ? 'text-[#93C572] fill-current' : 'text-gray-300'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                        />
                                      </svg>
                                    ))}
                                    <span className="ml-2 text-sm font-semibold text-gray-700">{evaluation.score}/5</span>
                                  </div>
                                )}
                              </div>
                              {evaluation.comment && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">메모:</span> {evaluation.comment}
                                </div>
                              )}
                              {evaluation.improvementRequest && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">개선 요청:</span> {evaluation.improvementRequest}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-none shadow-lg">
            <CardContent className="p-16 text-center">
              <p className="text-gray-500 mb-6">아직 평가가 등록되지 않았습니다</p>
              {isAuthenticated && (
                <Button asChild className="bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white">
                  <Link href={`/samples/${sampleId}/evaluate`}>
                    <ClipboardListIcon className="w-4 h-4 mr-2" />
                    평가하기
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
