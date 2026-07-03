import { getCurrentShop } from '@/lib/db'
import { SettingsView } from '@/components/settings/settings-view'

export default async function SettingsPage() {
  const shop = await getCurrentShop()
  if (!shop) return null
  return <SettingsView shop={shop} />
}
