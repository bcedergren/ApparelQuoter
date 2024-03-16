// components/DeleteConfirmationModal.tsx

import React, { FC } from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DeleteConfirmationModalProps {
	show: boolean;
	onHide: () => void;
	onConfirm: () => void;
	title: string; // Accept title as a prop
	body: string; // Accept body content as a prop
}

const DeleteConfirmationModal: FC<DeleteConfirmationModalProps> = ({
	show,
	onHide,
	onConfirm,
	title,
	body,
}) => {
	return (
		<Modal
			show={show}
			onHide={onHide}
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title> {/* Use title prop */}
			</Modal.Header>
			<Modal.Body>{body}</Modal.Body> {/* Use body prop */}
			<Modal.Footer>
				<Button
					variant='secondary'
					onClick={onHide}
				>
					Cancel
				</Button>
				<Button
					variant='danger'
					onClick={() => {
						onConfirm(); // Invoke the onConfirm prop function when the user confirms
						onHide(); // Optionally, automatically close the modal after confirmation
					}}
				>
					Delete
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default DeleteConfirmationModal;
