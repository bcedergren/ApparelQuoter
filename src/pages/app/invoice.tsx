import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash, FaFilePdf, FaEnvelope, FaDollarSign } from 'react-icons/fa';
import Layout from '@/components/app/Layout';
import { Invoice } from '@/types/Invoice';
import { Customer } from '@/types/Customer';
import { Company } from '@/types/Company';
import { downloadInvoicePDF } from '@/utils/invoicePdfGenerator';
import styles from '@/styles/Invoice.module.css';

const InvoicesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    customerId: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/invoices?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to fetch invoices');
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

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch(`/api/company/${session?.user?.companyId}`);
      const data = await response.json();
      if (response.ok) {
        setCompany(data.company);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  }, [session?.user?.companyId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchInvoices();
      fetchCustomers();
      fetchCompany();
    }
  }, [status, session, filters, pagination.page, fetchInvoices, fetchCustomers, fetchCompany, router]);

  const handleCreateInvoice = () => {
    router.push('/app/invoices/create');
  };

  const handleViewInvoice = (invoice: Invoice) => {
    router.push(`/app/invoices/${invoice._id}`);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    router.push(`/app/invoices/${invoice._id}/edit`);
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchInvoices();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice');
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      const customer = customers.find(c => c._id === invoice.customerId);
      if (customer && company) {
        downloadInvoicePDF({ invoice, customer, company });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice._id}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchInvoices();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      setError('Failed to send invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      sent: 'info',
      paid: 'success',
      overdue: 'danger',
      cancelled: 'secondary'
    };
    return <Badge bg={variants[status as keyof typeof variants] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
            <h2>Invoices</h2>
          </Col>
          <Col xs="auto">
            <Button onClick={handleCreateInvoice} className="me-2">
              <FaPlus className="me-2" />
              Create Invoice
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Card>
          <Card.Header>
            <Row className="align-items-center">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder="Search invoices..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filters.customerId}
                  onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                >
                  <option value="">All Customers</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.companyName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Balance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>
                      {(() => {
                        const customer = customers.find(c => c._id === invoice.customerId);
                        return customer ? customer.contactName : 'Unknown';
                      })()}
                    </td>
                    <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                    <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>{formatCurrency(invoice.balanceDue)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleEditInvoice(invoice)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="me-1"
                        onClick={() => handleDownloadPDF(invoice)}
                      >
                        <FaFilePdf />
                      </Button>
                      {invoice.status === 'draft' && (
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-1"
                          onClick={() => handleSendInvoice(invoice)}
                        >
                          <FaEnvelope />
                        </Button>
                      )}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice._id)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {invoices.length === 0 && !loading && (
              <div className="text-center py-5">
                <p className="text-muted">No invoices found</p>
                <Button onClick={handleCreateInvoice}>
                  <FaPlus className="me-2" />
                  Create Your First Invoice
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>

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

export default InvoicesPage;
