"use client";

import cn from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Item(props: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const href = props.href;

  if (typeof href !== "string") {
    throw new Error("`href` must be a string");
  }

  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <li
      className={cn(
        isActive
          ? "text-rurikon-800"
          : "text-rurikon-300 hover:text-rurikon-600",
        "transition-colors hover:transform-none",
        "-mx-2"
      )}
    >
      <Link {...props} className="inline-block w-full px-2" draggable={false} />
    </li>
  );
}

export default function Navbar() {
  return (
    <nav className="font-sans mobile:mr-6 sm:mr-10 md:mr-14 w-full mobile:w-16">
      <ul className="text-right mobile:sticky top-6 sm:top-10 md:top-14 mb-6 mobile:mb-0 flex gap-2 justify-end mobile:block">
        <Item href="/">Jökull Sólberg</Item>
      </ul>
    </nav>
  );
}
