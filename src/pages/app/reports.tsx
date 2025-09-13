import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Card, Button, Badge, Form, Alert, Spinner, Modal, Table } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash, FaDownload, FaChartBar, FaFilter, FaCog } from 'react-icons/fa';
import Layout from '@/components/app/Layout';
import { Report, ReportData } from '@/types/Report';
import styles from '@/styles/Reports.module.css';

const ReportsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v && v !== 'all'))
      });

      const response = await fetch(`/api/reports?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setReports(data.reports);
        setPagination(data.pagination);
      } else {
        setError(data.message || 'Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchReports();
    }
  }, [status, session, filters, pagination.page, fetchReports, router]);

  const handleCreateReport = () => {
    router.push('/app/reports/create');
  };

  const handleViewReport = async (report: Report) => {
    try {
      setDataLoading(true);
      setSelectedReport(report);
      
      const response = await fetch(`/api/reports/${report._id}/data`);
      const data = await response.json();

      if (response.ok) {
        setReportData(data);
        setShowDataModal(true);
      } else {
        setError(data.message || 'Failed to load report data');
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      setError('Failed to load report data');
    } finally {
      setDataLoading(false);
    }
  };

  const handleEditReport = (report: Report) => {
    router.push(`/app/reports/${report._id}/edit`);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchReports();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report');
    }
  };

  const handleExportReport = async (report: Report, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(`/api/reports/${report._id}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      setError('Failed to export report');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      sales: 'primary',
      customers: 'info',
      inventory: 'warning',
      financial: 'success',
      custom: 'secondary'
    };
    return <Badge bg={variants[type as keyof typeof variants] || 'secondary'}>{type.toUpperCase()}</Badge>;
  };

  const getDataSourceIcon = (dataSource: string) => {
    const icons = {
      quotes: '📋',
      invoices: '🧾',
      customers: '👥',
      sales: '💰',
      inventory: '📦',
      payments: '💳'
    };
    return icons[dataSource as keyof typeof icons] || '📊';
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
            <h2>Reports & Analytics</h2>
          </Col>
          <Col xs="auto">
            <Button onClick={handleCreateReport} className="me-2">
              <FaPlus className="me-2" />
              New Report
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
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Report Type</Form.Label>
                    <Form.Select
                      value={filters.type}
                      onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    >
                      <option value="all">All Types</option>
                      <option value="sales">Sales</option>
                      <option value="customers">Customers</option>
                      <option value="inventory">Inventory</option>
                      <option value="financial">Financial</option>
                      <option value="custom">Custom</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search reports..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Reports Grid */}
        <Row>
          {reports.map((report) => (
            <Col lg={4} md={6} className="mb-4" key={report._id}>
              <Card className={`h-100 ${styles.reportCard}`}>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">{report.name}</h6>
                    <small className="text-muted">
                      Created by: {report.createdBy || 'Unknown User'}
                    </small>
                  </div>
                  <div className="d-flex gap-1">
                    {getTypeBadge(report.type)}
                    {report.isPublic && <Badge bg="info">Public</Badge>}
                  </div>
                </Card.Header>
                <Card.Body>
                  {report.description && (
                    <p className="text-muted small mb-3">{report.description}</p>
                  )}
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-muted">Data Source:</span>
                      <span className="small">
                        {getDataSourceIcon(report.dataSource)} {report.dataSource}
                      </span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small text-muted">Columns:</span>
                      <span className="small">{report.columns.length}</span>
                    </div>
                    {report.isScheduled && (
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="small text-muted">Schedule:</span>
                        <span className="small">{report.scheduleFrequency}</span>
                      </div>
                    )}
                    {report.lastRunAt && (
                      <div className="d-flex align-items-center justify-content-between">
                        <span className="small text-muted">Last Run:</span>
                        <span className="small">{new Date(report.lastRunAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      {report.isScheduled && (
                        <small className="text-muted">
                          Next: {report.nextRunAt ? new Date(report.nextRunAt).toLocaleDateString() : 'N/A'}
                        </small>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewReport(report)}
                        disabled={dataLoading}
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handleEditReport(report)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleExportReport(report, 'pdf')}
                      >
                        <FaDownload />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteReport(report._id)}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer className="text-muted small">
                  <div className="d-flex justify-content-between">
                    <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                    <span>
                      <FaChartBar className="me-1" />
                      {report.columns.length} columns
                    </span>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>

        {reports.length === 0 && !loading && (
          <div className="text-center py-5">
            <p className="text-muted">No reports found</p>
            <Button onClick={handleCreateReport}>
              <FaPlus className="me-2" />
              Create Your First Report
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

        {/* Report Data Modal */}
        <Modal show={showDataModal} onHide={() => setShowDataModal(false)} size="xl">
          <Modal.Header closeButton>
            <Modal.Title>
              {selectedReport?.name}
              {dataLoading && <Spinner size="sm" className="ms-2" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {reportData && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <strong>Total Rows:</strong> {reportData.summary?.totalRows || 0}
                    {reportData.summary?.aggregates && Object.keys(reportData.summary.aggregates).length > 0 && (
                      <span className="ms-3">
                        <strong>Aggregates:</strong> {Object.keys(reportData.summary.aggregates).length} calculated
                      </span>
                    )}
                  </div>
                  <div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => selectedReport && handleExportReport(selectedReport, 'excel')}
                      className="me-2"
                    >
                      <FaDownload className="me-1" />
                      Excel
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => selectedReport && handleExportReport(selectedReport, 'pdf')}
                    >
                      <FaDownload className="me-1" />
                      PDF
                    </Button>
                  </div>
                </div>
                
                <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  <Table striped hover size="sm">
                    <thead className="sticky-top bg-light">
                      <tr>
                        {reportData.columns.map((column, index) => (
                          <th key={index}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.rows.map((row, index) => (
                        <tr key={index}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDataModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </Layout>
  );
};

export default ReportsPage;
