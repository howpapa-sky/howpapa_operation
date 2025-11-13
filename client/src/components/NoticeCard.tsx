import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

export function NoticeCard() {
  return (
    <Card className="border-l-4 border-l-[#93C572] bg-[#FFF8F0]/50">
      <CardContent className="p-6">
        <div className="flex gap-3">
          <InfoIcon className="w-5 h-5 text-[#589B6A] flex-shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">안내사항</h3>
            <div className="space-y-2 text-sm text-gray-700 leading-relaxed">
              <p>
                <span className="font-semibold">1.</span> 품평시 시트 크기는 제외하고 피드백 부탁드립니다. 
                콜마 측에서 빠른 대응이 가능한 사이즈 전달 주신거라고 합니다.
              </p>
              <p>
                <span className="font-semibold">2.</span> A/B/C 샘플은 원단 차이만 있고, 앰플은 동일한 내용물입니다.
              </p>
              <p>
                <span className="font-semibold">3.</span> A/B/C의 원단 중 가장 적합한 원단을 선정하여 '한 줄 메모'에 적어주시길 바랍니다. 
                선정한 원단에서 피드백이 필요하다면 '유지 및 개선 요청'에 기입해주시면 됩니다.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
