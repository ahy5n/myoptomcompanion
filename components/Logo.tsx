/** The app mark: a white eye on an ink tile (matches the app icon). */
export function LogoMark({ className = 'size-8', inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-[9px] ${inverted ? 'bg-white' : 'bg-ink'} ${className}`}>
      <svg viewBox="0 0 100 100" className="size-[68%]">
        <path d="M8 50 Q 50 8 92 50 Q 50 92 8 50 Z" fill={inverted ? '#0f1419' : '#ffffff'} />
        <circle cx="50" cy="50" r="17" fill="#5b7cf0" />
        <circle cx="50" cy="50" r="7.5" fill={inverted ? '#ffffff' : '#0f1419'} />
      </svg>
    </span>
  )
}

export function Wordmark({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark inverted={inverted} />
      <span className={`text-[17px] font-semibold tracking-tight ${inverted ? 'text-white' : 'text-ink'}`}>myoptomcompanion</span>
    </span>
  )
}
