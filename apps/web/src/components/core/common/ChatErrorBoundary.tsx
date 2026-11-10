'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
    onReset?: () => void
}

interface State {
    hasError: boolean
}

export class ChatErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Chat error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-4 bg-sb-rose text-sb-rose-ink rounded-lg">
                    Something went wrong in the chat component.
                </div>
            )
        }

        return this.props.children
    }
}
