import { useEffect, useState } from 'react';
import { Attachment } from '../Utils/Types';
import AttachmentContainer from './AttachmentContainer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowNextIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@nextui-org/react';
import { getCurrentHost } from '../Utils/Functions/Functions';

interface IProps {
	attachments: Attachment[];
}

export default function Carousel({ attachments }: IProps) {
	const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

	useEffect(() => {
		const currentItem = document.getElementById(
			`carousel-item-${attachments[currentSlideIndex].id}`,
		);
		currentItem?.scrollIntoView({ behavior: 'smooth' });
	}, [currentSlideIndex]);

	return (
		<div className="flex flex-col justify-center">
			<div className="aspect-square h-full flex flex-row max-w-full justify-center items-center">
				<Button
					isIconOnly
					onClick={() =>
						setCurrentSlideIndex((prev) =>
							prev > 0 ? prev - 1 : attachments.length - 1,
						)
					}
				>
					<ArrowBackIcon />
				</Button>
				<div className="flex flex-row aspect-square h-full w-auto overflow-hidden justify-center items-center">
					<div className="flex flex-row w-full h-full">
						{attachments.map((att) => (
							<div
								key={att.id}
								id={`carousel-item-${att.id}`}
								className="h-full w-full aspect-square p-5 *:w-full *:h-full flex justify-center items-center"
							>
								<AttachmentContainer attachment={att} />
							</div>
						))}
					</div>
				</div>
				<Button
					isIconOnly
					onClick={() =>
						setCurrentSlideIndex((prev) =>
							prev < attachments.length - 1 ? prev + 1 : 0,
						)
					}
				>
					<ArrowNextIcon />
				</Button>
			</div>
			<Button
				className="min-w-0"
				color="primary"
				onClick={() => {
					window.open(
						getCurrentHost(attachments[currentSlideIndex].path),
					);
				}}
			>
				Baixar esse anexo
			</Button>
		</div>
	);
}
