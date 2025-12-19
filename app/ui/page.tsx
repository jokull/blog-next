"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Description, FieldError, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Modal, ModalOverlay } from "react-aria-components";

export default function ComponentsDebugPage() {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div className="container mx-auto p-8 space-y-12">
			<div>
				<h1 className="text-3xl font-bold mb-2">Intent UI Components Debug</h1>
				<p className="text-muted-fg">Testing all updated components</p>
			</div>

			{/* Buttons */}
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Buttons</h2>
				<div className="flex gap-4 flex-wrap items-center">
					<Button>Default</Button>
					<Button intent="primary">Primary</Button>
					<Button intent="secondary">Secondary</Button>
					<Button intent="danger">Danger</Button>
					<Button intent="warning">Warning</Button>
					<Button isDisabled>Disabled</Button>
				</div>
			</section>

			{/* Inputs */}
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Inputs</h2>
				<div className="space-y-4 max-w-md">
					<TextField>
						<Label>Email</Label>
						<Input type="email" placeholder="Enter your email" />
					</TextField>

					<TextField>
						<Label>Password</Label>
						<Input type="password" placeholder="Enter password" />
						<Description>Must be at least 8 characters</Description>
					</TextField>

					<TextField isDisabled>
						<Label>Disabled Field</Label>
						<Input placeholder="Can't edit this" value="Disabled" />
					</TextField>

					<TextField isInvalid>
						<Label>With Error</Label>
						<Input placeholder="Invalid input" />
						<FieldError>This field is required</FieldError>
					</TextField>
				</div>
			</section>

			{/* Textarea */}
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Textarea</h2>
				<div className="space-y-4 max-w-md">
					<TextField>
						<Label>Bio</Label>
						<Textarea placeholder="Tell us about yourself..." rows={4} />
						<Description>Maximum 500 characters</Description>
					</TextField>
				</div>
			</section>

			{/* Select */}
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Select</h2>
				<div className="space-y-4 max-w-md">
					<Select placeholder="Choose a framework">
						<Label>Framework</Label>
						<SelectTrigger />
						<SelectContent>
							<SelectItem id="next">Next.js</SelectItem>
							<SelectItem id="remix">Remix</SelectItem>
							<SelectItem id="astro">Astro</SelectItem>
							<SelectItem id="nuxt">Nuxt</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</section>

			{/* Loaders */}
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Loaders</h2>
				<div className="flex gap-8 items-center flex-wrap">
					<div className="space-y-2 text-center">
						<Loader variant="spin" />
						<p className="text-sm text-muted-fg">Spin</p>
					</div>
					<div className="space-y-2 text-center">
						<Loader variant="ring" />
						<p className="text-sm text-muted-fg">Ring</p>
					</div>
				</div>
			</section>

			{/* Dialog */}
			<section className="space-y-4">
				<h2 className="text-2xl font-semibold">Dialog</h2>
				<Button
					onPress={() => {
						setDialogOpen(true);
					}}
				>
					Open Dialog
				</Button>
				<ModalOverlay isOpen={dialogOpen} onOpenChange={setDialogOpen} isDismissable>
					<Modal>
						<Dialog>
							<DialogHeader>
								<DialogTitle>Example Dialog</DialogTitle>
							</DialogHeader>
							<DialogBody>
								<p className="text-sm">
									This is a test dialog to verify the component works correctly.
								</p>
							</DialogBody>
							<DialogFooter>
								<DialogClose>Cancel</DialogClose>
								<Button
									intent="primary"
									onPress={() => {
										setDialogOpen(false);
										alert("Action confirmed!");
									}}
								>
									Confirm
								</Button>
							</DialogFooter>
						</Dialog>
					</Modal>
				</ModalOverlay>
			</section>

			{/* Component Status Summary */}
			<section className="space-y-4 border-t pt-8">
				<h2 className="text-2xl font-semibold">Updated Components</h2>
				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
					{[
						"Button",
						"Dialog",
						"Field",
						"Input",
						"Loader",
						"Select",
						"Tabs",
						"TextField",
						"Textarea",
						"Keyboard (new)",
						"Dropdown (new)",
						"Popover (new)",
					].map((component) => (
						<div
							key={component}
							className="p-3 border rounded-md bg-muted text-sm font-medium"
						>
							✓ {component}
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
