import { Component, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, resetErrorBoundary: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 전역 에러 바운더리
 * React 컴포넌트 트리에서 발생하는 JavaScript 오류를 포착하고
 * 사용자 친화적인 에러 화면을 표시합니다.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 표시되도록 상태 업데이트
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 에러 로깅 서비스에 에러 전송 (예: Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 프로덕션 환경에서는 에러 모니터링 서비스로 전송
    if (import.meta.env.PROD) {
      // TODO: Sentry 등의 에러 모니터링 서비스로 전송
      // Sentry.captureException(error, { extra: errorInfo });
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // 커스텀 폴백이 제공되었다면 사용
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary);
      }

      // 기본 에러 폴백 컴포넌트 사용
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
