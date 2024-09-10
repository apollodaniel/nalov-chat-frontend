import { Button, Modal } from "react-bootstrap";

interface Props{
	onConfirm: ()=>void,
	onCancel: ()=>void,
	visible: boolean,
	title: string,
	content: string
}

function ConfirmationPopup({title, content, visible, onConfirm, onCancel}: Props){
	return (
			<Modal
				size="sm"
				centered={true}
				show={visible}
			>
				<Modal.Header>
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{content}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={onCancel} variant="secondary">
						Cancelar
					</Button>
					<Button onClick={onConfirm} variant="danger">
						Confirmar
					</Button>
				</Modal.Footer>
			</Modal>
	);
}

export default ConfirmationPopup;
