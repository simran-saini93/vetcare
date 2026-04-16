'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Upload, X, Star, Trash2, Image, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'

// ── Upload to Cloudinary ──────────────────────────────────────────────────────

async function uploadToCloudinary(file, patientId) {
  const sigRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folder: `vetcare/patients/${patientId}` }),
  })
  if (!sigRes.ok) throw new Error('Failed to get upload signature')
  const { signature, timestamp, cloudName, apiKey, folder, uploadPreset } = await sigRes.json()

  const formData = new FormData()
  formData.append('file',          file)
  formData.append('api_key',       apiKey)
  formData.append('timestamp',     timestamp)
  formData.append('signature',     signature)
  formData.append('folder',        folder)
  formData.append('upload_preset', uploadPreset)

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  )
  if (!uploadRes.ok) throw new Error('Cloudinary upload failed')
  return uploadRes.json()
}

// ── Photo card ────────────────────────────────────────────────────────────────

function PhotoCard({ photo, onSetPrimary, onArchive, isPrimary }) {
  const [hovering, setHovering] = useState(false)

  return (
    <div
      className={`relative group rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-zinc-800 cursor-pointer ${
        isPrimary ? 'ring-2 ring-indigo-500' : ''
      }`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <img
        src={photo.cloudinaryUrl}
        alt={photo.label || 'Patient photo'}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Primary badge */}
      {isPrimary && (
        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Star size={10} /> Primary
        </div>
      )}

      {/* Hover overlay */}
      <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 flex flex-col justify-between p-2 ${hovering ? 'opacity-100' : 'opacity-0'}`}>
        {photo.label && (
          <p className="text-white text-xs font-medium truncate">{photo.label}</p>
        )}
        <div className="flex justify-end gap-1 mt-auto">
          {!isPrimary && (
            <button
              onClick={() => onSetPrimary(photo)}
              className="p-1.5 bg-white/20 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              title="Set as primary"
            >
              <Star size={14} />
            </button>
          )}
          <button
            onClick={() => onArchive(photo)}
            className="p-1.5 bg-white/20 hover:bg-red-600 text-white rounded-lg transition-colors"
            title="Remove photo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Camera card (dotted) ──────────────────────────────────────────────────────

function CameraCard({ onFileSelect, uploading, disabled }) {
  const cameraRef = useRef(null)

  return (
    <div
      onClick={() => !disabled && !uploading && cameraRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl aspect-square flex flex-col items-center justify-center gap-2
        transition-all duration-200
        ${disabled
          ? 'border-gray-200 dark:border-zinc-700 opacity-40 cursor-not-allowed'
          : 'border-gray-300 dark:border-zinc-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 cursor-pointer'
        }
      `}
    >
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files || [])
          files.forEach(f => onFileSelect(f))
          e.target.value = ''
        }}
        disabled={disabled}
      />

      {uploading ? (
        <Loader2 size={28} className="text-indigo-500 animate-spin" />
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-zinc-500">
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
            <circle cx="12" cy="13" r="3"/>
          </svg>
          <p className="text-xs text-gray-400 dark:text-zinc-500 text-center px-2">
            {disabled ? 'Max 5 reached' : 'Tap to take photo'}
          </p>
        </>
      )}
    </div>
  )
}

// ── Label modal ───────────────────────────────────────────────────────────────

function LabelModal({ file, onConfirm, onCancel }) {
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [preview] = useState(() => URL.createObjectURL(file))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="font-bold text-gray-900 dark:text-white">Add Photo Details</h3>
          <button onClick={onCancel} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              Label <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              value={label}
              onChange={e => setLabel(e.target.value)}
              placeholder='e.g. "Profile", "Pre-treatment", "Follow-up"'
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any additional notes…"
              rows={2}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-zinc-700 rounded-xl text-sm bg-white dark:bg-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button onClick={() => onConfirm({ label, notes })} className="flex-1">Upload Photo</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main PhotoGallery ─────────────────────────────────────────────────────────

export default function PhotoGallery({ patientId, initialPhotos = [], onPrimaryChange }) {
  const [photos, setPhotos]           = useState(initialPhotos)
  const [uploading, setUploading]     = useState(false)
  const [pendingFiles, setPendingFiles] = useState([]) // queue of files
  const [currentFile, setCurrentFile] = useState(null) // file in label modal
  const galleryRef = useRef(null)

  const activePhotos = photos.filter(p => !p.isArchived)
  const remaining    = 5 - activePhotos.length

  // ── Upload single file ────────────────────────────────────────────────────

  const uploadFile = async (file, label = '', notes = '', makePrimary = false) => {
    try {
      const result = await uploadToCloudinary(file, patientId)

      const res = await fetch('/api/patient-photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          cloudinaryUrl:      result.secure_url,
          cloudinaryPublicId: result.public_id,
          label:     label || null,
          notes:     notes || null,
          takenAt:   new Date().toISOString(),
          isPrimary: makePrimary,
        }),
      })
      if (!res.ok) throw new Error('Failed to save photo')
      const { id } = await res.json()

      const newPhoto = {
        id,
        patientId,
        cloudinaryUrl:      result.secure_url,
        cloudinaryPublicId: result.public_id,
        label,
        notes,
        isPrimary:  makePrimary,
        isArchived: false,
        createdAt:  new Date().toISOString(),
      }

      setPhotos(prev => [...prev, newPhoto])
      return newPhoto
    } catch (err) {
      throw err
    }
  }

  // ── Handle file from camera (single, show label modal) ────────────────────

  const handleCameraFile = (file) => {
    if (activePhotos.length >= 5) { toast.error('Maximum 5 photos reached'); return }
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return }
    setCurrentFile(file)
  }

  // ── Handle files from gallery (multiple) ─────────────────────────────────

  const handleGalleryFiles = async (files) => {
    const available = 5 - activePhotos.length
    if (available === 0) { toast.error('Maximum 5 photos reached'); return }

    const toUpload = files.slice(0, available)
    if (files.length > available) {
      toast.info(`Only ${available} photo${available !== 1 ? 's' : ''} can be added. Uploading first ${available}.`)
    }

    setUploading(true)
    let successCount = 0
    const hasExisting = activePhotos.length > 0

    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i]
      if (!file.type.startsWith('image/')) continue
      // Only the very first photo uploaded becomes primary (if no photos exist yet)
      const makePrimary = !hasExisting && i === 0 && successCount === 0
      try {
        const photo = await uploadFile(file, '', '', makePrimary)
        if (makePrimary && onPrimaryChange) onPrimaryChange(photo.cloudinaryUrl)
        successCount++
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    setUploading(false)
    if (successCount > 0) toast.success(`${successCount} photo${successCount !== 1 ? 's' : ''} uploaded`)
  }

  // ── Label modal confirm ───────────────────────────────────────────────────

  const handleLabelConfirm = async ({ label, notes }) => {
    const file = currentFile
    setCurrentFile(null)
    setUploading(true)
    const makePrimary = activePhotos.length === 0
    try {
      const photo = await uploadFile(file, label, notes, makePrimary)
      if (makePrimary && onPrimaryChange) onPrimaryChange(photo.cloudinaryUrl)
      toast.success('Photo uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  // ── Set primary ───────────────────────────────────────────────────────────

  const handleSetPrimary = async (photo) => {
    try {
      await fetch(`/api/patient-photos/${photo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPrimary: true }),
      })
      setPhotos(prev => prev.map(p => ({ ...p, isPrimary: p.id === photo.id })))
      if (onPrimaryChange) onPrimaryChange(photo.cloudinaryUrl)
      toast.success('Primary photo updated')
    } catch {
      toast.error('Failed to update primary photo')
    }
  }

  // ── Archive / delete ──────────────────────────────────────────────────────

  const handleArchive = async (photo) => {
    if (!confirm('Remove this photo?')) return
    try {
      await fetch(`/api/patient-photos/${photo.id}`, { method: 'DELETE' })
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      if (photo.isPrimary) {
        const next = photos.find(p => !p.isArchived && p.id !== photo.id)
        if (next) handleSetPrimary(next)
        else if (onPrimaryChange) onPrimaryChange(null)
      }
      toast.success('Photo removed')
    } catch {
      toast.error('Failed to remove photo')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            <span className="font-semibold text-gray-900 dark:text-white">{activePhotos.length}</span>/5 photos
          </p>
          {activePhotos.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-zinc-500">· First photo becomes primary</p>
          )}
        </div>

        {/* Gallery upload button */}
        {remaining > 0 && (
          <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
            uploading
              ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400'
              : 'border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 hover:border-indigo-400'
          }`}>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={e => {
                const files = Array.from(e.target.files || [])
                if (files.length) handleGalleryFiles(files)
                e.target.value = ''
              }}
            />
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Upload
          </label>
        )}
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* Existing photos */}
        {activePhotos.map(photo => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isPrimary={photo.isPrimary}
            onSetPrimary={handleSetPrimary}
            onArchive={handleArchive}
          />
        ))}

        {/* Camera dotted card — always show if under 5 */}
        {remaining > 0 && (
          <CameraCard
            onFileSelect={handleCameraFile}
            uploading={uploading}
            disabled={remaining === 0}
          />
        )}
      </div>

      {/* Empty state */}
      {activePhotos.length === 0 && !uploading && (
        <div className="text-center py-6">
          <Image size={32} className="mx-auto mb-2 text-gray-300 dark:text-zinc-700" />
          <p className="text-sm text-gray-400 dark:text-zinc-500">No photos yet. Tap the camera card or Upload button.</p>
        </div>
      )}

      {/* Label modal — for camera photos */}
      {currentFile && (
        <LabelModal
          file={currentFile}
          onConfirm={handleLabelConfirm}
          onCancel={() => setCurrentFile(null)}
        />
      )}
    </div>
  )
}
