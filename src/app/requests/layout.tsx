import { RequireRole } from '@/components/RequireRole'

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireRole role="seeker">{children}</RequireRole>
}
