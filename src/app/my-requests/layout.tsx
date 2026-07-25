import { RequireRole } from '@/components/RequireRole'

export default function MyRequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireRole role="giver">{children}</RequireRole>
}
