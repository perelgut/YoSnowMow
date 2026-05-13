import { useRef, useState } from 'react'
import { useMock } from '../../context/MockStateContext'

const MAX_PHOTOS = 5
const MAX_SIZE_BYTES = 10 * 1024 * 1024

export default function Property() {
  const { mockUser, setPropertyPhotos } = useMock()
  const { propertyPhotos } = mockUser
  const inputRef = useRef(null)
  const [sizeError, setSizeError] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    if (file.size > MAX_SIZE_BYTES) {
      setSizeError(`"${file.name}" exceeds 10 MB. Please choose a smaller image.`)
      return
    }
    setSizeError(null)
    const url = URL.createObjectURL(file)
    setPropertyPhotos(prev => [...prev, url].slice(0, MAX_PHOTOS))
  }

  function removePhoto(index) {
    setPropertyPhotos(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 'var(--sp-2)' }}>
        My Property Photos
      </h2>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', marginBottom: 'var(--sp-6)' }}>
        Up to 5 photos saved to your account. Included automatically when you post a job.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
        {propertyPhotos.map((url, i) => (
          <div key={url} style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
            <img
              src={url}
              alt={`Property photo ${i + 1}`}
              style={{ width: 96, height: 96, borderRadius: 'var(--radius-lg)', objectFit: 'cover', border: '1px solid var(--gray-200)', display: 'block' }}
            />
            <button
              onClick={() => removePhoto(i)}
              aria-label={`Remove photo ${i + 1}`}
              style={{
                position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none',
                color: '#fff', fontSize: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}
            >✕</button>
          </div>
        ))}

        {propertyPhotos.length < MAX_PHOTOS && (
          <button
            onClick={() => { setSizeError(null); inputRef.current?.click() }}
            style={{
              width: 96, height: 96, borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--blue)', background: 'var(--blue-light)',
              cursor: 'pointer', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--blue)',
            }}
          >
            <span style={{ fontSize: 'var(--font-size-2xl)' }}>+</span>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Add Photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {sizeError && (
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--red)', marginBottom: 'var(--sp-3)' }}>
          ⚠ {sizeError}
        </p>
      )}

      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', marginBottom: 'var(--sp-6)' }}>
        {propertyPhotos.length} of {MAX_PHOTOS} slots used · JPG, PNG, WEBP · max 10 MB each
      </p>

      <div style={{
        background: 'var(--blue-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--sp-4)',
        fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)',
        border: '1px solid var(--gray-200)',
      }}>
        💡 These photos are shown to Workers whenever you post a job. Keep them up to date — clear shots of your driveway, walkway, and steps help Workers give you a fair price.
      </div>
    </div>
  )
}
