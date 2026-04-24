import React, { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '@/components/app/Layout';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

type Option = { value: string; label: string };
type QuoteOption = { value: string; label: string; customerId?: string };

const CreateDesignPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [customers, setCustomers] = useState<Option[]>([]);
  const [users, setUsers] = useState<Option[]>([]);
  const [quotes, setQuotes] = useState<QuoteOption[]>([]);
  const [allQuotes, setAllQuotes] = useState<QuoteOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerId: '',
    quoteId: '',
    title: '',
    description: '',
    apparelImageUrl: '' as string
  });

  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSupportingData = async () => {
      if (!session?.user?.companyId) return;
      try {
        setLoading(true);
        const [customersRes, usersRes, quotesRes] = await Promise.all([
          fetch(`/api/customers/by-company/${session.user.companyId}`),
          fetch(`/api/company-users/${session.user.companyId}`),
          fetch(`/api/quotes/${session.user.companyId}?quoteType=savedQuotes`)
        ]);

        const customersJson = await customersRes.json();
        const usersJson = await usersRes.json();
        const quotesJson = await quotesRes.json();

        if (customersRes.ok) {
          setCustomers((customersJson.customers || []).map((c: any) => ({ value: c._id, label: c.contactName || c.name || 'Customer' })));
        }
        if (usersRes.ok) {
          const usersArray = Array.isArray(usersJson) ? usersJson : usersJson.users || [];
          setUsers(usersArray.map((u: any) => ({ value: u._id, label: `${u.firstName || ''} ${u.lastName || ''}`.trim() })));
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
                  : (q.selectedCustomerId?._id || q.selectedCustomerId?.toString?.() || '')
            })
          }
          setAllQuotes(mapped)
        }
      } catch (e) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSupportingData();
    }
  }, [isAuthenticated, session?.user?.companyId]);

  // Filter quotes by selected customer
  useEffect(() => {
    if (!form.customerId) {
      setQuotes([]);
      setForm((prev) => ({ ...prev, quoteId: '' }));
      return;
    }
    const filtered = allQuotes.filter((q) => q.customerId === form.customerId);
    setQuotes(filtered);
    if (filtered.every((q) => q.value !== form.quoteId)) {
      setForm((prev) => ({ ...prev, quoteId: '' }));
    }
  }, [form.customerId, allQuotes]);

  const canSubmit = useMemo(() => {
    return Boolean(form.customerId && form.title && !submitting);
  }, [form.customerId, form.title, submitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const body = {
        customerId: form.customerId,
        quoteId: form.quoteId || undefined,
        title: form.title,
        description: form.description || undefined,
        
      };

      const res = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create design');
      }

      if (data && data._id) {
        const query = form.apparelImageUrl ? `?apparelImageUrl=${encodeURIComponent(form.apparelImageUrl)}` : '';
        router.push(`/app/designs/${data._id}/place${query}`);
      } else {
        router.push('/app/designs');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create design');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadApparel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.currentTarget;
    const file = inputEl.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/designs/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to upload apparel image');
      setForm((prev) => ({ ...prev, apparelImageUrl: data.file.fileUrl }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload apparel image');
    } finally {
      if (inputEl) inputEl.value = '';
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

  return (
    <Layout>
      <Container fluid className="mt-4">
        <Row>
          <Col md={12} lg={12} xl={11} xxl={10}>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Create Design</h5>
              </Card.Header>
              <Card.Body>
                {error && (
                  <Alert variant="danger" dismissible onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Customer</Form.Label>
                        <Form.Select name="customerId" value={form.customerId} onChange={handleChange} required>
                          <option value="">Select a customer</option>
                          {customers.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quote</Form.Label>
                        <Form.Select name="quoteId" value={form.quoteId} onChange={handleChange} disabled={!form.customerId}>
                          <option value="">No quote</option>
                          {quotes.map((q) => (
                            <option key={q.value} value={q.value}>{q.label}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control name="title" value={form.title} onChange={handleChange} placeholder="Design title" required />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleChange} placeholder="Describe the design briefly" />
                  </Form.Group>

                  {/* Category removed per request */}

                  {/* Assigned To and Due Date removed per request */}

                  <Form.Group className="mb-3">
                    <Form.Label>Apparel Image (optional)</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleUploadApparel} />
                    {form.apparelImageUrl && (
                      <div className="mt-2">
                        <small className="text-muted">Apparel image uploaded. It will preload in the placement editor.</small>
                      </div>
                    )}
                  </Form.Group>

                  {/* Tags removed per request */}

                  <div className="d-flex justify-content-end gap-2">
                    <Button variant="outline-secondary" type="button" onClick={() => router.push('/app/designs')} disabled={submitting}>Cancel</Button>
                    <Button type="submit" disabled={!canSubmit}>
                      {submitting ? 'Creating...' : 'Create Design'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default CreateDesignPage;


