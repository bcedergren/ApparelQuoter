import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/app/Layout'
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap'

type Option = { value: string; label: string }
type QuoteOption = { value: string; label: string; customerId?: string }
type FileMeta = { fileUrl: string; fileName: string; fileSize: number; mimeType: string }

interface PlacementEditorProps {
  designId?: string
}

const PlacementEditor: React.FC<PlacementEditorProps> = ({ designId }) => {
  const router = useRouter()
  const { status, data: session } = useSession()

  const isEdit = Boolean(designId)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [customers, setCustomers] = useState<Option[]>([])
  const [allQuotes, setAllQuotes] = useState<QuoteOption[]>([])
  const [quotes, setQuotes] = useState<QuoteOption[]>([])

  const [form, setForm] = useState({
    customerId: '',
    quoteId: '',
    title: '',
    description: '',
    apparelImageUrl: '' as string,
  })
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('')
  const [selectedLogoMeta, setSelectedLogoMeta] = useState<FileMeta | null>(null)
  const [logoWidthPct, setLogoWidthPct] = useState<number>(35)
  const [logoPosX, setLogoPosX] = useState<number>(50)
  const [logoPosY, setLogoPosY] = useState<number>(35)
  const [logoRotation, setLogoRotation] = useState<number>(0)
  const [apparelScale, setApparelScale] = useState<number>(100)
  const [apparelOffsetX, setApparelOffsetX] = useState<number>(0)
  const [apparelOffsetY, setApparelOffsetY] = useState<number>(0)

  // Canvas and handle-based interactions
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const logoRef = useRef<HTMLImageElement | null>(null)
  const logoContainerRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef<boolean>(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const resizing = useRef<boolean>(false)
  const resizeStartX = useRef<number>(0)
  const resizeStartWidthPct = useRef<number>(0)
  const rotating = useRef<boolean>(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Load supporting data
  useEffect(() => {
    const fetchSupportingData = async () => {
      if (!session?.user?.companyId) return
      try {
        setLoading(true)
        const [customersRes, quotesRes] = await Promise.all([
          fetch(`/api/customers/by-company/${session.user.companyId}`),
          fetch(`/api/quotes/${session.user.companyId}?quoteType=savedQuotes`),
        ])
        const customersJson = await customersRes.json()
        const quotesJson = await quotesRes.json()
        if (customersRes.ok) {
          setCustomers(
            (customersJson.customers || []).map((c: any) => ({ value: c._id, label: c.companyName || c.contactName || c.name || 'Customer' }))
          )
        }
        if (quotesRes.ok) {
          const raw = Array.isArray(quotesJson.quotes) ? quotesJson.quotes : []
          const seen = new Set<string>()
          const mapped: QuoteOption[] = []
          for (const q of raw) {
            const label: string = q.quoteId || q._id
            if (seen.has(label)) continue
            seen.add(label)
            mapped.push({
              value: q._id,
              label,
              customerId:
                typeof q.selectedCustomerId === 'string'
                  ? q.selectedCustomerId
                  : (q.selectedCustomerId?._id || q.selectedCustomerId?.toString?.() || ''),
            })
          }
          setAllQuotes(mapped)
        }
      } catch (e) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    if (status === 'authenticated') fetchSupportingData()
  }, [status, session?.user?.companyId])

  // Load existing design details if editing
  useEffect(() => {
    const loadExisting = async () => {
      if (!isEdit || !designId) return
      try {
        const [placementRes, designRes] = await Promise.all([
          fetch(`/api/designs/${designId}/placement`),
          fetch(`/api/designs/${designId}`),
        ])
        const placementJson = await placementRes.json()
        const designJson = await designRes.json()
        if (designRes.ok && designJson) {
          setForm((prev) => ({
            ...prev,
            customerId: designJson.customerId?._id || designJson.customerId || '',
            quoteId: designJson.quoteId?._id || designJson.quoteId || '',
            title: designJson.title || '',
            description: designJson.description || '',
            apparelImageUrl: placementJson?.placement?.apparelImageUrl || prev.apparelImageUrl,
          }))
        }
        if (placementRes.ok && placementJson?.placement) {
          const p = placementJson.placement
          setLogoPreviewUrl(() => {
            const latest = (placementJson.versions || [])
            const matched = latest.find((v: any) => String(v._id) === String(p.logoVersionId))
            return matched?.fileUrl || ''
          })
          setLogoWidthPct(p.widthInches || 35)
          setLogoPosX((p.position?.x || 0.5) * 100)
          setLogoPosY((p.position?.y || 0.35) * 100)
          setLogoRotation(p.rotation || 0)
        }
      } catch (e) {
        // ignore
      }
    }
    loadExisting()
  }, [isEdit, designId])

  // Filter quotes by selected customer
  useEffect(() => {
    if (!form.customerId) {
      setQuotes([])
      setForm((prev) => ({ ...prev, quoteId: '' }))
      return
    }
    const filtered = allQuotes.filter((q) => q.customerId === form.customerId)
    setQuotes(filtered)
    if (filtered.every((q) => q.value !== form.quoteId)) {
      setForm((prev) => ({ ...prev, quoteId: '' }))
    }
  }, [form.customerId, allQuotes])

  const canSave = useMemo(() => {
    return Boolean(form.customerId && form.title)
  }, [form.customerId, form.title])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/designs/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) {
      setError(data?.message || 'Upload failed')
      return
    }
    setForm((prev) => ({ ...prev, apparelImageUrl: data.file.fileUrl }))
  }

  const onSelectLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/designs/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) {
      setError(data?.message || 'Upload failed')
      return
    }
    setLogoPreviewUrl(data.file.fileUrl)
    setSelectedLogoMeta({
      fileUrl: data.file.fileUrl,
      fileName: data.file.fileName || file.name,
      fileSize: Number(data.file.fileSize || file.size || 0),
      mimeType: data.file.mimeType || file.type || 'image/*',
    })
    ;(e.target as HTMLInputElement).value = ''
  }

  // Load existing media per customer
  const [existingImages, setExistingImages] = useState<FileMeta[]>([])
  const [existingApparelImages, setExistingApparelImages] = useState<string[]>([])
  useEffect(() => {
    const fetchCustomerImages = async () => {
      if (!form.customerId) {
        setExistingImages([])
        setExistingApparelImages([])
        return
      }
      try {
        const params = new URLSearchParams({ customerId: form.customerId, limit: '100' })
        const res = await fetch(`/api/designs?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) return
        const imgs: FileMeta[] = []
        const apparel: string[] = []
        for (const d of data.designs || []) {
          for (const v of d.versions || []) {
            if (v?.fileUrl) {
              imgs.push({ fileUrl: v.fileUrl, fileName: v.fileName, fileSize: Number(v.fileSize || 0), mimeType: v.mimeType || 'image/*' })
            }
          }
          if (d?.placement?.apparelImageUrl) {
            apparel.push(String(d.placement.apparelImageUrl))
          }
        }
        const seen = new Set<string>()
        const dedup = imgs.filter((im) => (seen.has(im.fileUrl) ? false : (seen.add(im.fileUrl), true)))
        setExistingImages(dedup)
        const seenApparel = new Set<string>()
        const dedupApparel = apparel.filter((u) => (seenApparel.has(u) ? false : (seenApparel.add(u), true)))
        setExistingApparelImages(dedupApparel)
      } catch (e) {
        // ignore
      }
    }
    fetchCustomerImages()
  }, [form.customerId])

  const save = async () => {
    if (!canSave) return
    setSaving(true)
    setError(null)
    try {
      if (!isEdit) {
        // CREATE
        const body = {
          customerId: form.customerId,
          quoteId: form.quoteId || undefined,
          title: form.title,
          description: form.description || undefined,
        }
        const res = await fetch('/api/designs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const data = await res.json()
        if (!res.ok || !data?._id) throw new Error(data?.message || 'Failed to create design')
        const newId: string = data._id
        // Version
        let createdVersionId: string | undefined
        if (selectedLogoMeta) {
          const versionRes = await fetch(`/api/designs/${newId}/versions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              versionNumber: 'v1',
              fileName: selectedLogoMeta.fileName,
              fileUrl: selectedLogoMeta.fileUrl,
              fileSize: selectedLogoMeta.fileSize,
              mimeType: selectedLogoMeta.mimeType,
              notes: '',
            }),
          })
          const vjson = await versionRes.json()
          if (!versionRes.ok) throw new Error(vjson?.message || 'Failed to add logo version')
          const latest = vjson.design?.versions || []
          createdVersionId = latest.length ? String(latest[latest.length - 1]._id) : undefined
        }
        // Placement
        if (form.apparelImageUrl && createdVersionId) {
          const placementRes = await fetch(`/api/designs/${newId}/placement`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apparelImageUrl: form.apparelImageUrl,
              areaId: 'front',
              logoVersionId: createdVersionId,
              position: { x: logoPosX / 100, y: logoPosY / 100 },
              widthInches: logoWidthPct,
              rotation: logoRotation,
            }),
          })
          const pjson = await placementRes.json()
          if (!placementRes.ok) throw new Error(pjson?.message || 'Failed to save placement')
        }
        router.push(`/app/designs/${newId}/place`)
      } else {
        // EDIT: save version if selected and placement if apparel + logo present
        let currentVersionId: string | undefined
        if (selectedLogoMeta && designId) {
          const versionRes = await fetch(`/api/designs/${designId}/versions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              versionNumber: 'v1',
              fileName: selectedLogoMeta.fileName,
              fileUrl: selectedLogoMeta.fileUrl,
              fileSize: selectedLogoMeta.fileSize,
              mimeType: selectedLogoMeta.mimeType,
              notes: '',
            }),
          })
          const vjson = await versionRes.json()
          if (!versionRes.ok) throw new Error(vjson?.message || 'Failed to add logo version')
          const latest = vjson.design?.versions || []
          currentVersionId = latest.length ? String(latest[latest.length - 1]._id) : undefined
        }
        if (designId && form.apparelImageUrl && (currentVersionId || logoPreviewUrl)) {
          const placementRes = await fetch(`/api/designs/${designId}/placement`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apparelImageUrl: form.apparelImageUrl,
              areaId: 'front',
              logoVersionId: currentVersionId, // if undefined, API will reject; keeping simple here
              position: { x: logoPosX / 100, y: logoPosY / 100 },
              widthInches: logoWidthPct,
              rotation: logoRotation,
            }),
          })
          const pjson = await placementRes.json()
          if (!placementRes.ok) throw new Error(pjson?.message || 'Failed to save placement')
        }
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container fluid className="mt-3">
        <Row>
          <Col lg={8} className="mb-3">
            <Card>
              <Card.Header>{isEdit ? 'Edit Placement' : 'Start Placement'}</Card.Header>
              <Card.Body>
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                <div
                  ref={canvasRef}
                  style={{ height: 600, position: 'relative', overflow: 'hidden' }}
                  className="bg-light border rounded d-flex align-items-center justify-content-center"
                  onMouseMove={(e) => {
                    if (!canvasRef.current) return
                    const cw = canvasRef.current.clientWidth
                    const ch = canvasRef.current.clientHeight

                    if (rotating.current) {
                      if (!logoContainerRef.current) return
                      const rect = logoContainerRef.current.getBoundingClientRect()
                      const centerX = rect.left + rect.width / 2
                      const centerY = rect.top + rect.height / 2
                      const angleRad = Math.atan2(e.clientY - centerY, e.clientX - centerX)
                      const angleDeg = Math.round((angleRad * 180) / Math.PI)
                      setLogoRotation(angleDeg)
                      return
                    }

                    if (resizing.current) {
                      const deltaX = e.clientX - resizeStartX.current
                      const deltaPct = (deltaX / cw) * 100
                      const newPct = Math.max(5, Math.min(90, resizeStartWidthPct.current + deltaPct))
                      setLogoWidthPct(newPct)
                      return
                    }

                    if (!dragging.current) return
                    const prev = lastPos.current || { x: e.clientX, y: e.clientY }
                    const deltaX = e.clientX - prev.x
                    const deltaY = e.clientY - prev.y
                    lastPos.current = { x: e.clientX, y: e.clientY }

                    const nx = Math.min(98, Math.max(2, logoPosX + (deltaX / cw) * 100))
                    const ny = Math.min(98, Math.max(2, logoPosY + (deltaY / ch) * 100))
                    setLogoPosX(nx)
                    setLogoPosY(ny)
                  }}
                  onMouseUp={() => {
                    dragging.current = false
                    resizing.current = false
                    rotating.current = false
                    lastPos.current = null
                  }}
                  onMouseLeave={() => {
                    dragging.current = false
                    resizing.current = false
                    rotating.current = false
                    lastPos.current = null
                  }}
                >
                  {form.apparelImageUrl ? (
                    <img
                      src={form.apparelImageUrl}
                      alt="Apparel preview"
                      style={{ position: 'absolute', left: '50%', top: '50%', width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6, transform: `translate(-50%, -50%) translate(${apparelOffsetX}%, ${apparelOffsetY}%) scale(${apparelScale / 100})` }}
                    />
                  ) : (
                    <div className="text-center text-muted">No apparel image uploaded</div>
                  )}
                  {logoPreviewUrl && (
                    <div
                      ref={logoContainerRef}
                      onMouseDown={(e) => {
                        dragging.current = true
                        lastPos.current = { x: e.clientX, y: e.clientY }
                      }}
                      style={{ position: 'absolute', cursor: 'move', left: `${logoPosX}%`, top: `${logoPosY}%`, transform: `translate(-50%, -50%) rotate(${logoRotation}deg)`, width: `${logoWidthPct}%`, maxWidth: '90%' }}
                    >
                      <img
                        ref={logoRef}
                        src={logoPreviewUrl}
                        alt="Logo preview"
                        draggable={false}
                        style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }}
                      />
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          rotating.current = true
                        }}
                        style={{ position: 'absolute', left: '50%', top: -20, width: 12, height: 12, background: '#198754', borderRadius: '50%', border: '2px solid white', transform: 'translateX(-50%)', cursor: 'grab' }}
                        aria-label="Rotate logo"
                        title="Rotate"
                      />
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          if (!canvasRef.current) return
                          resizing.current = true
                          resizeStartX.current = e.clientX
                          resizeStartWidthPct.current = logoWidthPct
                        }}
                        style={{ position: 'absolute', right: -6, bottom: -6, width: 12, height: 12, background: '#0d6efd', borderRadius: 2, cursor: 'nwse-resize' }}
                        aria-label="Resize logo"
                        title="Resize"
                      />
                    </div>
                  )}
                </div>
                {/* Apparel controls under the image box */}
                <div className="mt-2 d-flex flex-wrap align-items-center gap-4">
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">Zoom</small>
                    <Form.Range min={50} max={200} value={apparelScale} onChange={(e) => setApparelScale(parseInt(e.target.value, 10))} disabled={!form.apparelImageUrl} />
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">X</small>
                    <Form.Range min={-50} max={50} value={apparelOffsetX} onChange={(e) => setApparelOffsetX(parseInt(e.target.value, 10))} disabled={!form.apparelImageUrl} />
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted">Y</small>
                    <Form.Range min={-50} max={50} value={apparelOffsetY} onChange={(e) => setApparelOffsetY(parseInt(e.target.value, 10))} disabled={!form.apparelImageUrl} />
                  </div>
                </div>
                <div className="mt-3 d-flex justify-content-end">
                  <Button onClick={save} disabled={saving || !canSave}>{saving ? 'Saving...' : isEdit ? 'Save' : 'Create & Continue'}</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card className="mb-3">
              <Card.Header>Design Details</Card.Header>
              <Card.Body>
                <Form className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label>Customer</Form.Label>
                    <Form.Select name="customerId" value={form.customerId} onChange={handleChange} required disabled={isEdit}>
                      <option value="">Select a customer</option>
                      {customers.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Quote</Form.Label>
                    <Form.Select name="quoteId" value={form.quoteId} onChange={handleChange} disabled={!form.customerId || isEdit}>
                      <option value="">No quote</option>
                      {quotes.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control name="title" value={form.title} onChange={handleChange} placeholder="Design title" required />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} placeholder="Describe the design briefly" />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Logo Image</Card.Header>
              <Card.Body>
                <Form.Control type="file" accept="image/*" onChange={onSelectLogo} />
                {logoPreviewUrl && (
                  <div className="mt-2">
                    <small className="text-muted">{logoPreviewUrl}</small>
                  </div>
                )}
              </Card.Body>
            </Card>

            {!!existingImages.length && (
              <Card className="mb-3">
                <Card.Header>Existing Images</Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2">
                    {existingImages.map((img) => (
                      <button
                        key={img.fileUrl}
                        type="button"
                        className="btn p-0 border-0"
                        onClick={() => {
                          setLogoPreviewUrl(img.fileUrl)
                          setSelectedLogoMeta(img)
                        }}
                        title={img.fileName}
                      >
                        <img src={img.fileUrl} alt={img.fileName} style={{ width: 72, height: 72, objectFit: 'contain', border: '1px solid #e9ecef', borderRadius: 4 }} />
                      </button>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            <Card className="mb-3">
              <Card.Header>Apparel Image</Card.Header>
              <Card.Body>
                <Form.Control type="file" accept="image/*" onChange={onSelectFile} />
                {form.apparelImageUrl && (
                  <div className="mt-2">
                    <small className="text-muted">{form.apparelImageUrl}</small>
                  </div>
                )}
              </Card.Body>
            </Card>

            {!!existingApparelImages.length && (
              <Card className="mb-3">
                <Card.Header>Existing Apparel Images</Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2">
                    {existingApparelImages.map((url) => (
                      <button
                        key={url}
                        type="button"
                        className="btn p-0 border-0"
                        onClick={() => setForm((prev) => ({ ...prev, apparelImageUrl: url }))}
                        title={url}
                      >
                        <img src={url} alt="Apparel" style={{ width: 72, height: 72, objectFit: 'contain', border: '1px solid #e9ecef', borderRadius: 4 }} />
                      </button>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </Layout>
  )
}

export default PlacementEditor


