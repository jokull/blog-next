"use client";

// Documentation: https://intentui.com/docs/components/forms/text-field.md

import type { TextFieldProps } from "react-aria-components";
import { TextField as TextFieldPrimitive } from "react-aria-components";
import { cx } from "@/lib/primitive";
import { fieldStyles } from "./field";

const TextField = ({ className, ...props }: TextFieldProps) => (
	<TextFieldPrimitive data-slot="control" className={cx(fieldStyles(), className)} {...props} />
);

export { TextField };
