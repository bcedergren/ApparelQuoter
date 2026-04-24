import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFilePdf, FaEnvelope, FaDollarSign, FaArrowLeft, FaPlus } from 'react-icons/fa';
import Layout from '@/components/app/Layout';
import { Invoice, AddPaymentRequest } from '@/types/Invoice';
import { Customer } from '@/types/Customer';
import { Company } from '@/types/Company';
import { downloadInvoicePDF } from '@/utils/invoicePdfGenerator';

const InvoiceDetailPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { invoiceId } = router.query;
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<AddPaymentRequest>({
    amount: 0,
    paymentMethod: 'cash',
    reference: '',
    notes: ''
  });

  const fetchCustomer = useCallback(async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/by-company/${session?.user?.companyId}`);
      const data = await response.json();
      if (response.ok) {
        const customer = data.customers?.find((c: Customer) => c._id === customerId);
        setCustomer(customer || null);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
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

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();

      if (response.ok) {
        setInvoice(data);
        // Fetch customer and company data
        await Promise.all([
          fetchCustomer(data.customerId),
          fetchCompany()
        ]);
      } else {
        setError(data.message || 'Failed to fetch invoice');
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setError('Failed to fetch invoice');
    } finally {
      setLoading(false);
    }
  }, [invoiceId, fetchCustomer, fetchCompany]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && invoiceId) {
      fetchInvoice();
    }
  }, [status, invoiceId, fetchInvoice, router]);

  const handleEdit = () => {
    router.push(`/app/invoices/${invoiceId}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/app/invoice');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete invoice');
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setError('Failed to delete invoice');
    }
  };

  const handleDownloadPDF = () => {
    if (invoice && customer && company) {
      downloadInvoicePDF({ invoice, customer, company });
    }
  };

  const handleSendInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchInvoice();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send invoice');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
      setError('Failed to send invoice');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentData.amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setPaymentData({ amount: 0, paymentMethod: 'cash', reference: '', notes: '' });
        fetchInvoice();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add payment');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      setError('Failed to add payment');
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

  if (error) {
    return (
      <Layout>
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
          <Button onClick={() => router.back()}>
            <FaArrowLeft className="me-2" />
            Go Back
          </Button>
        </Container>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <Container className="mt-4">
          <Alert variant="warning">Invoice not found</Alert>
          <Button onClick={() => router.back()}>
            <FaArrowLeft className="me-2" />
            Go Back
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col>
            <Button
              variant="outline-secondary"
              onClick={() => router.back()}
              className="me-3"
            >
              <FaArrowLeft className="me-2" />
              Back
            </Button>
            <h2>Invoice #{invoice.invoiceNumber}</h2>
          </Col>
          <Col xs="auto">
            <div className="d-flex gap-2">
              <Button variant="outline-primary" onClick={handleEdit}>
                <FaEdit className="me-2" />
                Edit
              </Button>
              <Button variant="outline-success" onClick={handleDownloadPDF}>
                <FaFilePdf className="me-2" />
                PDF
              </Button>
              {invoice.status === 'draft' && (
                <Button variant="outline-info" onClick={handleSendInvoice}>
                  <FaEnvelope className="me-2" />
                  Send
                </Button>
              )}
              {invoice.balanceDue > 0 && (
                <Button variant="outline-warning" onClick={() => setShowPaymentModal(true)}>
                  <FaDollarSign className="me-2" />
                  Add Payment
                </Button>
              )}
              <Button variant="outline-danger" onClick={handleDelete}>
                <FaTrash className="me-2" />
                Delete
              </Button>
            </div>
          </Col>
        </Row>

        <Row>
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <Row className="align-items-center">
                  <Col>
                    <h5>Invoice Details</h5>
                  </Col>
                  <Col xs="auto">
                    {getStatusBadge(invoice.status)}
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Bill To:</h6>
                    <p className="mb-1"><strong>{customer?.contactName || 'Unknown Customer'}</strong></p>
                    {customer?.email && <p className="mb-1">{customer.email}</p>}
                    {customer?.phone && <p className="mb-1">{customer.phone}</p>}
                  </Col>
                  <Col md={6}>
                    <h6>Invoice Information:</h6>
                    <p className="mb-1"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                    <p className="mb-1"><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                    <p className="mb-1"><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    {invoice.quoteId && (
                      <p className="mb-1"><strong>Quote #:</strong> {invoice.quoteId}</p>
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5>Items</h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3}><strong>Subtotal:</strong></td>
                        <td><strong>{formatCurrency(invoice.subtotal)}</strong></td>
                      </tr>
                      {invoice.discountAmount > 0 && (
                        <tr>
                          <td colSpan={3}>Discount:</td>
                          <td>-{formatCurrency(invoice.discountAmount)}</td>
                        </tr>
                      )}
                      {invoice.taxAmount > 0 && (
                        <tr>
                          <td colSpan={3}>Tax ({invoice.taxRate}%):</td>
                          <td>{formatCurrency(invoice.taxAmount)}</td>
                        </tr>
                      )}
                      <tr className="table-primary">
                        <td colSpan={3}><strong>Total:</strong></td>
                        <td><strong>{formatCurrency(invoice.totalAmount)}</strong></td>
                      </tr>
                      {invoice.paidAmount > 0 && (
                        <tr>
                          <td colSpan={3}>Paid:</td>
                          <td>{formatCurrency(invoice.paidAmount)}</td>
                        </tr>
                      )}
                      {invoice.balanceDue > 0 && (
                        <tr className="table-danger">
                          <td colSpan={3}><strong>Balance Due:</strong></td>
                          <td><strong>{formatCurrency(invoice.balanceDue)}</strong></td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              </Card.Body>
            </Card>

            {(invoice.notes || invoice.terms) && (
              <Card className="mb-4">
                <Card.Header>
                  <h5>Additional Information</h5>
                </Card.Header>
                <Card.Body>
                  {invoice.notes && (
                    <div className="mb-3">
                      <h6>Notes:</h6>
                      <p className="text-muted">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <h6>Terms:</h6>
                      <p className="text-muted">{invoice.terms}</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}

            {invoice.payments && invoice.payments.length > 0 && (
              <Card>
                <Card.Header>
                  <h5>Payment History</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reference</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.payments.map((payment, index) => (
                          <tr key={index}>
                            <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</td>
                            <td>{payment.reference || '-'}</td>
                            <td>{payment.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Header>
                <h5>Invoice Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                {invoice.taxAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <strong>Total:</strong>
                  <strong>{formatCurrency(invoice.totalAmount)}</strong>
                </div>
                {invoice.paidAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Paid:</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                )}
                {invoice.balanceDue > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-danger">
                    <strong>Balance Due:</strong>
                    <strong>{formatCurrency(invoice.balanceDue)}</strong>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-2">
                  <span>Status:</span>
                  {getStatusBadge(invoice.status)}
                </div>
                {invoice.sentDate && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Sent:</span>
                    <span>{new Date(invoice.sentDate).toLocaleDateString()}</span>
                  </div>
                )}
                {invoice.paidDate && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Paid:</span>
                    <span>{new Date(invoice.paidDate).toLocaleDateString()}</span>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Payment Modal */}
        <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add Payment</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleAddPayment}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  min="0.01"
                  step="0.01"
                  max={invoice.balanceDue}
                  required
                />
                <Form.Text className="text-muted">
                  Maximum: {formatCurrency(invoice.balanceDue)}
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method *</Form.Label>
                <Form.Select
                  value={paymentData.paymentMethod}
                  onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Reference</Form.Label>
                <Form.Control
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                  placeholder="Check number, transaction ID, etc."
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  placeholder="Additional payment notes..."
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                <FaPlus className="me-2" />
                Add Payment
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </Layout>
  );
};

export default InvoiceDetailPage;
