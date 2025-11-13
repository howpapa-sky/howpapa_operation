import { useAuth } from "@/_core/hooks/useAuth";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftIcon, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const MANUFACTURERS = ["한국콜마", "코스맥스"];
const BRANDS = ["하우파파", "누씨오"];
const CATEGORIES = ["토너패드", "앰플", "크림", "세럼", "로션", "클렌저", "미스트", "스킨"];

export default function SampleForm() {
  const { isAuthenticated } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    round: "",
    date: new Date(),
    manufacturer: "",
    labNumber: "",
    productName: "",
    brand: "",
    category: "",
    memo: "",
  });

  const [customManufacturer, setCustomManufacturer] = useState("");
  const [showCustomManufacturer, setShowCustomManufacturer] = useState(false);

  const { data: sample } = trpc.samples.getById.useQuery(
    { id: Number(id) },
    { enabled: isEdit }
  );

  const createMutation = trpc.samples.create.useMutation({
    onSuccess: () => {
      toast.success("샘플이 등록되었습니다");
      navigate("/samples");
    },
    onError: () => {
      toast.error("샘플 등록에 실패했습니다");
    },
  });

  const updateMutation = trpc.samples.update.useMutation({
    onSuccess: () => {
      toast.success("샘플이 수정되었습니다");
      navigate("/samples");
    },
    onError: () => {
      toast.error("샘플 수정에 실패했습니다");
    },
  });

  useEffect(() => {
    if (sample) {
      setFormData({
        round: String(sample.round),
        date: new Date(sample.date),
        manufacturer: sample.manufacturer,
        labNumber: sample.labNumber,
        productName: sample.productName || "",
        brand: sample.brand || "",
        category: sample.category || "",
        memo: sample.memo || "",
      });
    }
  }, [sample]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const manufacturer = showCustomManufacturer
      ? customManufacturer
      : formData.manufacturer;

    if (!formData.round || !formData.date || !manufacturer || !formData.labNumber) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }

    const data = {
      round: Number(formData.round),
      date: format(formData.date, "yyyy-MM-dd"),
      manufacturer,
      labNumber: formData.labNumber,
      productName: formData.productName || null,
      brand: formData.brand || null,
      category: formData.category || null,
      memo: formData.memo || null,
    };

    if (isEdit) {
      updateMutation.mutate({ id: Number(id), ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (!isAuthenticated) {
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {isEdit ? "샘플 수정" : "새 샘플 등록"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="round" className="text-sm font-medium text-gray-700">
                    차수 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="round"
                    type="number"
                    min="1"
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    placeholder="예: 1"
                    className="mt-1.5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    날짜 <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full mt-1.5 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP", { locale: ko }) : "날짜 선택"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        locale={ko}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  제조사 <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2 flex-wrap mb-3">
                  {MANUFACTURERS.map((mfr) => (
                    <Button
                      key={mfr}
                      type="button"
                      variant={formData.manufacturer === mfr && !showCustomManufacturer ? "default" : "outline"}
                      className={
                        formData.manufacturer === mfr && !showCustomManufacturer
                          ? "bg-[#93C572] hover:bg-[#78A85E]"
                          : "border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                      }
                      onClick={() => {
                        setFormData({ ...formData, manufacturer: mfr });
                        setShowCustomManufacturer(false);
                      }}
                    >
                      {mfr}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant={showCustomManufacturer ? "default" : "outline"}
                    className={
                      showCustomManufacturer
                        ? "bg-[#93C572] hover:bg-[#78A85E]"
                        : "border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                    }
                    onClick={() => setShowCustomManufacturer(true)}
                  >
                    + 직접 입력
                  </Button>
                </div>
                {showCustomManufacturer && (
                  <Input
                    value={customManufacturer}
                    onChange={(e) => setCustomManufacturer(e.target.value)}
                    placeholder="제조사 이름 입력"
                    required
                  />
                )}
              </div>

              <div>
                <Label htmlFor="labNumber" className="text-sm font-medium text-gray-700">
                  랩넘버 (샘플 코드) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="labNumber"
                  value={formData.labNumber}
                  onChange={(e) => setFormData({ ...formData, labNumber: e.target.value })}
                  placeholder="예: DM3001T-BR-A"
                  className="mt-1.5"
                  required
                />
              </div>

              <div>
                <Label htmlFor="productName" className="text-sm font-medium text-gray-700">
                  제품명
                </Label>
                <Input
                  id="productName"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="예: 누씨오 부활초 패드"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  브랜드
                </Label>
                <div className="flex gap-2 flex-wrap">
                  {BRANDS.map((brand) => (
                    <Button
                      key={brand}
                      type="button"
                      variant={formData.brand === brand ? "default" : "outline"}
                      className={
                        formData.brand === brand
                          ? "bg-[#93C572] hover:bg-[#78A85E]"
                          : "border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                      }
                      onClick={() => setFormData({ ...formData, brand })}
                    >
                      {brand}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  카테고리
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant={formData.category === cat ? "default" : "outline"}
                      className={
                        formData.category === cat
                          ? "bg-[#93C572] hover:bg-[#78A85E]"
                          : "border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                      }
                      onClick={() => setFormData({ ...formData, category: cat })}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="memo" className="text-sm font-medium text-gray-700">
                  메모
                </Label>
                <Textarea
                  id="memo"
                  value={formData.memo}
                  onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                  placeholder="샘플에 대한 추가 정보를 입력하세요"
                  rows={4}
                  className="mt-1.5"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/samples")}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {isEdit ? "수정" : "등록"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
