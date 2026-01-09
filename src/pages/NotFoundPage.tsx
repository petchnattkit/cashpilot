import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'

function NotFoundPage() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-neutral-100 p-4 rounded-full mb-6">
                <AlertCircle className="w-12 h-12 text-neutral-400" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Page Not Found
            </h1>
            <p className="text-neutral-500 max-w-md mb-8">
                The page you are looking for doesn't exist or has been moved.
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
            >
                Return to Dashboard
            </button>
        </div>
    )
}

export { NotFoundPage }
