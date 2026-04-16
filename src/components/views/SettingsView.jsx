'use client'

import { Card, Input, Button } from '@/components/ui'

export default function SettingsView() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">System Settings</h1>
      <Card>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clinic Profile</h3>
            <p className="text-sm text-gray-500 mt-1">Manage your clinic public information.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Clinic Name"     defaultValue="VetCare Pro Clinic" />
            <Input label="Phone"           defaultValue="+1 (555) 000-0000" />
            <Input label="Address"         defaultValue="123 Pet Street" />
            <Input label="License Number"  defaultValue="VET-2024-X99" />
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
