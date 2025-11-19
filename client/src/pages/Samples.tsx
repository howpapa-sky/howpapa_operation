import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Package, Plus, TrendingUp, BarChart3, Edit, Trash2, Download, History, User, Users, ClipboardList } from "lucide-react";
import EvaluatorManager from "@/components/EvaluatorManager";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ComposedChart } from 'recharts';
import * as XLSX from 'xlsx';

// 샘플 유형별 평가 항목
const EVALUATION_CRITERIA = {
  ampoule: [
    { key: 'surface_moisture', label: '겉보습', max: 5 },
    { key: 'inner_dryness', label: '속건조 개선', max: 5 },
    { key: 'finish', label: '마무리감', max: 5 },
  ],
  toner_pad: [
    { key: 'size', label: '크기', max: 5 },
    { key: 'adhesion', label: '밀착력', max: 5 },
    { key: 'material', label: '원단', max: 5 },
    { key: 'thickness', label: '두께', max: 5 },
    { key: 'moisture_content', label: '수분함량', max: 5 },
    { key: 'skin_texture', label: '피부결 정돈', max: 5 },
    { key: 'soothing', label: '진정', max: 5 },
  ],
  cream_lotion: [
    { key: 'moisturizing', label: '보습력', max: 5 },
    { key: 'scent', label: '향', max: 5 },
    { key: 'spreadability', label: '발림성', max: 5 },
    { key: 'durability', label: '지속력', max: 5 },
  ],
};

const SAMPLE_TYPES = {
  ampoule: { label: '앰플', color: 'bg-purple-100 text-purple-700', chartColor: '#9333ea' },
  toner_pad: { label: '토너패드', color: 'bg-blue-100 text-blue-700', chartColor: '#3b82f6' },
  cream_lotion: { label: '크림&로션', color: 'bg-green-100 text-green-700', chartColor: '#22c55e' },
};

export default function Samples() {
  const { user } = useSupabaseAuth();
  const [selectedType, setSelectedType] = useState<keyof typeof EVALUATION_CRITERIA | 'all'>('all');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showEvaluatorForm, setShowEvaluatorForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
  const [deletingEvaluation, setDeletingEvaluation] = useState<any>(null);
  const [viewingComparison, setViewingComparison] = useState<string | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [brand, setBrand] = useState('howpapa');
  const [comment, setComment] = useState('');
  const [evaluatorName, setEvaluatorName] = useState('');
  const [evaluatorEmail, setEvaluatorEmail] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showSamplingForm, setShowSamplingForm] = useState(false);
  const [samplingName, setSamplingName] = useState('');
  const [samplingType, setSamplingType] = useState<keyof typeof EVALUATION_CRITERIA>('ampoule');
  const [samplingBrand, setSamplingBrand] = useState('howpapa');
  const [samplingNotes, setSamplingNotes] = useState<Record<string, string>>({});
  const [samplingRequest, setSamplingRequest] = useState('');
  const queryClient = useQueryClient();

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['sample_evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sample_evaluations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: evaluators = [] } = useQuery({
    queryKey: ['evaluators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evaluators')
        .select('*')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: samplingReviews = [] } = useQuery({
    queryKey: ['sampling_reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sampling_reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const createEvaluationMutation = useMutation({
    mutationFn: async (newEvaluation: any) => {
      const { data, error } = await supabase
        .from('sample_evaluations')
        .insert([newEvaluation])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample_evaluations'] });
      resetForm();
    }
  });

  const createEvaluatorMutation = useMutation({
    mutationFn: async (newEvaluator: any) => {
      const { data, error } = await supabase
        .from('evaluators')
        .insert([newEvaluator])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluators'] });
      setShowEvaluatorForm(false);
      setEvaluatorName('');
      setEvaluatorEmail('');
    }
  });

  const updateEvaluationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('sample_evaluations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample_evaluations'] });
      resetForm();
    }
  });

  const deleteEvaluationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sample_evaluations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sample_evaluations'] });
      setDeletingEvaluation(null);
    }
  });

  const createSamplingReviewMutation = useMutation({
    mutationFn: async (newReview: any) => {
      const { data, error } = await supabase
        .from('sampling_reviews')
        .insert([newReview])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sampling_reviews'] });
      resetSamplingForm();
    }
  });

  const resetForm = () => {
    setShowEvaluationForm(false);
    setEditingEvaluation(null);
    setSampleName('');
    setComment('');
    setScores({});
  };

  const resetSamplingForm = () => {
    setShowSamplingForm(false);
    setSamplingName('');
    setSamplingType('ampoule');
    setSamplingBrand('howpapa');
    setSamplingNotes({});
    setSamplingRequest('');
  };

  const handleSamplingSubmit = () => {
    if (!samplingName.trim()) return;

    const newReview = {
      sample_name: samplingName,
      sample_type: samplingType,
      brand: samplingBrand,
      notes: samplingNotes,
      improvement_request: samplingRequest,
      created_at: new Date().toISOString(),
    };

    createSamplingReviewMutation.mutate(newReview);
  };

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: Math.min(Math.max(value, 0), 5) }));
  };

  const handleSubmit = () => {
    const type = selectedType === 'all' ? 'ampoule' : selectedType;
    const criteria = EVALUATION_CRITERIA[type as keyof typeof EVALUATION_CRITERIA];
    const totalScore = criteria.reduce((sum, item) => sum + (scores[item.key] || 0), 0);
    const maxScore = criteria.reduce((sum, item) => sum + item.max, 0);

    const evaluationData = {
      sample_name: sampleName,
      sample_type: type,
      brand: brand,
      scores: scores,
      total_score: totalScore,
      max_score: maxScore,
      evaluator_id: user?.id,
      evaluator_name: user?.email || '익명',
      comment: comment || null,
    };

    if (editingEvaluation) {
      updateEvaluationMutation.mutate({
        id: editingEvaluation.id,
        updates: { ...evaluationData, updated_at: new Date().toISOString() }
      });
    } else {
      createEvaluationMutation.mutate(evaluationData);
    }
  };

  const handleEvaluatorSubmit = () => {
    createEvaluatorMutation.mutate({
      name: evaluatorName,
      email: evaluatorEmail,
    });
  };

  const handleEdit = (evaluation: any) => {
    setEditingEvaluation(evaluation);
    setSampleName(evaluation.sample_name);
    setBrand(evaluation.brand);
    setComment(evaluation.comment || '');
    setScores(evaluation.scores);
    setSelectedType(evaluation.sample_type);
    setShowEvaluationForm(true);
  };

  const handleDelete = (evaluation: any) => {
    setDeletingEvaluation(evaluation);
  };

  const confirmDelete = () => {
    if (deletingEvaluation) {
      deleteEvaluationMutation.mutate(deletingEvaluation.id);
    }
  };

  const filteredEvaluations = selectedType === 'all' 
    ? evaluations 
    : evaluations.filter((evaluation: any) => evaluation.sample_type === selectedType);

  // 샘플명별로 그룹화
  const groupedBySampleName = filteredEvaluations.reduce((acc: any, evaluation: any) => {
    const name = evaluation.sample_name;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(evaluation);
    return acc;
  }, {});

  // 평균 점수 계산
  const averageScores = Object.entries(groupedBySampleName).map(([name, evals]: [string, any]) => {
    const sampleType = evals[0].sample_type;
    const criteria = EVALUATION_CRITERIA[sampleType as keyof typeof EVALUATION_CRITERIA] || [];
    const avgScores: any = {};
    
    criteria.forEach(item => {
      const sum = evals.reduce((s: number, e: any) => s + (e.scores[item.key] || 0), 0);
      avgScores[item.key] = sum / evals.length;
    });

    const totalScore = evals.reduce((s: number, e: any) => s + e.total_score, 0) / evals.length;
    const maxScore = evals[0].max_score;

    return {
      name,
      sampleType,
      avgScores,
      totalScore,
      maxScore,
      count: evals.length,
      brand: evals[0].brand,
      evaluations: evals,
    };
  });

  const getRadarData = (evaluation: any) => {
    const criteria = EVALUATION_CRITERIA[evaluation.sample_type as keyof typeof EVALUATION_CRITERIA] || [];
    return criteria.map(item => ({
      subject: item.label,
      score: evaluation.scores?.[item.key] || 0,
      fullMark: item.max,
    }));
  };

  const getComparisonData = (sampleName: string) => {
    const sampleEvals = groupedBySampleName[sampleName];
    if (!sampleEvals || sampleEvals.length === 0) return [];

    const criteria = EVALUATION_CRITERIA[sampleEvals[0].sample_type as keyof typeof EVALUATION_CRITERIA] || [];
    
    return criteria.map(item => {
      const dataPoint: any = { criterion: item.label };
        sampleEvals.forEach((evaluation: any, index: number) => {
          dataPoint[`평가${index + 1}`] = evaluation.scores[item.key] || 0;
          dataPoint[`evaluator${index + 1}`] = evaluation.evaluator_name;
      });
      return dataPoint;
    });
  };

  const exportToExcel = () => {
    const exportData = filteredEvaluations.map((evaluation: any) => {
      const criteria = EVALUATION_CRITERIA[evaluation.sample_type as keyof typeof EVALUATION_CRITERIA] || [];
      const row: any = {
        '샘플명': evaluation.sample_name,
        '브랜드': evaluation.brand === 'howpapa' ? '하우파파' : '누씨오',
        '유형': SAMPLE_TYPES[evaluation.sample_type as keyof typeof SAMPLE_TYPES].label,
        '평가자': evaluation.evaluator_name,
        '평가일': new Date(evaluation.created_at).toLocaleDateString(),
        '총점': evaluation.total_score,
        '만점': evaluation.max_score,
        '백분율': `${Math.round((evaluation.total_score / evaluation.max_score) * 100)}%`,
        '코멘트': evaluation.comment || '',
      };

      criteria.forEach(item => {
        row[item.label] = evaluation.scores[item.key] || 0;
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '샘플 평가');
    XLSX.writeFile(wb, `샘플평가_${selectedType === 'all' ? '전체' : SAMPLE_TYPES[selectedType as keyof typeof SAMPLE_TYPES].label}_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <PageLayout title="샘플 평가 관리">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">샘플 평가 관리</h1>
            <p className="text-gray-600">제품 샘플을 평가하고 결과를 분석합니다</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => setShowEvaluatorForm(true)}
              variant="outline"
              className="shadow-md"
            >
              <Users className="w-4 h-4 mr-2" />
              평가자 관리
            </Button>
            <Button 
              onClick={exportToExcel}
              variant="outline"
              className="shadow-md"
              disabled={filteredEvaluations.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              엑셀 내보내기
            </Button>
            <Button 
              onClick={() => {
                resetForm();
                setShowEvaluationForm(true);
              }}
              className="bg-[#93C572] hover:bg-[#7FB05B] shadow-md"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 평가 등록
            </Button>
          </div>
        </div>

        {/* 평가자 관리 다이얼로그 */}
        <Dialog open={showEvaluatorForm} onOpenChange={setShowEvaluatorForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>평가자 관리</DialogTitle>
              <DialogDescription>
                평가자를 등록하고 관리합니다.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>평가자 이름</Label>
                <Input
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <Label>이메일 (선택)</Label>
                <Input
                  type="email"
                  value={evaluatorEmail}
                  onChange={(e) => setEvaluatorEmail(e.target.value)}
                  placeholder="hong@example.com"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">등록된 평가자</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {evaluators.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">등록된 평가자가 없습니다</p>
                  ) : (
                    evaluators.map((evaluator: any) => (
                      <div key={evaluator.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{evaluator.name}</p>
                          {evaluator.email && <p className="text-xs text-gray-500">{evaluator.email}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEvaluatorForm(false)}>
                닫기
              </Button>
              <Button 
                onClick={handleEvaluatorSubmit}
                disabled={!evaluatorName}
                className="bg-[#93C572] hover:bg-[#7FB05B]"
              >
                평가자 추가
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 샘플링 리뷰 폼 */}
        <Dialog open={showSamplingForm} onOpenChange={(open) => !open && resetSamplingForm()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>샘플링 품평 기준 작성</DialogTitle>
              <DialogDescription>
                샘플에 대한 품평 기준과 항목별 메모를 작성합니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>샘플명</Label>
                  <Input
                    value={samplingName}
                    onChange={(e) => setSamplingName(e.target.value)}
                    placeholder="예: 누씨오 토너패드 v3"
                  />
                </div>
                <div>
                  <Label>샘플 유형</Label>
                  <select
                    value={samplingType}
                    onChange={(e) => {
                      setSamplingType(e.target.value as keyof typeof EVALUATION_CRITERIA);
                      setSamplingNotes({});
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="ampoule">앰플</option>
                    <option value="toner_pad">토너패드</option>
                    <option value="cream_lotion">크림&로션</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>브랜드</Label>
                <select
                  value={samplingBrand}
                  onChange={(e) => setSamplingBrand(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="howpapa">하우파파</option>
                  <option value="nucio">누씨오</option>
                </select>
              </div>

              {/* 품평 기준 표 */}
              <div>
                <h4 className="font-semibold mb-3">품평 기준 및 항목별 메모</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">평가 항목</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">메모</th>
                      </tr>
                    </thead>
                    <tbody>
                      {EVALUATION_CRITERIA[samplingType].map((item) => (
                        <tr key={item.key} className="border-t">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700">
                            {item.label}
                          </td>
                          <td className="px-4 py-3">
                            <Input
                              value={samplingNotes[item.key] || ''}
                              onChange={(e) => setSamplingNotes(prev => ({ ...prev, [item.key]: e.target.value }))}
                              placeholder="한 줄 메모를 입력하세요"
                              className="w-full"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 유지/개선 요청 사항 */}
              <div>
                <Label>유지/개선 요청 사항</Label>
                <Textarea
                  value={samplingRequest}
                  onChange={(e) => setSamplingRequest(e.target.value)}
                  placeholder="샘플에 대한 전반적인 유지/개선 요청 사항을 작성하세요"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetSamplingForm}>
                취소
              </Button>
              <Button
                onClick={handleSamplingSubmit}
                disabled={!samplingName.trim()}
                className="bg-[#93C572] hover:bg-[#7FB05B]"
              >
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 평가 등록/수정 폼 */}
        <Dialog open={showEvaluationForm} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEvaluation ? '평가 수정' : '샘플 평가 등록'}</DialogTitle>
              <DialogDescription>
                샘플 정보와 평가 점수를 입력해주세요.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>샘플명</Label>
                  <Input
                    value={sampleName}
                    onChange={(e) => setSampleName(e.target.value)}
                    placeholder="예: 누씨오 토너패드 v2"
                  />
                </div>
                <div>
                  <Label>브랜드</Label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    <option value="howpapa">하우파파</option>
                    <option value="nusio">누씨오</option>
                  </select>
                </div>
                <div>
                  <Label>샘플 유형</Label>
                  <select
                    value={selectedType === 'all' ? 'ampoule' : selectedType}
                    onChange={(e) => setSelectedType(e.target.value as keyof typeof EVALUATION_CRITERIA)}
                    className="w-full h-10 px-3 border rounded-md"
                    disabled={!!editingEvaluation}
                  >
                    {Object.entries(SAMPLE_TYPES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>평가자</Label>
                  <select
                    value={evaluatorName}
                    onChange={(e) => setEvaluatorName(e.target.value)}
                    className="w-full h-10 px-3 border rounded-md"
                  >
                    <option value="">평가자 선택</option>
                    {evaluators.map((evaluator: any) => (
                      <option key={evaluator.id} value={evaluator.name}>{evaluator.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label>코멘트</Label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="평가에 대한 추가 의견을 입력하세요..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">평가 항목 (1-5점)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {EVALUATION_CRITERIA[selectedType === 'all' ? 'ampoule' : selectedType as keyof typeof EVALUATION_CRITERIA].map((item) => (
                    <div key={item.key}>
                      <Label>{item.label}</Label>
                      <Input
                        type="number"
                        min="0"
                        max={item.max}
                        value={scores[item.key] || ''}
                        onChange={(e) => handleScoreChange(item.key, parseInt(e.target.value) || 0)}
                        placeholder={`0-${item.max}점`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                취소
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!sampleName || Object.keys(scores).length === 0}
                className="bg-[#93C572] hover:bg-[#7FB05B]"
              >
                {editingEvaluation ? '수정' : '등록'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 삭제 확인 다이얼로그 */}
        <AlertDialog open={!!deletingEvaluation} onOpenChange={() => setDeletingEvaluation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>평가 삭제</AlertDialogTitle>
              <AlertDialogDescription>
                정말로 이 평가를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 비교 그래프 다이얼로그 */}
        <Dialog open={!!viewingComparison} onOpenChange={() => setViewingComparison(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>평가 비교: {viewingComparison}</DialogTitle>
              <DialogDescription>
                동일 샘플의 여러 평가를 비교합니다.
              </DialogDescription>
            </DialogHeader>
            
            {viewingComparison && groupedBySampleName[viewingComparison] && (
              <div className="space-y-6">
                {/* 평가 지표별 비교 차트 */}
                <div>
                  <h4 className="font-semibold mb-3">평가 지표별 비교</h4>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={getComparisonData(viewingComparison)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="criterion" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                        {groupedBySampleName[viewingComparison].map((evaluation: any, index: number) => (
                        <Bar 
                          key={index} 
                          dataKey={`평가${index + 1}`} 
                          fill={`hsl(${index * 60}, 70%, 50%)`}
                          name={`${eval.evaluator_name} (${new Date(eval.created_at).toLocaleDateString()})`}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 개별 평가 레이더 차트 */}
                <div>
                  <h4 className="font-semibold mb-3">개별 평가 상세</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedBySampleName[viewingComparison].map((evaluation: any, index: number) => (
                      <Card key={evaluation.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            평가 {index + 1} - {evaluation.evaluator_name}
                          </CardTitle>
                          <p className="text-xs text-gray-500">
                            {new Date(evaluation.created_at).toLocaleString()}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={getRadarData(evaluation)}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis domain={[0, 5]} />
                              <Radar
                                name="점수"
                                dataKey="score"
                                stroke={SAMPLE_TYPES[evaluation.sample_type as keyof typeof SAMPLE_TYPES].chartColor}
                                fill={SAMPLE_TYPES[evaluation.sample_type as keyof typeof SAMPLE_TYPES].chartColor}
                                fillOpacity={0.6}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                          <div className="mt-4 text-center">
                            <div className="text-2xl font-bold text-[#93C572]">
                              {evaluation.total_score}/{evaluation.max_score}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.round((evaluation.total_score / evaluation.max_score) * 100)}%
                            </div>
                            {evaluation.comment && (
                              <p className="mt-2 text-sm text-gray-600 italic">"{evaluation.comment}"</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 탭 */}        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as any)} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="grid grid-cols-6 w-full max-w-3xl">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="ampoule">앰플</TabsTrigger>
              <TabsTrigger value="toner_pad">토너패드</TabsTrigger>
              <TabsTrigger value="cream_lotion">크림&로션</TabsTrigger>
              <TabsTrigger value="sampling">샘플링 리뷰</TabsTrigger>
              <TabsTrigger value="evaluators">평가자 관리</TabsTrigger>
            </TabsList>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 평가 수</CardTitle>
                <BarChart3 className="h-4 w-4 text-[#93C572]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredEvaluations.length}</div>
                <p className="text-xs text-gray-500">
                  샘플 {Object.keys(groupedBySampleName).length}개
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#93C572]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredEvaluations.length > 0
                    ? Math.round(
                        (filteredEvaluations.reduce((sum: number, e: any) => sum + (e.total_score / e.max_score) * 100, 0) /
                          filteredEvaluations.length)
                      )
                    : 0}
                  %
                </div>
                <p className="text-xs text-gray-500">전체 평가 평균</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평가자 수</CardTitle>
                <Users className="h-4 w-4 text-[#93C572]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(filteredEvaluations.map((e: any) => e.evaluator_id)).size}
                </div>
                <p className="text-xs text-gray-500">참여 평가자</p>
              </CardContent>
            </Card>
          </div>

          {/* 평균 점수 비교 차트 */}
          {averageScores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>평균 점수 비교 (여러 평가자의 평균)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={averageScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border rounded shadow-lg">
                              <p className="font-semibold">{data.name}</p>
                              <p className="text-sm">평균: {Math.round(data.totalScore * 10) / 10}/{data.maxScore}</p>
                              <p className="text-sm">평가 수: {data.count}개</p>
                              <p className="text-sm">백분율: {Math.round((data.totalScore / data.maxScore) * 100)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="totalScore" 
                      fill="#93C572" 
                      name="평균 점수"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* 평가 목록 */}
          <TabsContent value={selectedType} className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto"></div>
                <p className="mt-4 text-gray-600">평가 데이터를 불러오는 중...</p>
              </div>
            ) : Object.keys(groupedBySampleName).length === 0 ? (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">평가가 없습니다</h3>
                <p className="text-gray-500 mb-4">새로운 샘플 평가를 등록해보세요</p>
                <Button 
                  onClick={() => {
                    resetForm();
                    setShowEvaluationForm(true);
                  }}
                  className="bg-[#93C572] hover:bg-[#7FB05B]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  평가 등록
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedBySampleName).map(([sampleName, evals]: [string, any]) => {
                  const avgData = averageScores.find(a => a.name === sampleName);
                  if (!avgData) return null;

                  return (
                    <Card key={sampleName} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg mb-2">{sampleName}</CardTitle>
                            <div className="flex gap-2 flex-wrap">
                              <Badge className={SAMPLE_TYPES[avgData.sampleType as keyof typeof SAMPLE_TYPES].color}>
                                {SAMPLE_TYPES[avgData.sampleType as keyof typeof SAMPLE_TYPES].label}
                              </Badge>
                              <Badge variant="outline">
                                {avgData.brand === 'howpapa' ? '하우파파' : '누씨오'}
                              </Badge>
                              <Badge variant="secondary">
                                평가 {avgData.count}개
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* 평균 점수 */}
                          <div className="text-center p-4 bg-gradient-to-br from-[#93C572]/10 to-[#93C572]/5 rounded-lg">
                            <div className="text-3xl font-bold text-[#93C572]">
                              {Math.round(avgData.totalScore * 10) / 10}
                            </div>
                            <div className="text-sm text-gray-600">
                              / {avgData.maxScore} ({Math.round((avgData.totalScore / avgData.maxScore) * 100)}%)
                            </div>
                            <div className="text-xs text-gray-500 mt-1">평균 점수</div>
                          </div>

                          {/* 평가 지표별 평균 */}
                          <div className="space-y-2">
                            {EVALUATION_CRITERIA[avgData.sampleType as keyof typeof EVALUATION_CRITERIA].map((item) => (
                              <div key={item.key} className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 w-20">{item.label}</span>
                                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-[#93C572] transition-all"
                                    style={{ width: `${(avgData.avgScores[item.key] / item.max) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-12 text-right">
                                  {Math.round(avgData.avgScores[item.key] * 10) / 10}/{item.max}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* 액션 버튼 */}
                          <div className="flex gap-2 pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setViewingComparison(sampleName)}
                            >
                              <History className="w-4 h-4 mr-1" />
                              비교
                            </Button>
                            {evals.length === 1 && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(evals[0])}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(evals[0])}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>

                          {/* 평가자 정보 */}
                          <div className="text-xs text-gray-500 pt-2 border-t">
                            <div className="flex items-center gap-1 flex-wrap">
                              <User className="w-3 h-3" />
                              {evals.map((e: any, i: number) => (
                                <span key={i}>
                                  {e.evaluator_name}
                                  {i < evals.length - 1 && ', '}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 샘플링 리뷰 탭 */}
          <TabsContent value="sampling">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">샘플링 품평 기준</h3>
                  <p className="text-sm text-gray-600">샘플에 대한 품평 기준과 메모를 작성합니다</p>
                </div>
                <Button
                  onClick={() => setShowSamplingForm(true)}
                  className="bg-[#93C572] hover:bg-[#7FB05B]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 샘플링 리뷰 작성
                </Button>
              </div>

              {/* 샘플링 리뷰 목록 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {samplingReviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{review.sample_name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={SAMPLE_TYPES[review.sample_type as keyof typeof SAMPLE_TYPES].color}>
                              {SAMPLE_TYPES[review.sample_type as keyof typeof SAMPLE_TYPES].label}
                            </Badge>
                            <Badge variant="outline">
                              {review.brand === 'howpapa' ? '하우파파' : '누씨오'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* 평가 항목별 메모 */}
                        <div>
                          <h4 className="font-semibold text-sm mb-2">평가 항목별 메모</h4>
                          <div className="space-y-1">
                            {EVALUATION_CRITERIA[review.sample_type as keyof typeof EVALUATION_CRITERIA].map((item) => (
                              review.notes[item.key] && (
                                <div key={item.key} className="text-sm">
                                  <span className="font-medium text-gray-700">{item.label}:</span>
                                  <span className="text-gray-600 ml-2">{review.notes[item.key]}</span>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* 유지/개선 요청 사항 */}
                        {review.improvement_request && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">유지/개선 요청 사항</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {review.improvement_request}
                            </p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 pt-2 border-t">
                          {new Date(review.created_at).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {samplingReviews.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>등록된 샘플링 리뷰가 없습니다.</p>
                    <p className="text-sm mt-1">새 샘플링 리뷰를 작성해보세요.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* 평가자 관리 탭 */}
          <TabsContent value="evaluators">
            <EvaluatorManager />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
