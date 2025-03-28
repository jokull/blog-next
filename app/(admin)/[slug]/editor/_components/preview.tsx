import { Button } from "@/app/_catalyst/button";
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from "@/app/_catalyst/dialog";
import { Post } from "@/schema";
import { InferSelectModel } from "drizzle-orm";
import { ReactNode, useState } from "react";
import { previewPost } from "../server";

export function Preview({
  children,
  post,
}: {
  children: ReactNode;
  post: Pick<InferSelectModel<typeof Post>, "slug" | "previewMarkdown">;
}) {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <form
        className="contents"
        onSubmit={(event) => {
          event.preventDefault();
          previewPost(post.slug, {
            previewMarkdown: post.previewMarkdown,
          });
        }}
      >
        <Button
          className="w-full"
          type="submit"
          onClick={() => setIsOpen(true)}
        >
          Open Preview
        </Button>
      </form>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Preview</DialogTitle>
        <DialogBody>{children}</DialogBody>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
