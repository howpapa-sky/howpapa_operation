import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Link } from "wouter";
import { 
  FolderKanban, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  Package,
  FileText,
  Users,
  ArrowRight,
  Plus,
  BarChart3,
  Edit,
  Trash2,
  Download,
  History,
  User
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';
import * as XLSX from 'xlsx';

const COLORS = {
  sampling: '#8B5CF6',
  detail_page: '#3B82F6',
  new_product: '#10B981',
  influencer: '#F59E0B',
};

const STATUS_COLORS = {
  pending: '#6B7280',
  in_progress: '#3B82F6',
  completed: '#10B981',
  on_hold: '#F59E0B',
};

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
  ampoule: { label: '앰플', color: 'bg-purple-100 text-purple-700' },
  toner_pad: { label: '토너패드', color: 'bg-blue-100 text-blue-700' },
  cream_lotion: { label: '크림&로션', color: 'bg-green-100 text-green-700' },
};

export default function Dashboard() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();

  // 프로젝트 관련 상태
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // 샘플 평가 관련 상태
  const [selectedType, setSelectedType] = useState<keyof typeof EVALUATION_CRITERIA>('ampoule');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
  const [deletingEvaluation, setDeletingEvaluation] = useState<any>(null);
  const [viewingHistory, setViewingHistory] = useState<string | null>(null);
  const [sampleName, setSampleName] = useState('');
  const [brand, setBrand] = useState('howpapa');
  const [comment, setComment] = useState('');
  const [scores, setScores] = useState<Record<string, number>>({});

  const { data: evaluations = [], isLoading: evaluationsLoading } = useQuery({
    queryKey: ['sample_evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sample_evaluations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
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

  const resetForm = () => {
    setShowEvaluationForm(false);
    setEditingEvaluation(null);
    setSampleName('');
    setComment('');
    setScores({});
  };

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: Math.min(Math.max(value, 0), 5) }));
  };

  const handleSubmit = () => {
    const criteria = EVALUATION_CRITERIA[selectedType];
    const totalScore = criteria.reduce((sum, item) => sum + (scores[item.key] || 0), 0);
    const maxScore = criteria.reduce((sum, item) => sum + item.max, 0);

    const evaluationData = {
      sample_name: sampleName,
      sample_type: selectedType,
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

  const exportToExcel = () => {
    const filteredEvaluations = evaluations.filter((evaluation: any) => evaluation.sample_type === selectedType);
    const exportData = filteredEvaluations.map((evaluation: any) => {
      const criteria = EVALUATION_CRITERIA[evaluation.sample_type as keyof typeof EVALUATION_CRITERIA];
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
    XLSX.writeFile(wb, `샘플평가_${SAMPLE_TYPES[selectedType].label}_${new Date().toLocaleDateString()}.xlsx`);
  };

  // 프로젝트 통계 계산
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p: any) => p.status === 'in_progress').length;
  const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
  const overdueProjects = projects.filter((p: any) => {
    if (!p.target_date || p.status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(p.target_date);
    target.setHours(0, 0, 0, 0);
    return target < today;
  }).length;

  const projectsByType = {
    sampling: projects.filter((p: any) => p.type === 'sampling').length,
    detail_page: projects.filter((p: any) => p.type === 'detail_page').length,
    new_product: projects.filter((p: any) => p.type === 'new_product').length,
    influencer: projects.filter((p: any) => p.type === 'influencer').length,
  };

  const projectsByStatus = {
    pending: projects.filter((p: any) => p.status === 'pending').length,
    in_progress: inProgressProjects,
    completed: completedProjects,
    on_hold: projects.filter((p: any) => p.status === 'on_hold').length,
  };

  const urgentProjects = projects.filter((p: any) => p.priority === 'urgent').length;
  const highProjects = projects.filter((p: any) => p.priority === 'high').length;
  const recentProjects = projects.slice(0, 5);

  const typeChartData = [
    { name: '샘플링', value: projectsByType.sampling, color: COLORS.sampling },
    { name: '상세페이지', value: projectsByType.detail_page, color: COLORS.detail_page },
    { name: '신제품', value: projectsByType.new_product, color: COLORS.new_product },
    { name: '인플루언서', value: projectsByType.influencer, color: COLORS.influencer },
  ];

  const statusChartData = [
    { name: '진행 전', value: projectsByStatus.pending },
    { name: '진행 중', value: projectsByStatus.in_progress },
    { name: '완료', value: projectsByStatus.completed },
    { name: '보류', value: projectsByStatus.on_hold },
  ];

  // 샘플 평가 통계
  const filteredEvaluations = evaluations.filter((evaluation: any) => evaluation.sample_type === selectedType);
  
  const groupedBySampleName = filteredEvaluations.reduce((acc: any, evaluation: any) => {
    const name = evaluation.sample_name;
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(evaluation);
    return acc;
  }, {});

  const averageScores = Object.entries(groupedBySampleName).map(([name, evals]: [string, any]) => {
    const criteria = EVALUATION_CRITERIA[selectedType];
    const avgScores: any = {};
    
    criteria.forEach(item => {
      const sum = evals.reduce((s: number, e: any) => s + (e.scores[item.key] || 0), 0);
      avgScores[item.key] = sum / evals.length;
    });

    const totalScore = evals.reduce((s: number, e: any) => s + e.total_score, 0) / evals.length;
    const maxScore = evals[0].max_score;

    return {
      name,
      avgScores,
      totalScore,
      maxScore,
      count: evals.length,
      brand: evals[0].brand,
    };
  });

  const getRadarData = (evaluation: any) => {
    const criteria = EVALUATION_CRITERIA[evaluation.sample_type as keyof typeof EVALUATION_CRITERIA];
    return criteria.map(item => ({
      subject: item.label,
      score: evaluation.scores?.[item.key] || 0,
      fullMark: item.max,
    }));
  };

  const getBarChartData = () => {
    return averageScores.map((item: any) => ({
      name: item.name,
      score: Math.round(item.totalScore * 10) / 10,
      percentage: Math.round((item.totalScore / item.maxScore) * 100),
    }));
  };

  const getHistoryData = (sampleName: string) => {
    const history = evaluations
      .filter((e: any) => e.sample_name === sampleName && e.sample_type === selectedType)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return history.map((e: any, index: number) => ({
      version: `v${index + 1}`,
      score: e.total_score,
      date: new Date(e.created_at).toLocaleDateString(),
      evaluator: e.evaluator_name,
    }));
  };

  if (projectsLoading || evaluationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout showBackButton={false}>
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">대시보드</h1>
            <p className="text-gray-600">프로젝트 현황과 샘플 평가를 한눈에 확인하세요</p>
          </div>
          <Link href="/projects/new">
            <Button className="bg-[#93C572] hover:bg-[#7FB05B] shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              새 프로젝트
            </Button>
          </Link>
        </div>

        {/* 프로젝트 KPI 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link href="/projects">
            <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">전체 프로젝트</CardTitle>
                <FolderKanban className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#2C3E50]">{totalProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  진행 중 <span className="font-semibold text-blue-600">{inProgressProjects}건</span>
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects?status=completed">
            <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">완료된 프로젝트</CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  완료율 <span className="font-semibold text-green-600">{totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%</span>
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects?priority=urgent">
            <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">긴급 프로젝트</CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{urgentProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  높음 <span className="font-semibold text-orange-600">{highProjects}건</span>
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects?overdue=true">
            <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">지연 프로젝트</CardTitle>
                <Clock className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{overdueProjects}</div>
                <p className="text-xs text-gray-500 mt-1">
                  목표일 초과
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 프로젝트 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#93C572]" />
                프로젝트 유형별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalProjects > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[#93C572]" />
                프로젝트 상태별 현황
              </CardTitle>
            </CardHeader>
            <CardContent>
              {totalProjects > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#93C572" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 샘플 평가 시스템 섹션 */}
        <div className="border-t-4 border-[#93C572] pt-6 mt-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#2C3E50] mb-2">샘플 평가 관리</h2>
              <p className="text-gray-600">제품 샘플을 평가하고 결과를 분석합니다</p>
            </div>
            <div className="flex gap-2">
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

          {/* 평가 등록/수정 폼 다이얼로그 */}
          <Dialog open={showEvaluationForm} onOpenChange={(open) => !open && resetForm()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvaluation ? '평가 수정' : '샘플 평가 등록'}</DialogTitle>
                <DialogDescription>
                  샘플 정보와 평가 점수를 입력해주세요.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as keyof typeof EVALUATION_CRITERIA)}
                      className="w-full h-10 px-3 border rounded-md"
                      disabled={!!editingEvaluation}
                    >
                      {Object.entries(SAMPLE_TYPES).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
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
                    {EVALUATION_CRITERIA[selectedType].map((item) => (
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

          {/* 히스토리 다이얼로그 */}
          <Dialog open={!!viewingHistory} onOpenChange={() => setViewingHistory(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>평가 히스토리: {viewingHistory}</DialogTitle>
                <DialogDescription>
                  시간에 따른 평가 점수 변화를 확인할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              
              {viewingHistory && (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getHistoryData(viewingHistory)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="version" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#93C572" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
                    {getHistoryData(viewingHistory).map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge>{item.version}</Badge>
                          <span className="text-sm text-gray-600">{item.date}</span>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <User className="w-3 h-3" />
                            {item.evaluator}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-[#93C572]">
                          {item.score}점
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* 샘플 유형 탭 */}
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as keyof typeof EVALUATION_CRITERIA)}>
            <TabsList className="mb-6">
              {Object.entries(SAMPLE_TYPES).map(([key, { label }]) => (
                <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(SAMPLE_TYPES).map((type) => (
              <TabsContent key={type} value={type}>
                {/* 평균 점수 비교 그래프 */}
                {averageScores.length > 0 && (
                  <Card className="mb-6 bg-white shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        평균 점수 비교
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (여러 평가자의 평균)
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={getBarChartData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="score" fill="#93C572" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* 샘플 목록 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredEvaluations.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">평가된 샘플이 없습니다</h3>
                        <p className="text-gray-600 mb-6">
                          새 평가 등록 버튼을 클릭하여 샘플 평가를 시작하세요.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    filteredEvaluations.slice(0, 4).map((evaluation: any) => (
                      <Card key={evaluation.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">{evaluation.sample_name}</CardTitle>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setViewingHistory(evaluation.sample_name)}
                                  className="h-6 px-2"
                                >
                                  <History className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline">
                                  {evaluation.brand === 'howpapa' ? '하우파파' : '누씨오'}
                                </Badge>
                                <Badge className={SAMPLE_TYPES[evaluation.sample_type as keyof typeof SAMPLE_TYPES].color}>
                                  {SAMPLE_TYPES[evaluation.sample_type as keyof typeof SAMPLE_TYPES].label}
                                </Badge>
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {evaluation.evaluator_name}
                                </Badge>
                              </div>
                              {evaluation.comment && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  "{evaluation.comment}"
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className="text-3xl font-bold text-[#93C572]">
                                {evaluation.total_score}
                              </div>
                              <div className="text-sm text-gray-500">
                                / {evaluation.max_score}점
                              </div>
                              <div className="text-sm font-semibold text-blue-600 mt-1">
                                {Math.round((evaluation.total_score / evaluation.max_score) * 100)}%
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(evaluation)}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              수정
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(evaluation)}
                              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              삭제
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {/* 레이더 차트 */}
                          <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={getRadarData(evaluation)}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis angle={90} domain={[0, 5]} />
                              <Radar
                                name={evaluation.sample_name}
                                dataKey="score"
                                stroke="#93C572"
                                fill="#93C572"
                                fillOpacity={0.6}
                              />
                              <Legend />
                            </RadarChart>
                          </ResponsiveContainer>

                          {/* 상세 점수 */}
                          <div className="mt-4 space-y-2">
                            {EVALUATION_CRITERIA[evaluation.sample_type as keyof typeof EVALUATION_CRITERIA].map((item) => (
                              <div key={item.key} className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">{item.label}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-[#93C572] h-2 rounded-full"
                                      style={{ width: `${((evaluation.scores?.[item.key] || 0) / item.max) * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-sm font-semibold w-10 text-right">
                                    {evaluation.scores?.[item.key] || 0}/{item.max}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                            평가일: {new Date(evaluation.created_at).toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* 더보기 버튼 */}
                {filteredEvaluations.length > 4 && (
                  <div className="text-center mt-6">
                    <Link href="/samples">
                      <Button variant="outline" className="shadow-md">
                        모든 평가 보기 ({filteredEvaluations.length}개)
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
