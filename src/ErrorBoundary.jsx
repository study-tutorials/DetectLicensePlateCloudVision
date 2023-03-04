import React from 'react';
// Error Boundaries are similar to try catch for react components
// We can go as grannulay as we want. Where I want to show "Something went wrong"
// I can use this error boundary component. It must be implemented in this way using class
// With this, my react app does not break anymore
// Error boundaries are React components that catch JavaScript errors anywhere in their child
// component tree, log those errors, and display a fallback UI instead of the component tree that crashed.
// Error boundaries catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.
// Only class components can be error boundaries. In practice,
// most of the time you’ll want to declare an error boundary component once and use it throughout your application.
// Error boundaries doesn't catch event handlers, for that we use try catch.

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  // this is basically used to chage the state to true when there's an error
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.log(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <p className='text-center text-danger'>
          Ops. I could't read this license plate.
        </p>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
