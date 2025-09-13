import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, Button, Badge, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash, FaComment, FaUpload, FaDownload, FaFilter } from 'react-icons/fa';
import Layout from '@/components/app/Layout';
import { Design, DesignFilter } from '@/types/Design';
import { Customer } from '@/types/Customer';
import { User } from '@/types/User';
import styles from '@/styles/Designs.module.css';

const DesignsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<DesignFilter>({
    status: 'all',
    priority: 'all',
    category: 'all',
    assignedTo: 'all',
    customerId: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchDesigns = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all'))
      });

      const response = await fetch(`/api/designs?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setDesigns(data.designs);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch designs');
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
      setError('Failed to fetch designs');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`/api/customers/${session?.user?.companyId}`);
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }, [session?.user?.companyId]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${session?.user?.companyId}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [session?.user?.companyId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDesigns();
      fetchCustomers();
      fetchUsers();
    }
  }, [status, session, filters, pagination.page, fetchDesigns, fetchCustomers, fetchUsers, router]);

  const handleCreateDesign = () => {
    router.push('/app/designs/create');
  };

  const handleViewDesign = (design: Design) => {
    router.push(`/app/designs/${design._id}`);
  };

  const handleEditDesign = (design: Design) => {
    router.push(`/app/designs/${design._id}/edit`);
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return;

    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDesigns();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete design');
      }
    } catch (error) {
      console.error('Error deleting design:', error);
      setError('Failed to delete design');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      in_review: 'warning',
      approved: 'success',
      rejected: 'danger',
      completed: 'info'
    };
    return <Badge bg={variants[status as keyof typeof variants] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'success',
      medium: 'primary',
      high: 'warning',
      urgent: 'danger'
    };
    return <Badge bg={variants[priority as keyof typeof variants] || 'secondary'}>{priority.toUpperCase()}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getLatestVersion = (design: Design) => {
    return design.versions && design.versions.length > 0 
      ? design.versions[design.versions.length - 1] 
      : null;
  };

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <Container className="text-center mt-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <h2>Design Collaboration</h2>
          </Col>
          <Col xs="auto">
            <Button onClick={handleCreateDesign} className="me-2">
              <FaPlus className="me-2" />
              New Design
            </Button>
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="me-2" />
              Filters
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        {showFilters && (
          <Card className="mb-4">
            <Card.Header>
              <h6>Filters</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="in_review">In Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select
                      value={filters.priority}
                      onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      <option value="all">All Categories</option>
                      <option value="apparel">Apparel</option>
                      <option value="logo">Logo</option>
                      <option value="graphic">Graphic</option>
                      <option value="layout">Layout</option>
                      <option value="other">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Assigned To</Form.Label>
                    <Form.Select
                      value={filters.assignedTo}
                      onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                    >
                      <option value="all">All Users</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Customer</Form.Label>
                    <Form.Select
                      value={filters.customerId}
                      onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                    >
                      <option value="">All Customers</option>
                      {customers.map((customer) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.contactName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search designs..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Designs Grid */}
        <Row>
          {designs.map((design) => {
            const latestVersion = getLatestVersion(design);
            return (
              <Col lg={4} md={6} className="mb-4" key={design._id}>
                <Card className={`h-100 ${styles.designCard}`}>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">{design.title}</h6>
                      <small className="text-muted">
                        {customers.find(c => c._id === design.customerId)?.contactName || 'Unknown Customer'}
                      </small>
                    </div>
                    <div className="d-flex gap-1">
                      {getStatusBadge(design.status)}
                      {getPriorityBadge(design.priority)}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {design.description && (
                      <p className="text-muted small mb-3">{design.description}</p>
                    )}
                    
                    {latestVersion && (
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="small text-muted">Latest Version:</span>
                          <span className="small">{latestVersion.versionNumber}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="small text-muted">File:</span>
                          <span className="small">{latestVersion.fileName}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <span className="small text-muted">Size:</span>
                          <span className="small">{formatFileSize(latestVersion.fileSize)}</span>
                        </div>
                        {latestVersion.isApproved && (
                          <Badge bg="success" className="mt-2">Approved</Badge>
                        )}
                      </div>
                    )}

                    {design.tags && design.tags.length > 0 && (
                      <div className="mb-3">
                        {design.tags.map((tag, index) => (
                          <Badge key={index} bg="light" text="dark" className="me-1">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        {design.assignedTo && (
                          <small className="text-muted">
                            Assigned to: {(() => {
                              const user = users.find(u => u._id === design.assignedTo);
                              return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
                            })()}
                          </small>
                        )}
                        {design.dueDate && (
                          <div>
                            <small className="text-muted">
                              Due: {new Date(design.dueDate).toLocaleDateString()}
                            </small>
                          </div>
                        )}
                      </div>
                      <div className="d-flex gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDesign(design)}
                        >
                          <FaEye />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEditDesign(design)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteDesign(design._id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                  <Card.Footer className="text-muted small">
                    <div className="d-flex justify-content-between">
                      <span>Created: {new Date(design.createdAt).toLocaleDateString()}</span>
                      {design.comments && design.comments.length > 0 && (
                        <span>
                          <FaComment className="me-1" />
                          {design.comments.length}
                        </span>
                      )}
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>

        {designs.length === 0 && !loading && (
          <div className="text-center py-5">
            <p className="text-muted">No designs found</p>
            <Button onClick={handleCreateDesign}>
              <FaPlus className="me-2" />
              Create Your First Design
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <Row className="mt-3">
            <Col>
              <div className="d-flex justify-content-center">
                <Button
                  variant="outline-primary"
                  disabled={pagination.page === 1}
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  className="me-2"
                >
                  Previous
                </Button>
                <span className="align-self-center me-2">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline-primary"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                >
                  Next
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </Container>
    </Layout>
  );
};

export default DesignsPage;
