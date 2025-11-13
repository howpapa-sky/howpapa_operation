import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { Package, Plus, TrendingUp, BarChart3 } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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

export default function Samples() {
  const [selectedType, setSelectedType] = useState<keyof typeof EVALUATION_CRITERIA>('ampoule');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [sampleName, setSampleName] = useState('');
  const [brand, setBrand] = useState('howpapa');
  const [scores, setScores] = useState<Record<string, number>>({});
  const queryClient = useQueryClient();

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['samples'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createSampleMutation = useMutation({
    mutationFn: async (newSample: any) => {
      const { data, error } = await supabase
        .from('samples')
        .insert([newSample])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['samples'] });
      setShowEvaluationForm(false);
      setSampleName('');
      setScores({});
    }
  });

  const handleScoreChange = (key: string, value: number) => {
    setScores(prev => ({ ...prev, [key]: Math.min(Math.max(value, 0), 5) }));
  };

  const handleSubmit = () => {
    const criteria = EVALUATION_CRITERIA[selectedType];
    const totalScore = criteria.reduce((sum, item) => sum + (scores[item.key] || 0), 0);
    const maxScore = criteria.reduce((sum, item) => sum + item.max, 0);

    createSampleMutation.mutate({
      name: sampleName,
      type: selectedType,
      brand: brand,
      scores: scores,
      total_score: totalScore,
      max_score: maxScore,
    });
  };

  const filteredSamples = samples.filter((sample: any) => sample.type === selectedType);

  const getRadarData = (sample: any) => {
    const criteria = EVALUATION_CRITERIA[sample.type as keyof typeof EVALUATION_CRITERIA];
    return criteria.map(item => ({
      subject: item.label,
      score: sample.scores?.[item.key] || 0,
      fullMark: item.max,
    }));
  };

  const getBarChartData = () => {
    return filteredSamples.map((sample: any) => ({
      name: sample.name,
      score: sample.total_score,
      percentage: Math.round((sample.total_score / sample.max_score) * 100),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F4F8] to-[#E1E7EF] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">샘플 평가 관리</h1>
            <p className="text-gray-600">제품 샘플을 평가하고 결과를 분석합니다</p>
          </div>
          <Button 
            onClick={() => setShowEvaluationForm(!showEvaluationForm)}
            className="bg-[#93C572] hover:bg-[#7FB05B] shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 평가 등록
          </Button>
        </div>

        {/* 평가 등록 폼 */}
        {showEvaluationForm && (
          <Card className="mb-6 bg-white shadow-lg">
            <CardHeader>
              <CardTitle>샘플 평가 등록</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  >
                    {Object.entries(SAMPLE_TYPES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
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

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEvaluationForm(false)}>
                  취소
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!sampleName || Object.keys(scores).length === 0}
                  className="bg-[#93C572] hover:bg-[#7FB05B]"
                >
                  등록
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 샘플 유형 탭 */}
        <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as keyof typeof EVALUATION_CRITERIA)}>
          <TabsList className="mb-6">
            {Object.entries(SAMPLE_TYPES).map(([key, { label }]) => (
              <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(SAMPLE_TYPES).map((type) => (
            <TabsContent key={type} value={type}>
              {/* 총점 비교 그래프 */}
              {filteredSamples.length > 0 && (
                <Card className="mb-6 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      총점 비교
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
                {filteredSamples.length === 0 ? (
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
                  filteredSamples.map((sample: any) => (
                    <Card key={sample.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{sample.name}</CardTitle>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">
                                {sample.brand === 'howpapa' ? '하우파파' : '누씨오'}
                              </Badge>
                              <Badge className={SAMPLE_TYPES[sample.type as keyof typeof SAMPLE_TYPES].color}>
                                {SAMPLE_TYPES[sample.type as keyof typeof SAMPLE_TYPES].label}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-[#93C572]">
                              {sample.total_score}
                            </div>
                            <div className="text-sm text-gray-500">
                              / {sample.max_score}점
                            </div>
                            <div className="text-sm font-semibold text-blue-600 mt-1">
                              {Math.round((sample.total_score / sample.max_score) * 100)}%
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* 레이더 차트 */}
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={getRadarData(sample)}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} />
                            <Radar
                              name={sample.name}
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
                          {EVALUATION_CRITERIA[sample.type as keyof typeof EVALUATION_CRITERIA].map((item) => (
                            <div key={item.key} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{item.label}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-[#93C572] h-2 rounded-full"
                                    style={{ width: `${((sample.scores?.[item.key] || 0) / item.max) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm font-semibold w-12 text-right">
                                  {sample.scores?.[item.key] || 0}/{item.max}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
