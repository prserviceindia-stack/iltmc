'use client'

export default function LoadingSpinner({
  label = 'Loading...',
  className = '',
  fullHeight = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullHeight ? 'min-h-[50vh]' : 'py-16'
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      {label ? <p className="mt-4 text-gray-400 text-sm">{label}</p> : null}
    </div>
  )
}
