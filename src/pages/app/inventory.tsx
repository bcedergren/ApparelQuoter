import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Router from 'next/router'
import Layout from '@/components/app/Layout'
import { Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap'

interface InventoryItem {
  _id: string
  itemName: string
  description?: string
  category: string
  quantity: number
  minimumStock: number
  unitPrice: number
  supplier?: string
  location?: string
}

const InventoryPage: React.FC = () => {
  const { data: session, status } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    category: '',
    quantity: 0,
    minimumStock: 0,
    unitPrice: 0,
    supplier: '',
    location: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      Router.push('/login')
    } else if (status === 'authenticated') {
      fetchInventory()
    }
  }, [status])

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory')
      if (res.ok) {
        const data = await res.json()
        setInventory(data.inventory)
      } else {
        setError('Failed to fetch inventory')
      }
    } catch (err) {
      setError('Error fetching inventory')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingItem ? 'PUT' : 'POST'
      const url = editingItem
        ? `/api/inventory/${editingItem._id}`
        : '/api/inventory'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        fetchInventory()
        setShowModal(false)
        resetForm()
      } else {
        setError('Failed to save item')
      }
    } catch (err) {
      setError('Error saving item')
    }
  }

  const resetForm = () => {
    setFormData({
      itemName: '',
      description: '',
      category: '',
      quantity: 0,
      minimumStock: 0,
      unitPrice: 0,
      supplier: '',
      location: '',
    })
    setEditingItem(null)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      itemName: item.itemName,
      description: item.description || '',
      category: item.category,
      quantity: item.quantity,
      minimumStock: item.minimumStock,
      unitPrice: item.unitPrice,
      supplier: item.supplier || '',
      location: item.location || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' })
        if (res.ok) {
          fetchInventory()
        } else {
          setError('Failed to delete item')
        }
      } catch (err) {
        setError('Error deleting item')
      }
    }
  }

  if (status === 'loading' || loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>
  }

  return (
    <Layout>
      <Container>
        <h1>Inventory Management</h1>
        <Button onClick={() => setShowModal(true)}>Add New Item</Button>
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Minimum Stock</th>
              <th>Unit Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td>{item.itemName}</td>
                <td>{item.category}</td>
                <td>{item.quantity}</td>
                <td>{item.minimumStock}</td>
                <td>${item.unitPrice.toFixed(2)}</td>
                <td>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>{' '}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Minimum Stock</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.minimumStock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumStock: parseInt(e.target.value),
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Unit Price</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      unitPrice: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Supplier</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.supplier}
                  onChange={(e) =>
                    setFormData({ ...formData, supplier: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </Form.Group>
              <Button type="submit" className="mt-3">
                {editingItem ? 'Update' : 'Add'} Item
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </Layout>
  )
}

export default InventoryPage
