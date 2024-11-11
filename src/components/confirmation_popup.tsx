import {
	Button,
	Modal,
	ModalFooter,
	ModalHeader,
	ModalBody,
	ModalContent,
} from '@nextui-org/react';

interface Props {
	onConfirm: () => void;
	onCancel: () => void;
	visible: boolean;
	title: string;
	content: string;
}

function ConfirmationPopup({
	title,
	content,
	visible,
	onConfirm,
	onCancel,
}: Props) {
	return (
		<Modal
			isOpen={visible}
			backdrop="blur"
			isDismissable
			size="sm"
			onClose={onCancel}
		>
			<ModalContent>
				<ModalHeader>
					<h2>{title}</h2>
				</ModalHeader>
				<ModalBody className="flex flex-col items-center justify-center gap-2 ">
					<p style={{ textWrap: 'wrap' }}>{content}</p>
				</ModalBody>
				<ModalFooter>
					<Button onClick={onCancel} color="default" variant="flat">
						Cancelar
					</Button>
					<Button onClick={onConfirm} color="danger" variant="flat">
						Confirmar
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export default ConfirmationPopup;
