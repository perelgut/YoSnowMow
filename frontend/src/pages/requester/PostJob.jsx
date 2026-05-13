import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postJob, validateAddress } from '../../services/api'
import useAuth from '../../hooks/useAuth'
import Modal from '../../components/Modal'
import { useMock } from '../../context/MockStateContext'

const SERVICES = [
  {
    key: 'driveway', label: 'Driveway Clearing',
    sizes: [
      { key: 'small',  label: 'Small',  desc: '1 car',    price: 3500 },
      { key: 'medium', label: 'Medium', desc: '2 car',    price: 5500 },
      { key: 'large',  label: 'Large',  desc: '3+ cars',  price: 8000 },
    ],
  },
  {
    key: 'walkway', label: 'Walkway / Sidewalk',
    sizes: [
      { key: 'small',  label: 'Small',  desc: '5–10 m',  price: 1500 },
      { key: 'medium', label: 'Medium', desc: '10–20 m', price: 2500 },
      { key: 'large',  label: 'Large',  desc: '20+ m',   price: 4000 },
    ],
  },
  {
    key: 'steps', label: 'Steps',
    sizes: [
      { key: 'small',  label: 'Small',  desc: '2–5 steps',  price: 1000 },
      { key: 'medium', label: 'Medium', desc: '6–9 steps',  price: 1500 },
      { key: 'large',  label: 'Large',  desc: '10+ steps',  price: 2000 },
    ],
  },
  {
    key: 'salting', label: 'Salting / Ice Melt',
    sizes: [
      { key: 'small',  label: 'Small',  desc: 'Small area',  price: 1000 },
      { key: 'medium', label: 'Medium', desc: 'Medium area', price: 2000 },
      { key: 'large',  label: 'Large',  desc: 'Large area',  price: 3000 },
    ],
  },
  {
    key: 'lawn', label: 'Mow the lawn',
    sizes: [
      { key: 'small',  label: 'Small',  desc: '< 500 m²',    price: 4000 },
      { key: 'medium', label: 'Medium', desc: '500–1,500 m²', price: 6500 },
      { key: 'large',  label: 'Large',  desc: '1,500+ m²',   price: 9500 },
    ],
  },
]

const fmt = cents => '$' + (cents / 100).toFixed(2)

export default function PostJob() {
  const navigate   = useNavigate()
  const { userProfile } = useAuth()
  const hasHomeAddress = !!(userProfile?.homeAddressText)
  const [useHomeAddr, setUseHomeAddr] = useState(true) // default to home address when available
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [validating, setValidating] = useState(false)
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [customPriceInput, setCustomPriceInput] = useState('')
  const [addrError, setAddrError] = useState(null)
  const [addrModal, setAddrModal] = useState(false)
  const [form, setForm] = useState({
    unitNumber: '', streetNumber: '', streetName: '',
    city: '', province: 'ON', postalCode: '',
    propertyType: 'House', driveSize: 'Medium',
    services: {}, schedule: 'asap', date: '', time: '', notes: '',
  })

  const { mockUser } = useMock()
  const reqPhotoInputRef = useRef(null)
  // null = not yet initialised; initialised when user first reaches Step 3
  const [selectedPropPhotos, setSelectedPropPhotos] = useState(null)
  const [reqPhotos, setReqPhotos] = useState([]) // [{ file: File, url: string }]
  const [photoError, setPhotoError] = useState(null)

  // Revoke all object URLs created for per-request photo previews when the
  // component unmounts, to prevent memory leaks from retained blob references.
  useEffect(() => {
    return () => {
      reqPhotos.forEach(p => URL.revokeObjectURL(p.url))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Assemble the full address string for the API and review screen.
  // When using home address, we use the stored profile value directly.
  const enteredAddress = [
    form.unitNumber.trim()
      ? `Unit ${form.unitNumber.trim()}, ${form.streetNumber.trim()} ${form.streetName.trim()}`
      : `${form.streetNumber.trim()} ${form.streetName.trim()}`,
    form.city.trim(),
    `${form.province} ${form.postalCode.trim().toUpperCase()}`,
  ].filter(p => p.replace(/,/g, '').trim()).join(', ')
  const fullAddress = (hasHomeAddress && useHomeAddr) ? userProfile.homeAddressText : enteredAddress
  const [ack, setAck] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // services[key] = size string ('small'|'medium'|'large') or falsy if not selected
  const toggleSvc = k => setForm(f => ({
    ...f, services: { ...f.services, [k]: f.services[k] ? null : 'medium' },
  }))
  const setSvcSize = (k, size) => setForm(f => ({
    ...f, services: { ...f.services, [k]: size },
  }))

  const selectedServices = SERVICES.filter(s => form.services[s.key])
  const basePrice = selectedServices.reduce((a, s) => {
    const sizeObj = s.sizes.find(sz => sz.key === form.services[s.key])
    return a + (sizeObj ? sizeObj.price : 0)
  }, 0)
  const customPriceCents = useCustomPrice && customPriceInput
    ? Math.round(parseFloat(customPriceInput) * 100) : null
  const postedPrice = (customPriceCents != null && customPriceCents > 0) ? customPriceCents : basePrice
  const hst = Math.round(postedPrice * 0.13)
  const fee = Math.round(postedPrice * 0.15)
  const total = postedPrice + hst
  const workerNet = postedPrice - fee + hst

  const CA_POSTAL = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/

  async function nextStep1() {
    setAddrError(null)

    if (hasHomeAddress && useHomeAddr) {
      // Validate the stored home address — it was resolved once but may have changed
      setValidating(true)
      try {
        const result = await validateAddress(userProfile.homeAddressText)
        if (!result.valid) {
          // Switch to manual entry pre-filled with the stored address parts
          setUseHomeAddr(false)
          prefillFromStoredAddress(userProfile.homeAddressText)
          setAddrError("We couldn't resolve your stored home address — please check the street number, street name, city, and postal code")
          return
        }
        setStep(2)
      } catch {
        setAddrError('Address validation is temporarily unavailable. Please try again.')
      } finally {
        setValidating(false)
      }
      return
    }

    // Manual address — run local format checks first
    const e = {}
    if (!form.streetNumber.trim()) e.streetNumber = 'Street number is required'
    if (!form.streetName.trim())   e.streetName   = 'Street name is required'
    if (!form.city.trim())         e.city         = 'City is required'
    if (!form.postalCode.trim())   e.postalCode   = 'Postal code is required'
    else if (!CA_POSTAL.test(form.postalCode.trim())) e.postalCode = 'Enter a valid Canadian postal code (e.g. M5V 3A8)'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})

    setValidating(true)
    try {
      const result = await validateAddress(enteredAddress)
      if (!result.valid) {
        setAddrError("We couldn't resolve this address — please check the street number, street name, city, and postal code")
        return
      }
      setStep(2)
    } catch {
      setAddrError('Address validation is temporarily unavailable. Please try again.')
    } finally {
      setValidating(false)
    }
  }

  // Best-effort parser for stored address strings like
  // "123 Main St, Toronto, ON M5V 3A8" or "Unit 4, 123 Main St, Toronto, ON M5V 3A8"
  function prefillFromStoredAddress(text) {
    if (!text) return
    const parts = text.split(',').map(p => p.trim())
    // Last part: "ON M5V 3A8"
    const lastPart = parts[parts.length - 1] || ''
    const provincePostal = lastPart.match(/^([A-Z]{2})\s+(.+)$/)
    if (provincePostal) {
      set('province', provincePostal[1])
      set('postalCode', provincePostal[2])
    }
    // Second-to-last: city
    if (parts.length >= 3) set('city', parts[parts.length - 2])
    // First part: "Unit 4B, 123 Main St" or "123 Main St"
    const addrPart = parts[0] || ''
    const unitMatch = addrPart.match(/^[Uu]nit\s+(\S+),\s*(\d+)\s+(.+)$/)
    if (unitMatch) {
      set('unitNumber', unitMatch[1])
      set('streetNumber', unitMatch[2])
      set('streetName', unitMatch[3])
    } else {
      const streetMatch = addrPart.match(/^(\d+)\s+(.+)$/)
      if (streetMatch) {
        set('streetNumber', streetMatch[1])
        set('streetName', streetMatch[2])
      }
    }
  }

  function nextStep2() {
    if (!selectedServices.length) { setErrors({ services: 'Select at least one service' }); return }
    if (useCustomPrice && (!customPriceCents || customPriceCents < 100)) {
      setErrors({ customPrice: 'Please enter a valid amount (minimum $1.00)' })
      return
    }
    setErrors({})
    goToStep3()
  }

  async function submit() {
    if (!ack) { setErrors({ ack: 'You must acknowledge to continue' }); return }
    setSubmitting(true)
    setErrors({})

    try {
      // Map frontend service keys to the two backend scope values.
      // Driveway → "driveway"; walkway/steps/salting → "sidewalk".
      const scopeSet = new Set()
      if (form.services.driveway) scopeSet.add('driveway')
      if (form.services.walkway || form.services.steps || form.services.salting) {
        scopeSet.add('sidewalk')
      }
      if (form.services.lawn) scopeSet.add('lawn')
      const scope = scopeSet.size > 0 ? [...scopeSet] : ['driveway']

      // Build detailed service description for the Worker notes field.
      const serviceLines = selectedServices.map(s => {
        const sizeObj = s.sizes.find(sz => sz.key === form.services[s.key])
        return `${s.label}: ${sizeObj.label} (${sizeObj.desc}) — est. ${fmt(sizeObj.price)}`
      })
      const notesForWorker = [
        serviceLines.join('\n'),
        form.notes.trim(),
      ].filter(Boolean).join('\n\n') || null

      // Scheduled start window (null = ASAP)
      const startWindowEarliest =
        form.schedule === 'scheduled' && form.date && form.time
          ? new Date(`${form.date}T${form.time}:00`).toISOString()
          : null

      const photoUrls = [
        ...(selectedPropPhotos ? [...selectedPropPhotos] : mockUser.propertyPhotos),
        ...reqPhotos.map(p => p.url),
      ]

      const job = await postJob({
        scope,
        propertyAddressText:  fullAddress,
        startWindowEarliest,
        startWindowLatest:    null,
        notesForWorker,
        personalWorkerOnly:   false,
        postedPriceCents:     postedPrice,
        photoUrls,
      })

      navigate(`/requester/jobs/${job.jobId}`)

    } catch (err) {
      const data = err.response?.data
      const msg = data?.message || data?.error
        || (typeof data === 'string' ? data : null)
        || err.message
        || 'Failed to post job. Please try again.'
      if (err.response?.status === 422 && msg?.includes('Could not resolve the property address')) {
        setAddrModal(true)
      } else {
        setErrors({ submit: msg })
      }
      setSubmitting(false)
    }
  }

  function togglePropPhoto(url) {
    setSelectedPropPhotos(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  function handleReqPhotoChange(e) {
    const files = Array.from(e.target.files)
    e.target.value = ''
    const remaining = 3 - reqPhotos.length
    const candidates = files.slice(0, remaining)
    const oversized = []
    const valid = []
    for (const f of candidates) {
      if (f.size > 10 * 1024 * 1024) oversized.push(f.name)
      else valid.push({ file: f, url: URL.createObjectURL(f) })
    }
    if (oversized.length) setPhotoError(`Skipped (over 10 MB): ${oversized.join(', ')}`)
    else setPhotoError(null)
    setReqPhotos(prev => [...prev, ...valid].slice(0, 3))
  }

  function removeReqPhoto(index) {
    setReqPhotos(prev => {
      URL.revokeObjectURL(prev[index].url)
      return prev.filter((_, i) => i !== index)
    })
  }

  function goToStep3() {
    // Initialise property photo selection to "all selected" on first visit
    if (selectedPropPhotos === null) {
      setSelectedPropPhotos(new Set(mockUser.propertyPhotos))
    }
    setStep(3)
  }

  function goToStep4() {
    const totalPhotos = (selectedPropPhotos ? selectedPropPhotos.size : mockUser.propertyPhotos.length) + reqPhotos.length
    if (totalPhotos === 0) {
      setPhotoError('Add at least 1 photo to continue.')
      return
    }
    setPhotoError(null)
    setStep(4)
  }

  const totalPhotoCount =
    (selectedPropPhotos ? selectedPropPhotos.size : mockUser.propertyPhotos.length) +
    reqPhotos.length

  const StepCircle = ({ n }) => (
    <div className={`step-circle ${step > n ? 'done' : step === n ? 'active' : ''}`}>
      {step > n ? '✓' : n}
    </div>
  )

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <Modal
        isOpen={addrModal}
        onClose={() => setAddrModal(false)}
        title="Address not recognised"
        footer={
          <button className="btn btn-primary" onClick={() => { setAddrModal(false); setStep(1) }}>
            Fix Address
          </button>
        }
      >
        Your property address couldn&apos;t be verified. Please go back and check it.
      </Modal>

      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--sp-6)' }}>Post a Job</h1>

      {/* Step indicator */}
      <div className="steps">
        {[1,2,3,4].map((n, i) => (
          <div key={n} className="step-item">
            <StepCircle n={n} />
            {i < 3 && <div className={`step-line ${step > n ? 'done' : ''}`} />}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', fontWeight: 600, marginTop: 'var(--sp-2)', marginBottom: 'var(--sp-6)' }}>
        <span>Location</span><span>Services</span><span>Schedule</span><span>Review</span>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-5)' }}>Where do you need service?</h2>

          {/* Address source toggle — only shown when the user has a stored home address */}
          {hasHomeAddress && (
            <div style={{ marginBottom: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              {[
                { val: true,  label: `My home address  —  ${userProfile.homeAddressText}` },
                { val: false, label: 'Another address (e.g. a family member\'s home)' },
              ].map(opt => (
                <label key={String(opt.val)} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-3)',
                  padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius)',
                  border: `1.5px solid ${useHomeAddr === opt.val ? 'var(--blue)' : 'var(--gray-200)'}`,
                  background: useHomeAddr === opt.val ? 'var(--blue-light)' : '#fff',
                  cursor: 'pointer', fontSize: 'var(--font-size-sm)',
                }}>
                  <input type="radio" name="addrMode" value={String(opt.val)}
                    checked={useHomeAddr === opt.val}
                    onChange={() => { setUseHomeAddr(opt.val); setErrors({}) }}
                    style={{ marginTop: 'var(--sp-1)', flexShrink: 0 }} />
                  <span style={{ fontWeight: useHomeAddr === opt.val ? 600 : 400 }}>{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {/* Address form — hidden when using home address */}
          {(!hasHomeAddress || !useHomeAddr) && (
            <>
              <div className="grid-2">
                <div className="field">
                  <label className="label">Street number *</label>
                  <input className="input" placeholder="123" value={form.streetNumber} onChange={e => set('streetNumber', e.target.value)} />
                  {errors.streetNumber && <span className="error-text">{errors.streetNumber}</span>}
                </div>
                <div className="field">
                  <label className="label">Unit / Apt (optional)</label>
                  <input className="input" placeholder="4B" value={form.unitNumber} onChange={e => set('unitNumber', e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label className="label">Street name *</label>
                <input className="input" placeholder="Main Street" value={form.streetName} onChange={e => set('streetName', e.target.value)} />
                {errors.streetName && <span className="error-text">{errors.streetName}</span>}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label className="label">City *</label>
                  <input className="input" placeholder="Toronto" value={form.city} onChange={e => set('city', e.target.value)} />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                <div className="field">
                  <label className="label">Province *</label>
                  <select className="input" value={form.province} onChange={e => set('province', e.target.value)}>
                    {['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'].map(p =>
                      <option key={p} value={p}>{p}</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">Postal code *</label>
                <input className="input" placeholder="M5V 3A8" value={form.postalCode}
                  onChange={e => set('postalCode', e.target.value.toUpperCase())}
                  style={{ maxWidth: 210 }} />
                {errors.postalCode && <span className="error-text">{errors.postalCode}</span>}
              </div>
              <div className="field">
                <label className="label">Property type</label>
                <select className="input" value={form.propertyType} onChange={e => set('propertyType', e.target.value)}>
                  <option>House</option><option>Condo / Townhouse</option><option>Commercial</option>
                </select>
              </div>

            </>
          )}
          {addrError && <div className="alert alert-error">{addrError}</div>}
          {validating && <div className="alert alert-info">Validating address…</div>}
          <button className="btn btn-primary btn-full btn-lg" onClick={nextStep1} disabled={validating}>
            {validating ? 'Validating…' : 'Next →'}
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-1)' }}>What services do you need?</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-400)', marginBottom: 'var(--sp-5)' }}>Select a service and size to set your <strong>opening offer price</strong>. Workers may accept or negotiate.</p>
          {errors.services && <div className="alert alert-error">{errors.services}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            {SERVICES.map(s => {
              const selectedSizeKey = form.services[s.key]
              const isSelected = !!selectedSizeKey
              const selectedSizeObj = isSelected ? s.sizes.find(sz => sz.key === selectedSizeKey) : null

              return (
                <div key={s.key} style={{
                  borderRadius: 'var(--radius)',
                  border: `1.5px solid ${isSelected ? 'var(--blue)' : 'var(--gray-200)'}`,
                  background: isSelected ? 'var(--blue-light)' : '#fff',
                  overflow: 'hidden',
                }}>
                  {/* Service row */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSvc(s.key)} style={{ width: 27, height: 27, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ color: isSelected ? 'var(--blue)' : 'var(--gray-400)', fontSize: 'var(--font-size-sm)', fontWeight: isSelected ? 700 : 400 }}>
                      {isSelected ? fmt(selectedSizeObj.price) : `from ${fmt(s.sizes[0].price)}`}
                    </span>
                  </label>

                  {/* Size selector */}
                  {isSelected && (
                    <div style={{ display: 'flex', gap: 'var(--sp-2)', padding: '0 var(--sp-4) var(--sp-3)', paddingLeft: 'var(--sp-10)' }}>
                      {s.sizes.map(sz => (
                        <button
                          key={sz.key}
                          type="button"
                          onClick={() => setSvcSize(s.key, sz.key)}
                          style={{
                            flex: 1, padding: 'var(--sp-2) var(--sp-1)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            border: `1.5px solid ${selectedSizeKey === sz.key ? 'var(--blue)' : 'var(--gray-300)'}`,
                            background: selectedSizeKey === sz.key ? 'var(--blue)' : '#fff',
                            color: selectedSizeKey === sz.key ? '#fff' : 'var(--gray-600)',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{sz.label}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', opacity: .85 }}>{sz.desc}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, marginTop: 'var(--sp-1)' }}>{fmt(sz.price)}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {basePrice > 0 && (
            <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)', fontSize: 'var(--font-size-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{useCustomPrice && customPriceCents ? 'Your custom fee' : 'Services subtotal'}</span>
                <span>{fmt(postedPrice)}</span>
              </div>
              {useCustomPrice && customPriceCents && basePrice > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-400)', marginTop: 'var(--sp-1)', fontSize: 'var(--font-size-xs)' }}>
                  <span>Est. based on services</span><span>{fmt(basePrice)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-400)', marginTop: 'var(--sp-1)' }}>
                <span>HST (13%)</span><span>+ {fmt(hst)}</span>
              </div>
              <div className="divider" style={{ margin: 'var(--sp-2) 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Opening offer total</span><span style={{ color: 'var(--blue)' }}>{fmt(total)}</span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', cursor: 'pointer', fontSize: 'var(--font-size-sm)', padding: 'var(--sp-1) 0' }}>
              <input
                type="checkbox"
                checked={useCustomPrice}
                onChange={e => { setUseCustomPrice(e.target.checked); if (!e.target.checked) setCustomPriceInput('') }}
              />
              <span style={{ fontWeight: 600 }}>Propose a different fee</span>
            </label>
            {useCustomPrice && (
              <div style={{ marginTop: 'var(--sp-2)', paddingLeft: 'var(--sp-6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={customPriceInput}
                    onChange={e => setCustomPriceInput(e.target.value)}
                    placeholder={basePrice > 0 ? (basePrice / 100).toFixed(2) : ''}
                    style={{ width: 180, padding: 'var(--sp-2) var(--sp-3)', border: '2px solid var(--blue)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-base)', fontWeight: 700 }}
                    autoFocus
                  />
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>CAD (before HST)</span>
                </div>
                {errors.customPrice && <div className="error-text" style={{ marginTop: 'var(--sp-1)' }}>{errors.customPrice}</div>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={nextStep2}>Next →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-5)' }}>When do you need it?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
            {[{ val: 'asap', label: '⚡ As soon as possible (within 2 hours)' }, { val: 'scheduled', label: '📅 Schedule a specific time' }].map(opt => (
              <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--radius)', border: `1.5px solid ${form.schedule === opt.val ? 'var(--blue)' : 'var(--gray-200)'}`, background: form.schedule === opt.val ? 'var(--blue-light)' : '#fff', cursor: 'pointer' }}>
                <input type="radio" name="schedule" value={opt.val} checked={form.schedule === opt.val} onChange={() => set('schedule', opt.val)} />
                <span style={{ fontWeight: 600 }}>{opt.label}</span>
              </label>
            ))}
          </div>
          {form.schedule === 'scheduled' && (
            <div className="grid-2" style={{ marginBottom: 'var(--sp-4)' }}>
              <div className="field"><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => set('date', e.target.value)} /></div>
              <div className="field"><label className="label">Time</label>
                <select className="input" value={form.time} onChange={e => set('time', e.target.value)}>
                  {Array.from({ length: 30 }, (_, i) => { const h = Math.floor(i / 2) + 6; const m = i % 2 === 0 ? '00' : '30'; return `${String(h).padStart(2,'0')}:${m}` }).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="field" style={{ marginBottom: 'var(--sp-5)' }}>
            <label className="label">Special notes for Worker (optional)</label>
            <textarea className="input" rows={3} placeholder="Gate code, dog in yard, access instructions…" value={form.notes} onChange={e => set('notes', e.target.value)} maxLength={500} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)', textAlign: 'right' }}>{form.notes.length}/500</span>
          </div>

          {/* ── Photos ─────────────────────────────── */}
          <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>

            {/* Sub-section A: saved property photos */}
            {mockUser.propertyPhotos.length > 0 && (
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-1)' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--gray-600)' }}>
                    🏠 Your property photos
                  </span>
                  <a
                    href="/requester/property"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 'var(--font-size-xs)', color: 'var(--blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Manage →
                  </a>
                </div>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginBottom: 'var(--sp-3)' }}>
                  All selected by default. Tap any to leave out.
                </p>
                <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
                  {mockUser.propertyPhotos.map(url => {
                    const selected = selectedPropPhotos ? selectedPropPhotos.has(url) : true
                    return (
                      <button
                        key={url}
                        onClick={() => togglePropPhoto(url)}
                        aria-label={selected ? 'Deselect photo' : 'Select photo'}
                        style={{
                          position: 'relative', width: 68, height: 68, padding: 0, flexShrink: 0,
                          border: selected ? '2px solid var(--blue)' : '2px solid var(--gray-300)',
                          borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: 'none',
                          opacity: selected ? 1 : 0.45,
                        }}
                      >
                        <img
                          src={url}
                          alt="Property"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'calc(var(--radius-lg) - 2px)', display: 'block' }}
                        />
                        <span style={{
                          position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                          borderRadius: '50%', background: selected ? 'var(--blue)' : 'var(--gray-400)',
                          border: '2px solid #fff', color: '#fff',
                          fontSize: 11, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {selected ? '✓' : '✕'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sub-section B: per-request uploads */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--sp-2)', marginBottom: 'var(--sp-1)' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--gray-600)' }}>
                  📷 Add photos for this request
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>(optional)</span>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginBottom: 'var(--sp-3)' }}>
                Show current conditions — fresh snow, problem areas, etc. Up to 3.
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap', marginBottom: 'var(--sp-2)' }}>
                {reqPhotos.map((p, i) => (
                  <div key={p.url} style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                    <img
                      src={p.url}
                      alt={`Request photo ${i + 1}`}
                      style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', display: 'block' }}
                    />
                    <button
                      onClick={() => removeReqPhoto(i)}
                      aria-label="Remove photo"
                      style={{
                        position: 'absolute', top: 3, right: 3, width: 18, height: 18,
                        borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none',
                        color: '#fff', fontSize: 10, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                      }}
                    >✕</button>
                  </div>
                ))}
                {reqPhotos.length < 3 && (
                  <button
                    onClick={() => { setPhotoError(null); reqPhotoInputRef.current?.click() }}
                    style={{
                      width: 68, height: 68, borderRadius: 'var(--radius-lg)',
                      border: '2px dashed var(--blue)', background: 'var(--blue-light)',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 2, color: 'var(--blue)',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>+</span>
                    <span style={{ fontSize: 10, fontWeight: 600 }}>Add Photo</span>
                  </button>
                )}
              </div>
              <input
                ref={reqPhotoInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleReqPhotoChange}
              />
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-400)' }}>
                {reqPhotos.length} of 3 · JPG, PNG, WEBP · max 10 MB each
              </p>
            </div>

            {/* Validation error */}
            {photoError && (
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--red)', marginTop: 'var(--sp-3)' }}>
                ⚠ {photoError}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={goToStep4}>Review →</button>
          </div>
          {totalPhotoCount > 0 && (
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', textAlign: 'center', marginTop: 'var(--sp-2)' }}>
              {totalPhotoCount} photo{totalPhotoCount !== 1 ? 's' : ''} will be included with this job
            </p>
          )}
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: 'var(--sp-5)' }}>Review & Post</h2>
          <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)', fontSize: 'var(--font-size-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            <div><strong>Address:</strong> {fullAddress}</div>
            <div><strong>Services:</strong></div>
            {selectedServices.map(s => {
              const sizeObj = s.sizes.find(sz => sz.key === form.services[s.key])
              return (
                <div key={s.key} style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 'var(--sp-3)', color: 'var(--gray-600)' }}>
                  <span>{s.label} — {sizeObj.label} ({sizeObj.desc})</span>
                  <span style={{ fontWeight: 600 }}>{fmt(sizeObj.price)}</span>
                </div>
              )
            })}
            <div><strong>Schedule:</strong> {form.schedule === 'asap' ? 'As soon as possible' : `${form.date} at ${form.time}`}</div>
            {form.notes && <div><strong>Notes:</strong> {form.notes}</div>}
          </div>
          <div style={{ background: 'var(--gray-100)', borderRadius: 'var(--radius-md)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-5)', fontSize: 'var(--font-size-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-1)' }}><span>Your opening offer</span><span>{fmt(postedPrice)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-1)', color: 'var(--gray-500)' }}><span>HST (13%)</span><span>+ {fmt(hst)}</span></div>
            <div className="divider" style={{ margin: 'var(--sp-2) 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: 'var(--sp-1)' }}><span>Total charged</span><span style={{ color: 'var(--blue)' }}>{fmt(total)}</span></div>
            <div className="divider" style={{ margin: 'var(--sp-2) 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gray-500)', marginBottom: 'var(--sp-1)' }}><span>Less platform fee (15%)</span><span>− {fmt(fee)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Total to be paid to Worker</span><span style={{ color: 'var(--green)' }}>{fmt(workerNet)}</span></div>
          </div>
          <label style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'flex-start', cursor: 'pointer', marginBottom: 'var(--sp-5)', fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>
            <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)} style={{ marginTop: 'var(--sp-1)', flexShrink: 0 }} />
            I acknowledge that the Worker is an independent contractor and not an employee of YoSnowMow. All liability for services rests with the Worker.
          </label>
          {errors.ack    && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-3)' }}>{errors.ack}</div>}
          {errors.submit && <div className="alert alert-error" style={{ marginBottom: 'var(--sp-3)' }}>{errors.submit}</div>}
          <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
            <button className="btn btn-ghost" onClick={() => setStep(3)} disabled={submitting}>← Back</button>
            <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={submit} disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Job'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
