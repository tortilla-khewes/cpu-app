// Fix 5: Image attachment component. Supports upload from device or direct camera capture
// (via capture="environment"). Images are compressed client-side to ~1200px max dimension
// at 80% JPEG quality before being stored as base64 in the record.
// NOTE: Base64 storage in Cosmos DB is suitable for demo/small images only.
// In production, replace with Azure Blob Storage upload + store URL reference instead.

import { useRef } from 'react'
import SectionCard from './SectionCard'

const MAX_IMAGES = 5
const MAX_DIMENSION = 1200
const JPEG_QUALITY = 0.8

function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width = MAX_DIMENSION
          } else {
            width = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

export default function ImageUpload({ images = [], onChange, readOnly }) {
  const inputRef = useRef()

  async function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const slots = MAX_IMAGES - images.length
    const compressed = await Promise.all(files.slice(0, slots).map(compressImage))
    onChange([...images, ...compressed])
    e.target.value = ''
  }

  function remove(idx) {
    onChange(images.filter((_, i) => i !== idx))
  }

  const canAdd = !readOnly && images.length < MAX_IMAGES

  return (
    <SectionCard title="Attachments" status={images.length > 0 ? 'complete' : 'not_started'}>
      <div className="image-gallery">
        {images.map((src, i) => (
          <div key={i} className="image-thumb">
            <img
              src={src}
              alt={`Attachment ${i + 1}`}
              className="image-thumb__img"
              onClick={() => window.open(src, '_blank')}
            />
            {!readOnly && (
              <button className="image-thumb__remove" onClick={() => remove(i)} aria-label="Remove">✕</button>
            )}
          </div>
        ))}
        {canAdd && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
            <button className="image-add-btn" onClick={() => inputRef.current?.click()}>
              <span className="image-add-btn__icon">📷</span>
              <span className="image-add-btn__label">Add Photo</span>
              <span className="image-add-btn__count">{images.length} / {MAX_IMAGES}</span>
            </button>
          </>
        )}
        {images.length === 0 && readOnly && (
          <p className="muted">No attachments on this record.</p>
        )}
      </div>
    </SectionCard>
  )
}
