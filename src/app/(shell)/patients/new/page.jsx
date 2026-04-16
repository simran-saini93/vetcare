import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import PatientForm from '@/components/patients/PatientForm'

export const metadata = { title: 'New Patient — VetCare Pro' }

export default function NewPatientPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Patients
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Register New Patient</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
          Complete all three steps to create a full patient profile.
        </p>
      </div>
      <PatientForm />
    </div>
  )
}
