import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaTrash, FaSave, FaArrowLeft } from 'react-icons/fa';
import Layout from '@/components/app/Layout';
import { Customer } from '@/types/Customer';
import { Company } from '@/types/Company';
import { Quote } from '@/types/Quote';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  itemType: 'apparel' | 'printing' | 'setup' | 'shipping' | 'other';
}

const CreateInvoicePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerId: '',
    quoteId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    taxRate: 0,
    discountAmount: 0,
    notes: '',
    terms: 'Payment is due within 30 days of invoice date.'
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, total: 0, itemType: 'apparel' }
  ]);

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

  const fetchQuotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/quotes/${session?.user?.companyId}`);
      const data = await response.json();
      if (response.ok) {
        setQuotes(data.quotes || []);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
    }
  }, [session?.user?.companyId]);

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch(`/api/company/${session?.user?.companyId}`);
      const data = await response.json();
      if (response.ok) {
        setCompany(data.company);
        if (data.company?.salesTax) {
          setFormData(prev => ({ ...prev, taxRate: parseFloat(data.company.salesTax) }));
        }
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    }
  }, [session?.user?.companyId]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCustomers(),
        fetchQuotes(),
        fetchCompany()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers, fetchQuotes, fetchCompany]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, session, fetchData, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0, itemType: 'apparel' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const loadQuoteData = (quoteId: string) => {
    const quote = quotes.find(q => q._id === quoteId);
    if (quote) {
      // Set customer
      setFormData(prev => ({ ...prev, customerId: quote.selectedCustomerId || '' }));
      
      // Convert quote items to invoice items
      const invoiceItems: InvoiceItem[] = quote.items.map(item => {
        const totalQuantity = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
        return {
          description: `${item.brandAndStyle} - ${item.color}`,
          quantity: totalQuantity,
          unitPrice: item.standardPrice,
          total: totalQuantity * item.standardPrice,
          itemType: 'apparel'
        };
      });
      
      setItems(invoiceItems);
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discountAmount = formData.discountAmount || 0;
    const taxRate = formData.taxRate || 0;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (taxRate / 100);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }

    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      setError('Please fill in all item details');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const invoiceData = {
        ...formData,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemType: item.itemType
        }))
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Invoice created successfully!');
        setTimeout(() => {
          router.push('/app/invoice');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setError('Failed to create invoice');
    } finally {
      setSaving(false);
    }
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

  const { subtotal, discountAmount, taxAmount, total } = calculateTotals();

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
            <h2>Create Invoice</h2>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={8}>
              <Card className="mb-4">
                <Card.Header>
                  <h5>Invoice Details</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Customer *</Form.Label>
                        <Form.Select
                          name="customerId"
                          value={formData.customerId}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="">Select a customer</option>
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
                        <Form.Label>Create from Quote</Form.Label>
                        <Form.Select
                          name="quoteId"
                          value={formData.quoteId}
                          onChange={(e) => {
                            handleInputChange(e);
                            if (e.target.value) {
                              loadQuoteData(e.target.value);
                            }
                          }}
                        >
                          <option value="">Select a quote (optional)</option>
                          {quotes.map((quote) => (
                            <option key={quote._id} value={quote._id}>
                              {quote.quoteId} - {quote.customerName}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Invoice Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="invoiceDate"
                          value={formData.invoiceDate}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Due Date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleInputChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5>Items</h5>
                  <Button variant="outline-primary" size="sm" onClick={addItem}>
                    <FaPlus className="me-2" />
                    Add Item
                  </Button>
                </Card.Header>
                <Card.Body>
                  {items.map((item, index) => (
                    <Row key={index} className="mb-3">
                      <Col md={4}>
                        <Form.Control
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Control
                          type="number"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </Col>
                      <Col md={2}>
                        <Form.Select
                          value={item.itemType}
                          onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                        >
                          <option value="apparel">Apparel</option>
                          <option value="printing">Printing</option>
                          <option value="setup">Setup</option>
                          <option value="shipping">Shipping</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Col>
                      <Col md={1}>
                        <div className="d-flex align-items-center h-100">
                          <span className="fw-bold">${item.total.toFixed(2)}</span>
                        </div>
                      </Col>
                      <Col md={1}>
                        {items.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <FaTrash />
                          </Button>
                        )}
                      </Col>
                    </Row>
                  ))}
                </Card.Body>
              </Card>

              <Card className="mb-4">
                <Card.Header>
                  <h5>Additional Information</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Additional notes for the customer..."
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Terms</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="terms"
                      value={formData.terms}
                      onChange={handleInputChange}
                      placeholder="Payment terms and conditions..."
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="sticky-top" style={{ top: '20px' }}>
                <Card.Header>
                  <h5>Invoice Summary</h5>
                </Card.Header>
                <Card.Body>
                  <Row className="mb-2">
                    <Col>Subtotal:</Col>
                    <Col className="text-end">${subtotal.toFixed(2)}</Col>
                  </Row>
                  
                  <Row className="mb-2">
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Discount"
                        name="discountAmount"
                        value={formData.discountAmount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        size="sm"
                      />
                    </Col>
                    <Col className="text-end">-${discountAmount.toFixed(2)}</Col>
                  </Row>

                  <Row className="mb-2">
                    <Col>
                      <Form.Control
                        type="number"
                        placeholder="Tax Rate %"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        step="0.01"
                        size="sm"
                      />
                    </Col>
                    <Col className="text-end">${taxAmount.toFixed(2)}</Col>
                  </Row>

                  <hr />
                  <Row className="mb-3">
                    <Col><strong>Total:</strong></Col>
                    <Col className="text-end"><strong>${total.toFixed(2)}</strong></Col>
                  </Row>

                  <div className="d-grid gap-2">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          Create Invoice
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => router.back()}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </Layout>
  );
};

export default CreateInvoicePage;
