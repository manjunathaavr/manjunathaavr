import { RequireRole } from '@/components/RequireRole'

export default function OfferLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RequireRole role="seeker">{children}</RequireRole>
}
