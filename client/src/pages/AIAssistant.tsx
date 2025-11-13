import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, Send, BookOpen, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function AIAssistant() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  const { data: guides = [] } = trpc.workGuides.list.useQuery();

  const askMutation = trpc.workGuides.ask.useMutation({
    onSuccess: (data: { answer: string }) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      setQuestion("");
    },
    onError: (error: any) => {
      toast.error(error.message || "질문 처리에 실패했습니다");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    askMutation.mutate({ question });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F2] to-white">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Bot className="w-10 h-10 text-[#93C572]" />
            AI 업무 도우미
          </h1>
          <p className="text-gray-600">업무 가이드를 확인하고 질문하세요</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20 h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <Sparkles className="w-16 h-16 text-[#93C572] mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">AI 도우미에게 물어보세요</h3>
                      <p className="text-gray-600">업무 프로세스, 가이드라인, 체크리스트 등을 질문할 수 있습니다</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === "user"
                            ? "bg-[#93C572] text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {askMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-4 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#93C572]"></div>
                        <span>답변을 생성하는 중...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="질문을 입력하세요..."
                  disabled={askMutation.isPending}
                  className="border-2 border-gray-200 focus:border-[#93C572]"
                />
                <Button
                  type="submit"
                  disabled={askMutation.isPending || !question.trim()}
                  className="bg-[#93C572] hover:bg-[#7AB05C]"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </Card>
          </div>

          {/* Guides */}
          <div>
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-[#93C572]/20">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#93C572]" />
                업무 가이드
              </h2>

              {guides.length === 0 ? (
                <p className="text-gray-500 text-sm">등록된 가이드가 없습니다</p>
              ) : (
                <div className="space-y-3">
                  {guides.map((guide) => (
                    <div
                      key={guide.id}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#93C572]/30 transition-colors cursor-pointer"
                      onClick={() => setQuestion(`${guide.title}에 대해 알려줘`)}
                    >
                      <h4 className="font-semibold text-gray-900 text-sm">{guide.title}</h4>
                      {guide.category && (
                        <span className="text-xs text-gray-600 mt-1 block">{guide.category}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">💡 사용 팁</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• "샘플링 프로세스는?"</li>
                  <li>• "신제품 출시 체크리스트"</li>
                  <li>• "인플루언서 협업 가이드"</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
