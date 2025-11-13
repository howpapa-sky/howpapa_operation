import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { KeyRound, Plus, Search, Eye, EyeOff, Edit, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

const CATEGORIES = [
  { value: "marketing", label: "마케팅 채널" },
  { value: "sales", label: "판매채널" },
  { value: "cs", label: "CS&발주" },
  { value: "product", label: "제품관련" },
  { value: "other", label: "기타" },
];

export default function Accounts() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});

  const { data: accounts = [], refetch } = trpc.accounts.list.useQuery();

  const deleteMutation = trpc.accounts.delete.useMutation({
    onSuccess: () => {
      toast.success("계정이 삭제되었습니다");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "계정 삭제에 실패했습니다");
    },
  });

  const filteredAccounts = accounts.filter((account) => {
    const matchesCategory = !selectedCategory || account.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      account.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedAccounts = CATEGORIES.map((cat) => ({
    ...cat,
    accounts: filteredAccounts.filter((acc) => acc.category === cat.value),
  })).filter((group) => group.accounts.length > 0);

  const togglePasswordVisibility = (id: number) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = (id: number, platform: string) => {
    if (confirm(`"${platform}" 계정을 삭제하시겠습니까?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <KeyRound className="w-10 h-10 text-[#93C572]" />
                계정 관리
              </h1>
              <p className="text-gray-600">모든 채널의 계정 정보를 안전하게 관리하세요</p>
            </div>
            <Link href="/">
              <Button variant="outline">홈으로</Button>
            </Link>
          </div>

          {(user?.role === "admin" || user?.role === "manager") && (
            <Link href="/accounts/new">
              <Button className="bg-[#93C572] hover:bg-[#7AB05C]">
                <Plus className="w-5 h-5 mr-2" />
                새 계정 추가
              </Button>
            </Link>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="플랫폼명 또는 계정 검색..."
              className="pl-10 border-2 border-gray-200 focus:border-[#93C572]"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className={selectedCategory === null ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
            >
              전체
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat.value)}
                className={selectedCategory === cat.value ? "bg-[#93C572] hover:bg-[#7AB05C]" : ""}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Accounts List */}
        {groupedAccounts.length === 0 ? (
          <Card className="p-12 text-center">
            <KeyRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">등록된 계정이 없습니다</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {groupedAccounts.map((group) => (
              <div key={group.value}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{group.label}</h2>
                <div className="grid gap-4">
                  {group.accounts.map((account) => (
                    <Card key={account.id} className="p-6 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20 hover:border-[#93C572]/40 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-gray-900">{account.platform}</h3>
                            {account.url && (
                              <a
                                href={account.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#93C572] hover:text-[#7AB05C]"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {account.username && (
                              <div>
                                <span className="text-gray-600 font-medium">운영자: </span>
                                <span className="text-gray-900">{account.username}</span>
                              </div>
                            )}
                            {account.subUsername && (
                              <div>
                                <span className="text-gray-600 font-medium">부운영자: </span>
                                <span className="text-gray-900">{account.subUsername}</span>
                              </div>
                            )}
                            {account.encryptedPassword && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 font-medium">비밀번호: </span>
                                <span className="text-gray-900 font-mono">
                                  {showPasswords[account.id] ? "********" : "••••••••"}
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => togglePasswordVisibility(account.id)}
                                    className="text-[#93C572] hover:text-[#7AB05C]"
                                  >
                                    {showPasswords[account.id] ? (
                                      <EyeOff className="w-4 h-4" />
                                    ) : (
                                      <Eye className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {account.notes && (
                            <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {account.notes}
                            </p>
                          )}
                        </div>

                        {(user?.role === "admin" || user?.role === "manager") && (
                          <div className="flex gap-2 ml-4">
                            <Link href={`/accounts/${account.id}/edit`}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(account.id, account.platform)}
                              className="text-red-600 hover:text-red-700 hover:border-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
