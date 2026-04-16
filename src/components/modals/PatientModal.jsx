'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useVetCareStore } from '@/store'
import { Modal, Input, Select, Button } from '@/components/ui'
import { patientsApi } from '@/lib/api'

const PatientSchema = z.object({
  name:         z.string().min(1, 'Pet name is required'),
  species:      z.enum(['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile', 'Other']),
  breed:        z.string().optional(),
  age:          z.string().optional(),
  ownerName:    z.string().min(1, 'Owner name is required'),
  ownerContact: z.string().min(1, 'Contact is required'),
})

export default function PatientModal() {
  const { modals, closeModal, patients, setPatients } = useVetCareStore()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(PatientSchema),
    defaultValues: { species: 'Dog' },
  })

  const onSubmit = async (data) => {
    try {
      const created = await patientsApi.create(data)
      setPatients([created, ...patients])
      reset()
      closeModal('patient')
    } catch (err) {
      console.error(err.message)
    }
  }

  return (
    <Modal isOpen={modals.patient} onClose={() => { reset(); closeModal('patient') }} title="Register New Patient">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-1">
        <Input label="Pet Name" error={errors.name?.message} {...register('name')} />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Species"
            options={[
              { value: 'Dog',     label: 'Dog' },
              { value: 'Cat',     label: 'Cat' },
              { value: 'Bird',    label: 'Bird' },
              { value: 'Rabbit',  label: 'Rabbit' },
              { value: 'Reptile', label: 'Reptile' },
              { value: 'Other',   label: 'Other' },
            ]}
            {...register('species')}
          />
          <Input label="Breed" error={errors.breed?.message} {...register('breed')} />
        </div>
        <Input label="Age" placeholder="e.g. 3 years" error={errors.age?.message} {...register('age')} />
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 mt-2">
          <h4 className="text-sm font-medium mb-3 text-gray-900 dark:text-white">Owner Details</h4>
          <Input label="Owner Name"   error={errors.ownerName?.message}    {...register('ownerName')} />
          <Input label="Contact"      error={errors.ownerContact?.message}  {...register('ownerContact')} />
        </div>
        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? 'Registering…' : 'Register Patient'}
        </Button>
      </form>
    </Modal>
  )
}
