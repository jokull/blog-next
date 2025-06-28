import cn from "clsx";

export function BlockSideTitle({
	title,
	children,
}: {
	title: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<figure>
			<span className="inline-block w-full">
				<span className="sidenote-content float-left w-full">{children}</span>
			</span>
			<span
				className={cn(
					"sidenote relative mx-auto mt-3.5 mb-7 block w-[80%] text-pretty text-left text-blue-400 text-xs leading-5 sm:text-sm sm:leading-6",
					"text:-mr-[50%] text:float-right text:clear-right text:mt-0 text:inline text:w-[50%] text:pl-7",
				)}
			>
				<span className="sr-only">Sidenote: </span>
				{title}
			</span>
		</figure>
	);
}
