import type { ReactNode } from "react"

interface ToolCardProps {
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
}

export default function ToolCard({ icon, title, description, children }: ToolCardProps) {
  return (
    <section
      className="bg-white dark:bg-[#18181b] rounded-2xl shadow-lg p-6 flex flex-col items-center transition-transform hover:scale-105 focus-within:scale-105 outline-none focus:ring-2 focus:ring-blue-500"
      tabIndex={0}
      aria-label={title}
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-xl font-bold mb-2 text-center">{title}</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-center">{description}</p>
      {children}
    </section>
  )
} 