import {
	Accordion,
	AccordionItem,
	Button,
	Listbox,
	ListboxItem,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
} from '@nextui-org/react';
import { Attachment } from '../utils/types';
import { get_current_host } from '../utils/functions/functions';
import { Key, useEffect, useState } from 'react';
import AttachmentContainer from './attachment_container';

interface IProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	attachments: Attachment[];
}

export default function AttachmentDownloadPopup({
	isOpen,
	onOpenChange,
	attachments,
}: IProps) {
	const [selectedAttachments, setSelectedAttachments] = useState<
		Iterable<Key>
	>([]);

	const [hoveredElement, setHoveredElement] = useState<string | undefined>(
		undefined,
	);
	const [mouseLock, setMouseLock] = useState<any>(undefined);

	useEffect(() => {
		if (!mouseLock && hoveredElement) {
			setTimeout(() => {
				document
					.getElementById(`download-item-${hoveredElement}`)
					?.scrollIntoView({ behavior: 'smooth' });
				setMouseLock(undefined);
			}, 200);
		}
	}, [mouseLock, hoveredElement]);
	useEffect(() => {
		setSelectedAttachments([]);
	}, [isOpen]);
	return (
		<Modal
			isOpen={isOpen}
			className="max-h-[800px] max-md:max-h-[600px] max-md:mx-5"
			size="lg"
			onOpenChange={onOpenChange}
		>
			<ModalContent>
				<ModalHeader className="flex flex-col items-start gap-2">
					<h1>Selecione quais anexos deseja baixar</h1>
					<Button
						color="default"
						variant="bordered"
						className="self-end"
						onPress={() => {
							if (
								Array.from(selectedAttachments).length ==
								attachments.length
							) {
								setSelectedAttachments([]);
							} else {
								setSelectedAttachments(
									attachments.map((att) => att.id!),
								);
							}
						}}
					>
						{Array.from(selectedAttachments).length ==
						attachments.length
							? 'Nenhum'
							: 'Todos'}
					</Button>
				</ModalHeader>
				<ModalBody className="overflow-y-auto">
					<Listbox
						selectedKeys={selectedAttachments}
						selectionMode="multiple"
						onSelectionChange={(selection) => {
							setSelectedAttachments(Array.from(selection));
						}}
						onMouseMove={() => {
							setMouseLock((prev: any) => {
								clearTimeout(prev);
								return setTimeout(() => {
									setMouseLock(undefined);
								}, 500);
							});
						}}
					>
						{attachments.map((att) => (
							<ListboxItem
								key={att.id!}
								shouldFocusOnHover
								id={`download-item-${att.id}`}
								onMouseOver={() => {
									if (hoveredElement != att.id) {
										setHoveredElement(att.id);
									}
								}}
								onMouseLeave={() => {
									setHoveredElement(undefined);
								}}
							>
								<Accordion
									isCompact
									hideIndicator
									className="pointer-events-none"
									selectedKeys={
										hoveredElement == att.id && !mouseLock
											? 'all'
											: []
									}
								>
									<AccordionItem
										title={att.filename}
										className="pointer-events-none"
									>
										<div className="w-full h-full">
											<AttachmentContainer
												isPreviewOnly={true}
												attachment={att}
											/>
										</div>
									</AccordionItem>
								</Accordion>
							</ListboxItem>
						))}
					</Listbox>
				</ModalBody>
				<ModalFooter className="flex flex-col items-center">
					<Button
						color="primary"
						className="w-full"
						isDisabled={Array.from(selectedAttachments).length == 0}
						onPress={() => {
							for (let att of Array.from(selectedAttachments).map(
								(att) =>
									attachments.find((_att) => att == _att.id)
										?.path,
							)) {
								window.open(get_current_host(att));
							}
						}}
					>
						Baixar anexos selecionados
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
