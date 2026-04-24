import React, { useState, useEffect, FC, ChangeEvent, useMemo } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { Customer } from '@/types/Customer'
import { US_STATES } from '@/consts/constants'

interface AddEditCustomerModalProps {
  show: boolean
  onHide: () => void
  customer?: Customer | null
  onSave: (customerData: Customer) => void
}

const AddEditCustomerModal: FC<AddEditCustomerModalProps> = ({
  show,
  onHide,
  customer,
  onSave,
}) => {
  const initialCustomerState = useMemo<Customer>(
    () => ({
      companyName: '',
      contactName: '',
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      email: '',
      followUpNotes: [],
      createdBy: '', // Set default or fetch from logged-in user context
      createdDate: new Date(), // Default to current date
    }),
    []
  )

  const [customerData, setCustomerData] =
    useState<Customer>(initialCustomerState)
  const [selectedLogoFiles, setSelectedLogoFiles] = useState<FileList | null>(
    null
  )
  const [isUploading, setIsUploading] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [currentLogo, setCurrentLogo] = useState<any>(null)
  const [newDisplayName, setNewDisplayName] = useState('')

  useEffect(() => {
    setCustomerData(customer ?? initialCustomerState)
  }, [customer, initialCustomerState])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    onSave(customerData)
    onHide()
  }

  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedLogoFiles(e.target.files)
  }

  const uploadSelectedLogos = async () => {
    if (!customerData._id || !selectedLogoFiles || selectedLogoFiles.length === 0)
      return
    setIsUploading(true)
    try {
      for (let i = 0; i < selectedLogoFiles.length; i++) {
        const formData = new FormData()
        formData.append('file', selectedLogoFiles[i])
        const resp = await fetch(`/api/customers/${customerData._id}/logos`, {
          method: 'POST',
          body: formData,
        })
        if (!resp.ok) throw new Error('Upload failed')
        const data = await resp.json()
        setCustomerData((prev) => ({ ...prev, logoFiles: data.logoFiles }))
      }
      setSelectedLogoFiles(null)
    } catch (err) {
      // no-op minimal handling
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteLogo = async (fileId: string) => {
    if (!customerData._id) return
    try {
      const resp = await fetch(`/api/customers/${customerData._id}/logos`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      })
      if (!resp.ok) throw new Error('Delete failed')
      const data = await resp.json()
      setCustomerData((prev) => ({ ...prev, logoFiles: data.logoFiles }))
    } catch (err) {
      // no-op minimal handling
    }
  }

  const openRenameModal = (logo: any) => {
    setCurrentLogo(logo)
    setNewDisplayName(logo.displayName || logo.filename || '')
    setShowRenameModal(true)
  }

  const renameLogo = async () => {
    if (!customerData._id || !currentLogo || !newDisplayName.trim()) return
    try {
      const resp = await fetch(`/api/customers/${customerData._id}/logos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: currentLogo.fileId, displayName: newDisplayName.trim() })
      })
      if (!resp.ok) throw new Error('Rename failed')
      const data = await resp.json()
      setCustomerData((prev) => ({ ...prev, logoFiles: data.logoFiles }))
      setShowRenameModal(false)
      setCurrentLogo(null)
      setNewDisplayName('')
    } catch (err) {
      // no-op minimal handling
    }
  }

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{customer ? 'Edit Customer' : 'Add Customer'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Company Name */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Company Name"
              value={customerData.companyName}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="companyName">Company Name</Form.Label>
          </Form.Group>

          {/* Contact Name */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="contactName"
              name="contactName"
              placeholder="Contact Name"
              value={customerData.contactName}
              onChange={handleChange}
              required
            />
            <Form.Label htmlFor="contactName">Contact Name</Form.Label>
          </Form.Group>

          {/* Address */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="address"
              name="address"
              placeholder="Address"
              value={customerData.address}
              onChange={handleChange}
            />
            <Form.Label htmlFor="address">Address</Form.Label>
          </Form.Group>

          {/* Address 2 */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="address2"
              name="address2"
              placeholder="Address 2"
              value={customerData.address2}
              onChange={handleChange}
            />
            <Form.Label htmlFor="address2">Address 2</Form.Label>
          </Form.Group>

          {/* City */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="city"
              name="city"
              placeholder="City"
              value={customerData.city}
              onChange={handleChange}
            />
            <Form.Label htmlFor="city">City</Form.Label>
          </Form.Group>

          {/* State */}
          <Form.Group className="form-floating mb-3">
            <Form.Select
              id="state"
              name="state"
              value={customerData.state}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {US_STATES.map((state) => (
                <option key={state.abbreviation} value={state.abbreviation}>
                  {state.name}
                </option>
              ))}
            </Form.Select>
            <Form.Label htmlFor="state">State</Form.Label>
          </Form.Group>

          {/* Zip Code */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="zip"
              name="zip"
              placeholder="Zip Code"
              value={customerData.zip}
              onChange={handleChange}
            />
            <Form.Label htmlFor="zip">Zip Code</Form.Label>
          </Form.Group>

          {/* Phone */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="text"
              id="phone"
              name="phone"
              placeholder="Phone"
              value={customerData.phone}
              onChange={handleChange}
            />
            <Form.Label htmlFor="phone">Phone</Form.Label>
          </Form.Group>

          {/* Email */}
          <Form.Group className="form-floating mb-3">
            <Form.Control
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={customerData.email}
              onChange={handleChange}
            />
            <Form.Label htmlFor="email">Email</Form.Label>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        {customerData._id && (
          <div style={{ width: '100%' }}>
            <div className="mb-3">
              <strong>Logos</strong>
            </div>
            <div className="mb-3" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {customerData.logoFiles?.map((f) => (
                <div key={f.fileId} style={{ position: 'relative', textAlign: 'center' }}>
                  <img
                    src={`/api/customers/${customerData._id}/logos/${f.fileId}`}
                    alt={f.displayName || f.filename}
                    style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd', cursor: 'pointer' }}
                    onClick={() => openRenameModal(f)}
                  />
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeleteLogo(String(f.fileId))}
                    style={{ position: 'absolute', top: -8, right: -8, padding: '0 6px' }}
                  >
                    ×
                  </Button>
                  <div style={{ fontSize: '10px', marginTop: '2px', maxWidth: '72px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.displayName || f.filename}
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex align-items-center gap-2" style={{ gap: 8 }}>
              <Form.Control type="file" multiple accept="image/*" onChange={handleLogoFileChange} />
              <Button onClick={uploadSelectedLogos} disabled={isUploading || !selectedLogoFiles || selectedLogoFiles.length === 0}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <hr className="my-3" />
          </div>
        )}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          {customer ? 'Save Changes' : 'Add Customer'}
        </Button>
      </Modal.Footer>

      {/* Rename Modal */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Rename Logo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className='mb-3'>
            <Form.Label>Display Name</Form.Label>
            <Form.Control
              type='text'
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder='Enter logo name'
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowRenameModal(false)}>Cancel</Button>
          <Button variant='primary' onClick={renameLogo}>Save</Button>
        </Modal.Footer>
      </Modal>
    </Modal>
  )
}

export default AddEditCustomerModal
