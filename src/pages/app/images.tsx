import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Layout from '@/components/app/Layout';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';

const ImageGallery: NextPage = () => {
	const { data: session } = useSession();
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [images, setImages] = useState<any[]>([]);
	const [showRenameModal, setShowRenameModal] = useState(false);
	const [currentImage, setCurrentImage] = useState<any>(null);
	const [newDisplayName, setNewDisplayName] = useState('');

	useEffect(() => {
		// Fetch existing company data to populate images on load
		const fetchCompanyImages = async () => {
			if (!session?.user?.companyId) return;
			try {
				const response = await fetch(`/api/company/${session.user.companyId}`);
				const data = await response.json();
				if (data.success && data.company.apparelImages) {
					// Ensure fileIds are strings
					const apparelImagesResponse = data.company.apparelImages.map((img: any) => ({
						...img,
						fileId: img.fileId.toString(),
					}));
					setImages(apparelImagesResponse);
				}
			} catch (error) {
				console.error('Error fetching company images:', error);
			}
		};

		fetchCompanyImages();
	}, [session]);

	const upload = async () => {
		if (!selectedFiles || selectedFiles.length === 0) return;
		setIsUploading(true);
		try {
			for (let i = 0; i < selectedFiles.length; i++) {
				const fd = new FormData();
				fd.append('file', selectedFiles[i]);
				const resp = await fetch('/api/company/apparel-images', { method: 'POST', body: fd });
				if (!resp.ok) throw new Error('Upload failed');
				const json = await resp.json();
				setImages(json.apparelImages || []);
			}
			setSelectedFiles(null);
		} catch (e) {
			console.error('Upload error:', e);
		} finally {
			setIsUploading(false);
		}
	};

	const remove = async (fileId: string) => {
		const resp = await fetch('/api/company/apparel-images', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ fileId })
		});
		if (resp.ok) {
			const json = await resp.json();
			setImages(json.apparelImages || []);
		}
	};

	const openRenameModal = (image: any) => {
		setCurrentImage(image);
		setNewDisplayName(image.displayName || image.filename || '');
		setShowRenameModal(true);
	};

	const renameImage = async () => {
		if (!currentImage || !newDisplayName.trim()) return;
		const resp = await fetch('/api/company/apparel-images', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ fileId: currentImage.fileId, displayName: newDisplayName.trim() })
		});
		if (resp.ok) {
			const json = await resp.json();
			setImages(json.apparelImages || []);
			setShowRenameModal(false);
			setCurrentImage(null);
			setNewDisplayName('');
		}
	};

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col md={12}>
						<h1>Image Gallery</h1>
						<div className='mb-3'><strong>Company Apparel Images</strong></div>
						<div className='mb-3' style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
							{images.map((img: any) => (
								<div key={String(img.fileId)} style={{ position: 'relative', textAlign: 'center' }}>
									<img
										src={`/api/company/apparel-images/${img.fileId}`}
										alt={img.displayName || img.filename}
										style={{ width: 112, height: 112, objectFit: 'cover', borderRadius: 4, border: '1px solid #ddd', cursor: 'pointer' }}
										onClick={() => openRenameModal(img)}
									/>
									<Button size='sm' variant='outline-danger' onClick={() => remove(String(img.fileId))} style={{ position: 'absolute', top: -8, right: -8, padding: '0 6px' }}>×</Button>
									<div style={{ fontSize: '12px', marginTop: '4px', maxWidth: '112px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
										{img.displayName || img.filename}
									</div>
								</div>
							))}
						</div>
						<div className='d-flex align-items-center' style={{ gap: 8 }}>
							<Form.Control type='file' multiple accept='image/*' onChange={(e) => setSelectedFiles((e.target as HTMLInputElement).files)} />
							<Button onClick={upload} disabled={isUploading || !selectedFiles || selectedFiles.length === 0}>{isUploading ? 'Uploading...' : 'Upload'}</Button>
						</div>
					</Col>
				</Row>
			</Container>

			{/* Rename Modal */}
			<Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Rename Image</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className='mb-3'>
						<Form.Label>Display Name</Form.Label>
						<Form.Control
							type='text'
							value={newDisplayName}
							onChange={(e) => setNewDisplayName(e.target.value)}
							placeholder='Enter image name'
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant='secondary' onClick={() => setShowRenameModal(false)}>Cancel</Button>
					<Button variant='primary' onClick={renameImage}>Save</Button>
				</Modal.Footer>
			</Modal>
		</Layout>
	);
};

export default ImageGallery;
