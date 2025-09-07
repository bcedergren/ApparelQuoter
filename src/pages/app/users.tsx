import { useState, useEffect, useCallback, FC } from 'react'
import { useSession } from 'next-auth/react'
import { Container, Row, Col, Table, Modal, Button } from 'react-bootstrap'
import { SlPlus, SlPencil, SlTrash } from 'react-icons/sl'
import { User } from '@/types/User'
import { CustomSession } from '@/types/CustomUser'
import AddUserModal from '@/components/app/AddUserModal'
import Layout from '@/components/app/Layout'
import styles from '@/styles/UsersPage.module.css'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import EditUserModal from '@/components/app/EditUserModal'

const UsersPage: FC = () => {
  const { data: sessionData } = useSession()
  const session = sessionData as CustomSession

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string>('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userLimit, setUserLimit] = useState<number>(0)
  const [disableRoleEdit, setDisableRoleEdit] = useState<boolean>(false)

  const fetchUsers = useCallback(async () => {
    if (session?.user?.companyId) {
      setLoading(true)
      try {
        const res = await fetch(`/api/company-users/${session.user.companyId}`)

        if (!res.ok) {
          throw new Error('Network response was not ok')
        }
        const data: User[] = await res.json()
        setUsers(data)

        // Fetch subscription and plan data using the subscriptionId from Stripe
        const subscriptionId = data[0]?.subscriptionId
        if (!subscriptionId) {
          throw new Error('Subscription ID not found')
        }

        const subscriptionRes = await fetch(
          `/api/subscription/${subscriptionId}`
        )

        if (!subscriptionRes.ok) {
          if (subscriptionRes.status === 404) {
            // Subscription not found, perhaps inactive or cancelled
            console.warn('Subscription not found, setting default user limit')
            setUserLimit(1) // Default to 1 user
            return
          }
          throw new Error('Failed to fetch subscription data')
        }

        const subscriptionData = await subscriptionRes.json()
        const planId = subscriptionData.plan.id
        const planRes = await fetch(`/api/plans/${planId}`)

        if (!planRes.ok) {
          throw new Error('Failed to fetch plan data')
        }
        const planData = await planRes.json()

        setUserLimit(planData.users)
      } catch (error) {
        console.error('Failed to fetch users and plan data:', error)
        setError('Failed to fetch users and plan data')
        toast.error('Failed to fetch users and plan data')
      } finally {
        setLoading(false)
      }
    }
  }, [session])

  useEffect(() => {
    fetchUsers()
  }, [session, fetchUsers])

  const handleEdit = (user: User) => {
    const isOnlyAdmin =
      user.role === 'admin' &&
      users.filter((u) => u.role === 'admin').length === 1
    setDisableRoleEdit(isOnlyAdmin)
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDelete = (user: User) => {
    if (users.length === 1) {
      setWarningMessage('Cannot delete the only admin user.')
      setShowWarningModal(true)
    } else {
      setSelectedUser(user)
      setShowDeleteModal(true)
    }
  }

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        const res = await fetch(`/api/users/${selectedUser._id}`, {
          method: 'DELETE',
        })
        if (!res.ok) {
          throw new Error('Failed to delete user')
        }
        setUsers(users.filter((user) => user._id !== selectedUser._id))
        setShowDeleteModal(false)
        setSelectedUser(null)
        toast.success('User deleted successfully')
      } catch (error) {
        console.error('Failed to delete user:', error)
        setError('Failed to delete user')
        toast.error('Failed to delete user')
      }
    }
  }

  return (
    <Layout>
      <Container fluid>
        <Row>
          <Col md={12} lg={12} className={styles.pageTitle}>
            <h1>
              Users{' '}
              <span className={styles.badge}>
                {users.length}/{userLimit}
              </span>
            </h1>
            {users.length < userLimit && (
              <Button
                onClick={() => setShowAddModal(true)}
                className={styles.addUserButton}
              >
                <SlPlus className="icon" /> Add User
              </Button>
            )}
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
              <Table bordered hover className={styles.table}>
                <thead>
                  <tr>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.firstName}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <SlPencil
                          onClick={() => handleEdit(user)}
                          className={styles.editIcon}
                        />
                        <SlTrash
                          onClick={() => handleDelete(user)}
                          className={`${styles.editIcon} ${styles.deleteIcon}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Col>
        </Row>
      </Container>
      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onUserAdded={fetchUsers}
      />
      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={selectedUser}
        onUserUpdated={fetchUsers}
        disableRoleEdit={disableRoleEdit}
      />
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete {selectedUser?.firstName}{' '}
          {selectedUser?.lastName}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showWarningModal} onHide={() => setShowWarningModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>{warningMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowWarningModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer />
    </Layout>
  )
}

export default UsersPage
