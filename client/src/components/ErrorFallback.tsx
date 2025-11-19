import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const isDevelopment = import.meta.env.DEV;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-lg w-full p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* 에러 아이콘 */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>

          {/* 에러 메시지 */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              문제가 발생했습니다
            </h1>
            <p className="text-gray-600">
              예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </p>
          </div>

          {/* 개발 환경에서만 에러 상세 정보 표시 */}
          {isDevelopment && (
            <div className="w-full bg-gray-100 rounded-lg p-4 text-left">
              <p className="text-sm font-mono text-red-600 break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                    스택 트레이스 보기
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-3 w-full">
            <Button
              onClick={resetErrorBoundary}
              className="flex-1 bg-[#93C572] hover:bg-[#7FB05B]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              다시 시도
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              <Home className="w-4 h-4 mr-2" />
              홈으로
            </Button>
          </div>

          {/* 도움말 */}
          <p className="text-sm text-gray-500">
            문제가 계속되면{' '}
            <a
              href="mailto:yong@howlab.co.kr"
              className="text-[#93C572] hover:underline"
            >
              관리자에게 문의
            </a>
            해주세요.
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * 로딩 스피너 컴포넌트
 */
export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#93C572] mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
