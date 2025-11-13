import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeftIcon, PlusIcon, EditIcon, TrashIcon } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { NoticeCard } from "@/components/NoticeCard";
import { EvaluationCriteria } from "@/components/EvaluationCriteria";
import { useState } from "react";

const BRANDS = ["하우파파", "누씨오", "전체"];

export default function Samples() {
  const { isAuthenticated } = useAuth();
  const { data: samples, refetch } = trpc.samples.list.useQuery();
  const [selectedBrand, setSelectedBrand] = useState("전체");
  
  const deleteMutation = trpc.samples.delete.useMutation({
    onSuccess: () => {
      toast.success("샘플이 삭제되었습니다");
      refetch();
    },
    onError: () => {
      toast.error("샘플 삭제에 실패했습니다");
    },
  });

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

  const handleDelete = (id: number) => {
    if (confirm("정말 이 샘플을 삭제하시겠습니까?")) {
      deleteMutation.mutate({ id });
    }
  };

  // 브랜드 필터링
  const filteredSamples = selectedBrand === "전체" 
    ? samples 
    : samples?.filter(s => s.brand === selectedBrand);

  // 제품별로 그룹화
  const groupedByProduct = filteredSamples ? filteredSamples.reduce((acc, sample) => {
    const key = sample.productName || sample.labNumber;
    if (!acc[key]) {
      acc[key] = {
        productName: sample.productName,
        category: sample.category,
        manufacturer: sample.manufacturer,
        brand: sample.brand,
        samples: []
      };
    }
    acc[key].samples.push(sample);
    return acc;
  }, {} as Record<string, {
    productName: string | null;
    category: string | null;
    manufacturer: string;
    brand: string | null;
    samples: NonNullable<typeof samples>;
  }>) : {};

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
              {APP_TITLE}
            </h1>
          </div>
          <Link href="/samples/new">
            <Button className="bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white shadow-md">
              <PlusIcon className="w-4 h-4 mr-2" />
              새 샘플 등록
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">샘플 목록</h2>
          <p className="text-gray-600">등록된 샘플을 제품별로 확인하고 관리하세요</p>
        </div>

        <div className="mb-8">
          <NoticeCard />
        </div>

        <div className="mb-8">
          <EvaluationCriteria />
        </div>

        {/* 브랜드 탭 */}
        <div className="mb-6">
          <div className="flex gap-2">
            {BRANDS.map((brand) => (
              <Button
                key={brand}
                variant={selectedBrand === brand ? "default" : "outline"}
                className={
                  selectedBrand === brand
                    ? "bg-gradient-to-r from-[#93C572] to-[#589B6A] text-white"
                    : "border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10"
                }
                onClick={() => setSelectedBrand(brand)}
              >
                {brand}
              </Button>
            ))}
          </div>
        </div>

        {!filteredSamples || filteredSamples.length === 0 ? (
          <Card className="border-none shadow-lg">
            <CardContent className="p-16 text-center">
              <p className="text-gray-500 mb-4">등록된 샘플이 없습니다</p>
              <Link href="/samples/new">
                <Button className="bg-gradient-to-r from-[#93C572] to-[#589B6A] hover:from-[#78A85E] hover:to-[#478556] text-white">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  첫 샘플 등록하기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByProduct || {}).map(([key, group]) => (
              <Card key={key} className="border-none shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-[#93C572] to-[#589B6A] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {group.productName || key}
                      </h3>
                      <div className="flex gap-2 mt-2">
                        {group.brand && (
                          <Badge className="bg-white/20 text-white border-white/40">
                            {group.brand}
                          </Badge>
                        )}
                        {group.category && (
                          <Badge className="bg-white/20 text-white border-white/40">
                            {group.category}
                          </Badge>
                        )}
                        <Badge className="bg-white/20 text-white border-white/40">
                          {group.manufacturer}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.samples?.map((sample) => (
                      <Card key={sample.id} className="border-2 border-gray-100 hover:border-[#93C572] transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <Badge className="bg-[#93C572] text-white mb-2">
                                {sample.round}차
                              </Badge>
                              <p className="font-semibold text-gray-900">{sample.labNumber}</p>
                              <p className="text-sm text-gray-500 mt-1">{sample.date}</p>
                            </div>
                          </div>
                          {sample.memo && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{sample.memo}</p>
                          )}
                          <div className="flex gap-2">
                            <Link href={`/samples/${sample.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full border-[#93C572] text-[#589B6A] hover:bg-[#93C572]/10">
                                상세보기
                              </Button>
                            </Link>
                            <Link href={`/samples/${sample.id}/edit`}>
                              <Button variant="ghost" size="icon" className="hover:bg-[#93C572]/10">
                                <EditIcon className="w-4 h-4 text-[#589B6A]" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(sample.id)}
                              className="hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
