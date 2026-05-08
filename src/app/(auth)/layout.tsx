export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <span className="text-3xl">○</span>
          </div>
          <h1 className="text-3xl font-bold text-indigo-900">Circle</h1>
          <p className="mt-1 text-slate-500 text-sm">Community-building circles for teachers</p>
        </div>
        {children}
      </div>
    </div>
  )
}
