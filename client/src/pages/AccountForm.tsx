import { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const CATEGORIES = [
  { value: "marketing", label: "마케팅 채널" },
  { value: "sales", label: "판매채널" },
  { value: "cs", label: "CS&발주" },
  { value: "product", label: "제품관련" },
  { value: "other", label: "기타" },
];

interface Props {
  params?: { id?: string };
}

export default function AccountForm({ params }: Props) {
  const id = params?.id;
  const [, setLocation] = useLocation();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    category: "marketing" as any,
    platform: "",
    url: "",
    username: "",
    subUsername: "",
    password: "",
    notes: "",
  });

  const { data: account } = trpc.accounts.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: isEdit }
  );

  useEffect(() => {
    if (account) {
      setFormData({
        category: account.category as any,
        platform: account.platform,
        url: account.url || "",
        username: account.username || "",
        subUsername: account.subUsername || "",
        password: "", // Don't pre-fill password
        notes: account.notes || "",
      });
    }
  }, [account]);

  const createMutation = trpc.accounts.create.useMutation({
    onSuccess: () => {
      toast.success("계정이 등록되었습니다");
      setLocation("/accounts");
    },
    onError: (error) => {
      toast.error(error.message || "계정 등록에 실패했습니다");
    },
  });

  const updateMutation = trpc.accounts.update.useMutation({
    onSuccess: () => {
      toast.success("계정이 수정되었습니다");
      setLocation("/accounts");
    },
    onError: (error) => {
      toast.error(error.message || "계정 수정에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.platform.trim()) {
      toast.error("플랫폼명을 입력해주세요");
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        id: parseInt(id!),
        ...formData,
        url: formData.url || null,
        username: formData.username || null,
        subUsername: formData.subUsername || null,
        password: formData.password || null,
        notes: formData.notes || null,
      });
    } else {
      createMutation.mutate({
        ...formData,
        url: formData.url || null,
        username: formData.username || null,
        subUsername: formData.subUsername || null,
        password: formData.password || null,
        notes: formData.notes || null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white">
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <KeyRound className="w-10 h-10 text-[#93C572]" />
            {isEdit ? "계정 수정" : "새 계정 등록"}
          </h1>
          <p className="text-gray-600">계정 정보를 입력해주세요</p>
        </div>

        <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="category">카테고리 *</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button
                    key={cat.value}
                    type="button"
                    variant={formData.category === cat.value ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, category: cat.value as any })}
                    className={formData.category === cat.value ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="platform">플랫폼명 *</Label>
              <Input
                id="platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="예: 스타일씨, 레뷰, 인스타그램 등"
                required
              />
            </div>

            <div>
              <Label htmlFor="url">로그인 URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="username">운영자 계정</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="이메일 또는 아이디"
              />
            </div>

            <div>
              <Label htmlFor="subUsername">부운영자 계정</Label>
              <Input
                id="subUsername"
                value={formData.subUsername}
                onChange={(e) => setFormData({ ...formData, subUsername: e.target.value })}
                placeholder="이메일 또는 아이디"
              />
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isEdit ? "변경하려면 입력하세요" : "비밀번호"}
              />
              {isEdit && (
                <p className="text-sm text-gray-500 mt-1">
                  비밀번호를 변경하지 않으려면 비워두세요
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">메모</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="추가 정보나 메모를 입력하세요"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-[#93C572] hover:bg-[#7AB05C]"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? "수정" : "등록"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/accounts")}
              >
                취소
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
