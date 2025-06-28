import { IconChevronDown } from "@intentui/icons";
import * as React from "react";
import {
	Select as AriaSelect,
	type SelectProps as AriaSelectProps,
	Button,
	ListBox,
	ListBoxItem,
	type ListBoxItemProps,
	Popover,
	SelectValue,
} from "react-aria-components";
import { cn } from "@/lib/utils";

interface SelectProps<T extends object> extends Omit<AriaSelectProps<T>, "children"> {
	className?: string;
	placeholder?: string;
	children: React.ReactNode | ((item: T) => React.ReactNode);
}

function Select<T extends object>({ className, placeholder, children, ...props }: SelectProps<T>) {
	return (
		<AriaSelect className={cn("group flex flex-col gap-1", className)} {...props}>
			<Button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 group-open:ring-2 group-open:ring-ring group-open:ring-offset-2">
				<SelectValue className="flex-1 text-left">
					{({ selectedText }) => selectedText || placeholder}
				</SelectValue>
				<IconChevronDown className="h-4 w-4 opacity-50 transition-transform group-open:rotate-180" />
			</Button>
			<Popover className="data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 w-[--trigger-width] rounded-md border bg-overlay text-overlay-fg shadow-md data-[entering]:animate-in data-[exiting]:animate-out">
				<ListBox className="max-h-60 overflow-auto p-1">{children}</ListBox>
			</Popover>
		</AriaSelect>
	);
}

const SelectItem = React.forwardRef<HTMLDivElement, ListBoxItemProps>(
	({ className, children, ...props }, ref) => (
		<ListBoxItem
			ref={ref}
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none",
				"focus:bg-accent focus:text-accent-fg",
				"data-disabled:pointer-events-none data-disabled:opacity-50",
				"data-selected:bg-accent data-selected:text-accent-fg",
				className,
			)}
			{...props}
		>
			{children}
		</ListBoxItem>
	),
);
SelectItem.displayName = "SelectItem";

export { Select, SelectItem };
