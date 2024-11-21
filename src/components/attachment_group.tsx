import {
	Card,
	Modal,
	ModalBody,
	ModalContent,
	ModalHeader,
} from '@nextui-org/react';
import { Attachment } from '../utils/types';
import AttachmentContainer from './attachment_container';
import { useRef, useState } from 'react';
import Carousel from './carousel';

interface IProps {
	attachments: Attachment[];
}

export default function AttachmentGroup({ attachments }: IProps) {
	const [isFocused, setIsFocused] = useState(false);

	const groupRef = useRef<HTMLDivElement>(null);
	attachments = attachments.sort((att) =>
		att.mime_type.startsWith('image') ? 1 : -1,
	);
	return (
		<div className="flex flex-col w-[300px] ">
			<Card
				className="w-full aspect-square grid grid-cols-2 *:*:*:w-1/2 rounded-2xl"
				isHoverable
				isPressable
				ref={groupRef}
				onPress={() => {
					setIsFocused(true);
				}}
			>
				{attachments
					.slice(0, attachments.length > 4 ? 4 : attachments.length)
					.map((att) => (
						<AttachmentContainer
							attachment={att}
							isPreviewOnly={true}
						/>
					))}
			</Card>
			<small
				style={{ fontSize: '12px' }}
				className="ms-auto inline-block mt-1 me-2 overflow-ellipsis text-nowrap whitespace-nowrap overflow-hidden w-full"
			>
				{attachments.length} arquivos:{' '}
				{attachments.map((att) => att.filename).join(', ')}
			</small>
			<Modal
				isOpen={isFocused}
				onOpenChange={(open) => setIsFocused(open)}
				placement="center"
				size="lg"
			>
				<ModalContent>
					<ModalHeader>
						<h1 className="text-ellipsis w-full whitespace-nowrap overflow-hidden me-3">
							{attachments.length} Anexos
						</h1>
					</ModalHeader>
					<ModalBody>
						<Carousel attachments={attachments} />
					</ModalBody>
				</ModalContent>
			</Modal>
		</div>
	);
}
