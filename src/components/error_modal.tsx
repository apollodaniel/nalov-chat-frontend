import { Button, Modal } from "react-bootstrap";

interface Props{
	title: string,
	content: string,
	visible: boolean,
	onConfirm: ()=>void
}


function ErrorPopup({title, visible, content, onConfirm}: Props) {
	return (
		<Modal
			size="sm"
			show={visible}
		>
			<Modal.Header>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>{content}</p>
			</Modal.Body>
			<Modal.Footer>
				<Button onClick={onConfirm} variant="secondary">
					Fechar
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default ErrorPopup;
