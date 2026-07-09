import React from 'react';

type State = { error: Error | null };

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    // Log to console so dev server captures it
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#fff', background: '#111', minHeight: '100vh' }}>
          <h1 style={{ color: '#f43f5e' }}>Something went wrong</h1>
          <pre style={{ whiteSpace: 'pre-wrap', color: '#fff' }}>{String(this.state.error && this.state.error.stack)}</pre>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
