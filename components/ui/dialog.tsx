"use client";

import * as React from "react";
import {
	Dialog as AriaDialog,
	type DialogProps as AriaDialogProps,
	DialogTrigger,
	Heading,
	Modal,
	ModalOverlay,
	type ModalOverlayProps,
} from "react-aria-components";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const dialogVariants = tv({
	base: [
		"relative z-50 grid w-full gap-4 border bg-overlay p-6 shadow-lg duration-200",
		"data-entering:fade-in-0 data-entering:zoom-in-95 data-entering:animate-in",
		"data-exiting:fade-out-0 data-exiting:zoom-out-95 data-exiting:animate-out",
		"sm:rounded-lg",
	],
	variants: {
		size: {
			sm: "sm:max-w-sm",
			md: "sm:max-w-md",
			lg: "sm:max-w-lg",
			xl: "sm:max-w-xl",
			"2xl": "sm:max-w-2xl",
			"3xl": "sm:max-w-3xl",
			"4xl": "sm:max-w-4xl",
			"5xl": "sm:max-w-5xl",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

interface DialogOverlayProps extends ModalOverlayProps {
	className?: string;
}

const DialogOverlay = React.forwardRef<HTMLDivElement, DialogOverlayProps>(
	({ className, ...props }, ref) => (
		<ModalOverlay
			ref={ref}
			className={cn(
				"data-entering:fade-in-0 data-exiting:fade-out-0 fixed inset-0 z-50 bg-black/80 data-entering:animate-in data-exiting:animate-out",
				className,
			)}
			{...props}
		/>
	),
);
DialogOverlay.displayName = "DialogOverlay";

interface DialogContentProps extends AriaDialogProps, VariantProps<typeof dialogVariants> {
	className?: string;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
	({ className, size, ...props }, ref) => (
		<Modal className="data-[entering]:fade-in-0 data-[entering]:zoom-in-95 data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%] data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95 data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-overlay p-6 shadow-lg duration-200 data-[entering]:animate-in data-[exiting]:animate-out sm:rounded-lg">
			<AriaDialog ref={ref} className={cn(dialogVariants({ size, className }))} {...props} />
		</Modal>
	),
);
DialogContent.displayName = "DialogContent";

interface DialogTitleProps extends React.ComponentProps<typeof Heading> {
	className?: string;
}

const DialogTitle = React.forwardRef<HTMLDivElement, DialogTitleProps>(
	({ className, ...props }, ref) => (
		<Heading
			ref={ref}
			slot="title"
			className={cn("font-semibold text-lg leading-none tracking-tight", className)}
			{...props}
		/>
	),
);
DialogTitle.displayName = "DialogTitle";

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
	({ className, ...props }, ref) => (
		<p ref={ref} className={cn("text-muted-fg text-sm", className)} {...props} />
	),
);
DialogDescription.displayName = "DialogDescription";

interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn("grid gap-4 py-4", className)} {...props} />
	),
);
DialogBody.displayName = "DialogBody";

interface DialogActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

const DialogActions = React.forwardRef<HTMLDivElement, DialogActionsProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				"flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
				className,
			)}
			{...props}
		/>
	),
);
DialogActions.displayName = "DialogActions";

export {
	DialogTrigger,
	DialogOverlay,
	DialogContent,
	DialogTitle,
	DialogDescription,
	DialogBody,
	DialogActions,
};
