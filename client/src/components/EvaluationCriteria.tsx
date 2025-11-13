import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface CriteriaItem {
  category: string;
  subcategory: string;
  score1: string;
  score3: string;
  score5: string;
}

const CRITERIA: CriteriaItem[] = [
  {
    category: "앰플",
    subcategory: "점보슬",
    score1: "끈끈 날아가 건조함",
    score3: "중간 유지",
    score5: "장시간 촉촉함"
  },
  {
    category: "앰플",
    subcategory: "속건조 개선",
    score1: "속건조 개선 X",
    score3: "어느정도 재워줌",
    score5: "속건조 개선 O"
  },
  {
    category: "앰플",
    subcategory: "마무리감",
    score1: "끈적이며, 유분 등의 실감",
    score3: "쌀짝 남음",
    score5: "끈적이지 않음"
  },
  {
    category: "시트",
    subcategory: "크기",
    score1: "작음",
    score3: "보통",
    score5: "큼"
  },
  {
    category: "시트",
    subcategory: "밀착력",
    score1: "가장자리가 쉽게 들뜨고, 잘 떨어지면 약간 들뜨는 부분이 있으나, 떨어지지 않음",
    score3: "보통",
    score5: "밀착력이 좋고, 잘 떨어지지 않음"
  },
  {
    category: "시트",
    subcategory: "원단",
    score1: "거칠음 (자극감 有)",
    score3: "보통",
    score5: "부드럽고 매끄러움 (자극감 無)"
  },
  {
    category: "시트",
    subcategory: "두께",
    score1: "두꺼움",
    score3: "중간",
    score5: "얇음"
  },
  {
    category: "시트",
    subcategory: "수분 함침/유지력",
    score1: "금방 날아가 건조함",
    score3: "중간 유지",
    score5: "장시간 촉촉함"
  },
  {
    category: "피부결 정돈",
    subcategory: "노폐물, 각질 정돈",
    score1: "잘 되지 않음",
    score3: "보통",
    score5: "매우 잘 됨"
  },
  {
    category: "진정",
    subcategory: "진정",
    score1: "붉검, 자극 부위 등 진정 효과 없음",
    score3: "보통",
    score5: "진정 매우 효과적"
  },
];

export function EvaluationCriteria({ category }: { category?: string }) {
  const [activeTab, setActiveTab] = useState<string>("앰플");

  // 탭 목록 (앰플, 시트만 탭으로 표시)
  const tabs = ["앰플", "시트"];

  // 선택된 탭에 따라 필터링
  const filteredCriteria = category 
    ? CRITERIA.filter(c => c.category === category)
    : CRITERIA.filter(c => c.category === activeTab);

  // 나머지 카테고리 (피부결 정돈, 진정)
  const otherCriteria = CRITERIA.filter(c => c.category !== "앰플" && c.category !== "시트");

  const groupedByCategory = filteredCriteria.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CriteriaItem[]>);

  return (
    <Card className="border-none shadow-lg">
      <CardContent className="p-6">
        {/* 탭 버튼 */}
        {!category && (
          <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === tab
                    ? "text-[#93C572] border-b-4 border-[#93C572]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}

        {/* 선택된 탭의 품평기준 */}
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Badge variant="outline" className="bg-[#93C572]/10 text-[#93C572] border-[#93C572]">
                  {cat}
                </Badge>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#93C572]/20 to-[#589B6A]/20">
                      <th className="border-2 border-[#93C572]/30 px-4 py-3 text-left font-bold text-gray-900">
                        점보슬
                      </th>
                      <th className="border-2 border-[#93C572]/30 px-4 py-3 text-center font-bold text-gray-900">
                        1점
                      </th>
                      <th className="border-2 border-[#93C572]/30 px-4 py-3 text-center font-bold text-gray-900">
                        3점
                      </th>
                      <th className="border-2 border-[#93C572]/30 px-4 py-3 text-center font-bold text-gray-900">
                        5점
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#93C572]/5 transition-colors">
                        <td className="border-2 border-gray-200 px-4 py-3 font-semibold text-gray-800">
                          {item.subcategory}
                        </td>
                        <td className="border-2 border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {item.score1}
                        </td>
                        <td className="border-2 border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {item.score3}
                        </td>
                        <td className="border-2 border-gray-200 px-4 py-3 text-sm text-gray-700">
                          {item.score5}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* 나머지 카테고리 (피부결 정돈, 진정) - 항상 하단에 표시 */}
        {!category && otherCriteria.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">기타 평가 기준</h3>
            {otherCriteria.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">{item.category} - {item.subcategory}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">1점:</span> {item.score1}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">3점:</span> {item.score3}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">5점:</span> {item.score5}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
