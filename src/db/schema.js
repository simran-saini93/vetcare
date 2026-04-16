import {
  mysqlTable, varchar, timestamp, boolean,
  text, mysqlEnum, decimal, int, date
} from 'drizzle-orm/mysql-core'

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = mysqlTable('users', {
  id:        varchar('id', { length: 36 }).primaryKey(),
  clerkId:   varchar('clerk_id', { length: 100 }).notNull().unique(),
  email:     varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }),
  lastName:  varchar('last_name', { length: 100 }),
  role:      mysqlEnum('role', ['admin', 'vet', 'nurse', 'receptionist', 'read_only']).notNull().default('receptionist'),
  isActive:  boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Owners ────────────────────────────────────────────────────────────────────
export const owners = mysqlTable('owners', {
  id:        varchar('id', { length: 36 }).primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName:  varchar('last_name', { length: 100 }).notNull(),
  email:     varchar('email', { length: 255 }),
  phone:     varchar('phone', { length: 30 }).notNull(),
  altPhone:  varchar('alt_phone', { length: 30 }),
  address:   text('address'),
  city:      varchar('city', { length: 100 }),
  notes:     text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Patients ──────────────────────────────────────────────────────────────────
export const patients = mysqlTable('patients', {
  id:                varchar('id', { length: 36 }).primaryKey(),
  name:              varchar('name', { length: 100 }).notNull(),
  species:           varchar('species', { length: 50 }).notNull(),
  breed:             varchar('breed', { length: 100 }),
  dateOfBirth:       date('date_of_birth'),
  sex:               mysqlEnum('sex', ['male', 'female', 'unknown']).default('unknown'),
  isNeutered:        boolean('is_neutered').default(false),
  color:             varchar('color', { length: 100 }),
  microchipNumber:   varchar('microchip_number', { length: 50 }),
  allergies:         text('allergies'),
  chronicConditions: text('chronic_conditions'),
  handlingNotes:     text('handling_notes'),
  insuranceProvider: varchar('insurance_provider', { length: 100 }),
  insurancePolicyNo: varchar('insurance_policy_no', { length: 100 }),
  isActive:          boolean('is_active').notNull().default(true),
  isStreetAnimal:    boolean('is_street_animal').notNull().default(false),
  primaryPhotoUrl:   varchar('primary_photo_url', { length: 500 }),
  lastVisitDate:     timestamp('last_visit_date'),
  createdAt:         timestamp('created_at').defaultNow().notNull(),
  updatedAt:         timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Patient ↔ Owner (junction) ────────────────────────────────────────────────
export const patientOwners = mysqlTable('patient_owners', {
  id:           varchar('id', { length: 36 }).primaryKey(),
  patientId:    varchar('patient_id', { length: 36 }).notNull(),
  ownerId:      varchar('owner_id', { length: 36 }).notNull(),
  relationship: mysqlEnum('relationship', ['primary', 'secondary', 'emergency']).default('primary'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
})

// ── Patient Photos ────────────────────────────────────────────────────────────
export const patientPhotos = mysqlTable('patient_photos', {
  id:                 varchar('id', { length: 36 }).primaryKey(),
  patientId:          varchar('patient_id', { length: 36 }).notNull(),
  cloudinaryUrl:      varchar('cloudinary_url', { length: 500 }).notNull(),
  cloudinaryPublicId: varchar('cloudinary_public_id', { length: 200 }).notNull(),
  label:              varchar('label', { length: 100 }),
  notes:              text('notes'),
  takenAt:            timestamp('taken_at'),
  uploadedBy:         varchar('uploaded_by', { length: 100 }),
  visitId:            varchar('visit_id', { length: 36 }),
  isPrimary:          boolean('is_primary').default(false),
  isArchived:         boolean('is_archived').default(false),
  createdAt:          timestamp('created_at').defaultNow().notNull(),
})

// ── Weight Records ────────────────────────────────────────────────────────────
export const weightRecords = mysqlTable('weight_records', {
  id:         varchar('id', { length: 36 }).primaryKey(),
  patientId:  varchar('patient_id', { length: 36 }).notNull(),
  weightKg:   decimal('weight_kg', { precision: 5, scale: 2 }).notNull(),
  recordedAt: timestamp('recorded_at').notNull(),
  recordedBy: varchar('recorded_by', { length: 100 }),
  notes:      text('notes'),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
})

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointments = mysqlTable('appointments', {
  id:              varchar('id', { length: 36 }).primaryKey(),
  patientId:       varchar('patient_id', { length: 36 }).notNull(),
  patientName:     varchar('patient_name', { length: 100 }),
  vetId:           varchar('vet_id', { length: 100 }),
  scheduledAt:     timestamp('scheduled_at').notNull(),
  type:            mysqlEnum('type', ['checkup', 'surgery', 'emergency', 'vaccination', 'grooming', 'followup']).notNull().default('checkup'),
  status:          mysqlEnum('status', ['scheduled', 'completed', 'cancelled', 'no_show']).notNull().default('scheduled'),
  durationMinutes: int('duration_minutes'),
  followUpDate:    timestamp('follow_up_date'),
  notes:           text('notes'),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
  updatedAt:       timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Visit Records ─────────────────────────────────────────────────────────────
export const visitRecords = mysqlTable('visit_records', {
  id:                    varchar('id', { length: 36 }).primaryKey(),
  appointmentId:         varchar('appointment_id', { length: 36 }),
  patientId:             varchar('patient_id', { length: 36 }).notNull(),
  vetId:                 varchar('vet_id', { length: 100 }),
  chiefComplaint:        text('chief_complaint'),
  temperature:           decimal('temperature', { precision: 4, scale: 1 }),
  weightKg:              decimal('weight_kg', { precision: 5, scale: 2 }),
  heartRate:             int('heart_rate'),
  respiratoryRate:       int('respiratory_rate'),
  diagnosisPrimary:      text('diagnosis_primary'),
  diagnosisDifferential: text('diagnosis_differential'),
  diagnosisCode:         varchar('diagnosis_code', { length: 100 }),
  treatmentPlan:         text('treatment_plan'),
  proceduresPerformed:   text('procedures_performed'),
  internalNotes:         text('internal_notes'),
  followUpInstructions:  text('follow_up_instructions'),
  createdAt:             timestamp('created_at').defaultNow().notNull(),
  updatedAt:             timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const prescriptions = mysqlTable('prescriptions', {
  id:              varchar('id', { length: 36 }).primaryKey(),
  visitId:         varchar('visit_id', { length: 36 }).notNull(),
  patientId:       varchar('patient_id', { length: 36 }).notNull(),
  drugName:        varchar('drug_name', { length: 100 }).notNull(),
  dose:            varchar('dose', { length: 50 }),
  frequency:       varchar('frequency', { length: 50 }),
  duration:        varchar('duration', { length: 50 }),
  dispensingNotes: text('dispensing_notes'),
  prescribedBy:    varchar('prescribed_by', { length: 100 }),
  createdAt:       timestamp('created_at').defaultNow().notNull(),
})

// ── Lab Requests ──────────────────────────────────────────────────────────────
export const labRequests = mysqlTable('lab_requests', {
  id:            varchar('id', { length: 36 }).primaryKey(),
  visitId:       varchar('visit_id', { length: 36 }).notNull(),
  patientId:     varchar('patient_id', { length: 36 }).notNull(),
  testName:      varchar('test_name', { length: 100 }).notNull(),
  status:        mysqlEnum('status', ['requested', 'in_progress', 'completed']).notNull().default('requested'),
  result:        text('result'),
  fileUrl:       varchar('file_url', { length: 500 }),
  filePublicId:  varchar('file_public_id', { length: 200 }),
  requestedBy:   varchar('requested_by', { length: 100 }),
  completedAt:   timestamp('completed_at'),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

// ── Vaccinations ──────────────────────────────────────────────────────────────
export const vaccinations = mysqlTable('vaccinations', {
  id:                   varchar('id', { length: 36 }).primaryKey(),
  patientId:            varchar('patient_id', { length: 36 }).notNull(),
  visitId:              varchar('visit_id', { length: 36 }),
  vaccineName:          varchar('vaccine_name', { length: 100 }).notNull(),
  batchNumber:          varchar('batch_number', { length: 50 }),
  administeredAt:       timestamp('administered_at').notNull(),
  administeredBy:       varchar('administered_by', { length: 100 }),
  doseNumber:           int('dose_number').default(1),
  seriesTotal:          int('series_total').default(1),
  nextDueDate:          timestamp('next_due_date'),
  status:               mysqlEnum('status', ['up_to_date', 'due_soon', 'overdue']).notNull().default('up_to_date'),
  uploadedCertUrl:      varchar('uploaded_cert_url', { length: 500 }),
  remindersSuppressed:  boolean('reminders_suppressed').default(false),
  certificateUrl:       varchar('certificate_url', { length: 500 }),
  createdAt:            timestamp('created_at').defaultNow().notNull(),
  updatedAt:            timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Vaccine Certificates ──────────────────────────────────────────────────────
export const vaccineCertificates = mysqlTable('vaccine_certificates', {
  id:            varchar('id', { length: 36 }).primaryKey(),
  vaccinationId: varchar('vaccination_id', { length: 36 }).notNull(),
  patientId:     varchar('patient_id', { length: 36 }).notNull(),
  pdfUrl:        varchar('pdf_url', { length: 500 }),
  qrCodeData:    text('qr_code_data'),
  issuedBy:      varchar('issued_by', { length: 100 }),
  issuedAt:      timestamp('issued_at').notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

// ── Reminder Logs ─────────────────────────────────────────────────────────────
export const reminderLogs = mysqlTable('reminder_logs', {
  id:            varchar('id', { length: 36 }).primaryKey(),
  vaccinationId: varchar('vaccination_id', { length: 36 }).notNull(),
  patientId:     varchar('patient_id', { length: 36 }).notNull(),
  ownerId:       varchar('owner_id', { length: 36 }),
  channel:       mysqlEnum('channel', ['email', 'sms']).notNull(),
  status:        mysqlEnum('status', ['sent', 'delivered', 'failed']).notNull().default('sent'),
  sentAt:        timestamp('sent_at').notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
})

// ── Inventory ─────────────────────────────────────────────────────────────────
export const inventory = mysqlTable('inventory', {
  id:                varchar('id', { length: 36 }).primaryKey(),
  name:              varchar('name', { length: 100 }).notNull(),
  category:          mysqlEnum('category', ['Medicine', 'Food', 'Equipment', 'Supplies']).notNull().default('Medicine'),
  stock:             int('stock').notNull().default(0),
  unit:              varchar('unit', { length: 30 }).notNull().default('units'),
  price:             decimal('price', { precision: 10, scale: 2 }).notNull().default('0.00'),
  lowStockThreshold: int('low_stock_threshold').notNull().default(10),
  createdAt:         timestamp('created_at').defaultNow().notNull(),
  updatedAt:         timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Invoices ──────────────────────────────────────────────────────────────────
export const invoices = mysqlTable('invoices', {
  id:          varchar('id', { length: 36 }).primaryKey(),
  patientId:   varchar('patient_id', { length: 36 }).notNull(),
  patientName: varchar('patient_name', { length: 100 }),
  visitId:     varchar('visit_id', { length: 36 }),
  description: text('description').notNull(),
  amount:      decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status:      mysqlEnum('status', ['pending', 'paid', 'overdue', 'cancelled']).notNull().default('pending'),
  dueDate:     timestamp('due_date'),
  paidAt:      timestamp('paid_at'),
  notes:       text('notes'),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
  updatedAt:   timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
})

// ── Invoice Items ─────────────────────────────────────────────────────────────
export const invoiceItems = mysqlTable('invoice_items', {
  id:          varchar('id', { length: 36 }).primaryKey(),
  invoiceId:   varchar('invoice_id', { length: 36 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  quantity:    int('quantity').notNull().default(1),
  unitPrice:   decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  total:       decimal('total', { precision: 10, scale: 2 }).notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

// ── Custom Options ─────────────────────────────────────────────────────────────
export const customOptions = mysqlTable('custom_options', {
  id:        varchar('id', { length: 36 }).primaryKey(),
  type:      varchar('type', { length: 50 }).notNull(),  // e.g. 'breed', 'drug_name'
  value:     varchar('value', { length: 255 }).notNull(),
  createdBy: varchar('created_by', { length: 100 }),     // Clerk user ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Appointment Vitals (recorded by staff before vet visit) ───────────────────
export const appointmentVitals = mysqlTable('appointment_vitals', {
  id:              varchar('id', { length: 36 }).primaryKey(),
  appointmentId:   varchar('appointment_id', { length: 36 }).notNull(),
  patientId:       varchar('patient_id', { length: 36 }),
  weightKg:        decimal('weight_kg', { precision: 5, scale: 2 }),
  temperature:     decimal('temperature', { precision: 4, scale: 1 }),
  heartRate:       int('heart_rate'),
  respiratoryRate: int('respiratory_rate'),
  recordedBy:      varchar('recorded_by', { length: 100 }),
  recordedAt:      timestamp('recorded_at').defaultNow(),
})
