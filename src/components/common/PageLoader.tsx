interface PageLoaderProps {
  variant?: 'dark' | 'light'
}

export default function PageLoader({ variant = 'dark' }: PageLoaderProps) {
  const bgClass = variant === 'dark' ? 'bg-dark-950' : 'bg-gray-50'
  const spinnerColor = variant === 'dark' ? 'border-accent-500' : 'border-blue-500'

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgClass}`}>
      <div className={`w-10 h-10 border-[3px] ${spinnerColor} border-t-transparent rounded-full animate-spin`} />
    </div>
  )
}
