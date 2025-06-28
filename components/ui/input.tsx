"use client";

import * as React from "react";
import { Input as AriaInput, type InputProps as AriaInputProps } from "react-aria-components";
import { composeTailwindRenderProps } from "@/lib/utils";

export interface InputProps extends AriaInputProps {
	className?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		return (
			<AriaInput
				type={type}
				className={composeTailwindRenderProps(
					className,
					"flex h-10 w-full rounded-md border border-input bg-bg px-3 py-2 text-sm ring-offset-bg file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
				)}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
