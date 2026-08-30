import { AppProvider } from '@/components/app-provider'
import { DashboardShell } from '@/components/dashboard-shell'

export default function Page() {
  return (
    <AppProvider>
      <DashboardShell />
    </AppProvider>
  )
}
