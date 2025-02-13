import { Skeleton as SkeletonBase } from '@nextui-org/react';

interface IProps {
	children: any;
	className?: string;
	isLoaded: boolean;
}

export default function Skeleton({ children, className, isLoaded }: IProps) {
	if (isLoaded) {
		return <div className={className}>{children}</div>;
	}
	return (
		<SkeletonBase className={className + ' animate-pulse'}>
			{children}
		</SkeletonBase>
	);
}
