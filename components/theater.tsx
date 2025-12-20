interface TheaterProps {
	children: React.ReactNode;
	className?: string;
}

export function Theater({ children, className = "" }: TheaterProps) {
	return (
		<div
			className={`-mx-3 p-3 inset-shadow-md rounded-lg bg-linear-to-r from-stone-100 to-stone-200 text-white leading-tight ${className}`}
		>
			{children}
		</div>
	);
}
