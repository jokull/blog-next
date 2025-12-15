import type { InferSelectModel } from "drizzle-orm";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DialogActions,
	DialogBody,
	DialogContent,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { Post } from "@/schema";
import { previewPost } from "../server";

export function Preview({
	children,
	post,
}: {
	children: ReactNode;
	post: Pick<InferSelectModel<typeof Post>, "slug" | "previewMarkdown">;
}) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
			<form
				className="contents"
				onSubmit={(event) => {
					event.preventDefault();
					void previewPost(post.slug, {
						previewMarkdown: post.previewMarkdown,
					});
				}}
			>
				<Button
					className="w-full"
					type="submit"
					onPress={() => {
						setIsOpen(true);
					}}
				>
					Open Preview
				</Button>
			</form>
			<DialogOverlay>
				<DialogContent>
					<DialogTitle>Preview</DialogTitle>
					<DialogBody>{children}</DialogBody>
					<DialogActions>
						<Button
							onPress={() => {
								setIsOpen(false);
							}}
						>
							Close
						</Button>
					</DialogActions>
				</DialogContent>
			</DialogOverlay>
		</DialogTrigger>
	);
}
