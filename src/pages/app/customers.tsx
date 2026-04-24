import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useState, useEffect, useCallback } from 'react'
import { Container, Row, Col, Button, Spinner, Table } from 'react-bootstrap'
import { SlPlus, SlPencil, SlTrash, SlNote } from 'react-icons/sl'
import { ToastContainer, toast } from 'react-toastify'
import Layout from '@/components/app/Layout'
import AddEditCustomerModal from '@/components/app/AddEditCustomerModal'
import FollowUpNotesModal from '@/components/app/FollowUpNotesModal'
import DeleteConfirmationModal from '@/components/app/DeleteConfirmationModal'
import { Customer, FollowUpNote } from '@/types/Customer'
import styles from '@/styles/UsersPage.module.css'

const Customers: NextPage = () => {
  const { data: session, status } = useSession()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showAddEditModal, setShowAddEditModal] = useState(false)
  const [showFollowUpNotesModal, setShowFollowUpNotesModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.companyId) {
      console.error(
        'Session or companyId not found. Unable to fetch customers.'
      )
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/customers/by-company/${session.user.companyId}`)
      if (!response.ok) throw new Error('Failed to fetch customers.')
      const data = await response.json()

      setCustomers(data.customers)
      setError(null) // Clear any previous errors
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session, status])

  useEffect(() => {
    if (status === 'authenticated' && session.user.companyId) {
      fetchCustomers()
    }
  }, [session, status, fetchCustomers])

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setShowAddEditModal(true)
  }

  const handleSaveCustomer = async (customerData: Customer) => {
    if (status !== 'authenticated' || !session?.user?.companyId) {
      setError('Session not found. Unable to save customer.')
      return
    }

    const followUpNote: FollowUpNote = {
      date: new Date(),
      note: 'Customer Added',
      addedBy: `${session.user.id}`,
      addedDate: new Date(),
    }

    const customerDataWithCompanyId = {
      ...customerData,
      companyId: session.user.companyId,
      userId: session.user.id,
      followUpNotes: customerData._id
        ? customerData.followUpNotes
        : [followUpNote],
    }

    const apiUrl = customerData._id
      ? `/api/customers/update/${customerData._id}`
      : '/api/customers/add'
    const method = customerData._id ? 'PUT' : 'POST'

    setIsLoading(true)
    try {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerDataWithCompanyId),
      })

      const responseData = await response.json()
      if (response.ok) {
        setSuccessMessage('Customer saved successfully.')
        toast.success(successMessage || 'Customer saved successfully.')
        fetchCustomers() // Refresh the customer list
      } else {
        setError(responseData.message || 'Failed to save customer.')
        toast.error(responseData.message || 'Failed to save customer.')
        throw new Error(responseData.message || 'Failed to save customer.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowAddEditModal(true)
  }

  const handleManageFollowUpNotes = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowFollowUpNotesModal(true)
  }

  const handleSaveNote = async (updatedCustomer: Customer) => {
    if (status !== 'authenticated' || !session?.user?.companyId) {
      setError('Session not found. Unable to save note.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/customers/update/${updatedCustomer._id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCustomer),
        }
      )

      const responseData = await response.json()
      if (response.ok) {
        setSuccessMessage('Note saved successfully.')
        toast.success(successMessage || 'Note saved successfully.')
        fetchCustomers() // Refresh the customer list
      } else {
        setError(responseData.message || 'Failed to save note.')
        toast.error(responseData.message || 'Failed to save note.')
        throw new Error(responseData.message || 'Failed to save note.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/customers/delete/${selectedCustomer._id}`,
        { method: 'DELETE' }
      )

      if (response.ok) {
        setCustomers(customers.filter((c) => c._id !== selectedCustomer._id))
      } else {
        const responseData = await response.json()
        setError(responseData.message || 'Failed to delete customer.')
        toast.error(responseData.message || 'Failed to delete customer.')
        throw new Error(responseData.message || 'Failed to delete customer.')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setShowDeleteConfirmation(false)
    }
  }

  return (
    <Layout>
      <Container fluid>
        <Row className="align-items-center mb-4">
          <Col>
            <h1>Customers</h1>
          </Col>
          <Col className="text-end">
            <Button
              variant="primary"
              onClick={handleAddCustomer}
              disabled={isLoading}
            >
              <SlPlus /> Add Customer
            </Button>
          </Col>
        </Row>
        {isLoading ? (
          <Spinner animation="border" />
        ) : customers.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>Company Name</th>
                <th>Contact Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <SlNote
                      onClick={() => handleManageFollowUpNotes(customer)}
                      className={`${styles.notesIcon}`}
                    />
                  </td>
                  <td>{customer.companyName}</td>
                  <td>{customer.contactName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <SlPencil
                      onClick={() => handleEditCustomer(customer)}
                      className={styles.editIcon}
                    />

                    <SlTrash
                      onClick={() => handleDeleteCustomer(customer)}
                      className={`${styles.editIcon} ${styles.deleteIcon}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>No customers found.</p>
        )}

        {showAddEditModal && (
          <AddEditCustomerModal
            show={showAddEditModal}
            onHide={() => setShowAddEditModal(false)}
            customer={selectedCustomer}
            onSave={handleSaveCustomer}
          />
        )}

        {showFollowUpNotesModal && (
          <FollowUpNotesModal
            show={showFollowUpNotesModal}
            onHide={() => setShowFollowUpNotesModal(false)}
            customer={selectedCustomer}
            onSave={handleSaveNote}
          />
        )}

        {showDeleteConfirmation && (
          <DeleteConfirmationModal
            show={showDeleteConfirmation}
            onHide={() => setShowDeleteConfirmation(false)}
            onConfirm={handleConfirmDelete}
            title="Confirm Deletion"
            body="Are you sure you want to delete this customer? This action cannot be undone."
          />
        )}
      </Container>
      <ToastContainer />
    </Layout>
  )
}

export default Customers
