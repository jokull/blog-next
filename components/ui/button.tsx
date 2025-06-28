"use client";

import * as React from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { composeTailwindRenderProps } from "@/lib/utils";

const buttonVariants = tv({
	base: [
		"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm",
		"ring-offset-background transition-colors",
		"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
		"disabled:pointer-events-none disabled:opacity-50",
		"[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	],
	variants: {
		variant: {
			default: "bg-primary text-primary-fg shadow hover:bg-primary/90",
			destructive: "bg-danger text-danger-fg shadow-sm hover:bg-danger/90",
			outline: "border border-input bg-bg shadow-sm hover:bg-accent hover:text-accent-fg",
			secondary: "bg-secondary text-secondary-fg shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-fg",
			link: "text-primary underline-offset-4 hover:underline",
		},
		size: {
			default: "h-10 px-4 py-2",
			sm: "h-9 rounded-md px-3",
			lg: "h-11 rounded-md px-8",
			icon: "h-10 w-10",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

export interface ButtonProps extends AriaButtonProps, VariantProps<typeof buttonVariants> {
	className?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<AriaButton
				className={composeTailwindRenderProps(className, buttonVariants({ variant, size }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
