import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plus, Building2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

const VENDOR_TYPES = {
  manufacturer: "제조사",
  designer: "디자이너",
  influencer: "인플루언서",
  other: "기타",
};

export default function Vendors() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "manufacturer" as any,
    contactPerson: "",
    email: "",
    phone: "",
    notes: "",
  });

  const { data: vendors = [], isLoading, refetch } = trpc.vendors.list.useQuery();

  const createMutation = trpc.vendors.create.useMutation({
    onSuccess: () => {
      toast.success("거래처가 등록되었습니다");
      setShowForm(false);
      setFormData({
        name: "",
        type: "manufacturer",
        contactPerson: "",
        email: "",
        phone: "",
        notes: "",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "거래처 등록에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("거래처 이름을 입력해주세요");
      return;
    }
    createMutation.mutate(formData);
  };

  const canEdit = user && (user.role === "admin" || user.role === "manager");

  const filteredVendors = vendors.filter((vendor) => {
    if (selectedType && vendor.type !== selectedType) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto"></div>
          <p className="mt-4 text-gray-600">거래처를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">거래처 관리</h1>
            <p className="text-gray-600">협력 거래처 정보를 관리하세요</p>
          </div>
          {canEdit && (
            <Button onClick={() => setShowForm(!showForm)} className="bg-[#93C572] hover:bg-[#7AB05C] text-white">
              <Plus className="w-5 h-5 mr-2" />
              새 거래처
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새 거래처 등록</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="거래처 이름 *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#93C572]"
                />
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="border-2 border-gray-200 rounded-md px-3 py-2 focus:border-[#93C572] focus:outline-none"
                >
                  {Object.entries(VENDOR_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="담당자"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#93C572]"
                />
                <Input
                  placeholder="이메일"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#93C572]"
                />
                <Input
                  placeholder="전화번호"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#93C572]"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={createMutation.isPending} className="bg-[#93C572] hover:bg-[#7AB05C]">
                  {createMutation.isPending ? "등록 중..." : "등록하기"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  취소
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(null)}
              className={selectedType === null ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
            >
              전체 ({vendors.length})
            </Button>
            {Object.entries(VENDOR_TYPES).map(([key, label]) => {
              const count = vendors.filter((v) => v.type === key).length;
              return (
                <Button
                  key={key}
                  variant={selectedType === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(key)}
                  className={selectedType === key ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
                >
                  {label} ({count})
                </Button>
              );
            })}
          </div>
        </div>

        {/* Vendors List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <Card key={vendor.id} className="p-6 bg-white/80 backdrop-blur-sm border-2 border-transparent hover:border-[#93C572]/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#93C572]/20 rounded-full flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-[#93C572]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                    <span className="text-xs text-gray-600">{VENDOR_TYPES[vendor.type as keyof typeof VENDOR_TYPES]}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {vendor.contactPerson && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">담당자:</span>
                    <span>{vendor.contactPerson}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#93C572]" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#93C572]" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredVendors.length === 0 && (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
            <p className="text-gray-500">등록된 거래처가 없습니다</p>
          </Card>
        )}
      </div>
    </div>
  );
}
