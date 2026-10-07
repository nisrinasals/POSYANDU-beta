import React from 'react';

export class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("Global Error Caught:", error, errorInfo);
    try {
      fetch('http://localhost:9999', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: error.toString() + "\n\n" + errorInfo.componentStack
      }).catch(() => {});
    } catch(e) {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffdddd', color: '#990000', fontFamily: 'monospace', minHeight: '100vh', zIndex: 99999, position: 'relative' }}>
          <h2>Something went wrong (React Crash).</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Click for error details</summary>
            <br />
            <strong>{this.state.error && this.state.error.toString()}</strong>
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px' }}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}
