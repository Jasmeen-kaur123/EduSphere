import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }

  componentDidCatch(error, info){
    console.error('Uncaught error:', error, info)
  }

  handleReload = ()=>{
    this.setState({ hasError: false, error: null })
    // optional: reload the page
    // window.location.reload()
  }

  render(){
    if(this.state.hasError){
      const err = this.state.error || {}
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-3xl w-full bg-white rounded-xl shadow p-6 text-left">
            <h2 className="text-xl font-bold mb-2">Something went wrong.</h2>
            <p className="text-sm text-gray-600 mb-4">An unexpected error occurred. The error details are shown below — you can copy them and share with me.</p>
            <div className="mb-4">
              <div className="font-semibold">Error:</div>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">{err.message || String(err)}</pre>
            </div>
            {err.stack && (
              <div className="mb-4">
                <div className="font-semibold">Stack trace:</div>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto" style={{maxHeight:300}}>{err.stack}</pre>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={this.handleReload} className="px-4 py-2 rounded bg-blue-600 text-white">Try again</button>
              <button onClick={()=>window.location.reload()} className="px-4 py-2 rounded border">Reload page</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
