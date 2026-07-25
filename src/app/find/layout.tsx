import { RequireRole } from '@/components/RequireRole'

export default function FindLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireRole role="giver">{children}</RequireRole>
}
