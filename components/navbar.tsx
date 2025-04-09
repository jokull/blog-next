"use client";

import cn from "clsx";
import Image from "next/image";
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
        "leading-tight"
      )}
    >
      <Link {...props} className="w-full block" draggable={false} />
    </li>
  );
}

export default function Navbar() {
  return (
    <nav className="font-sans mobile:mr-3 sm:mr-5 md:mr-7 w-full mobile:w-22">
      <div className="mobile:sticky top-6 sm:top-10 md:top-14 mb-6 mobile:mb-0 w-full">
        <ul className="text-right flex gap-2">
          <Item href="/">
            <div className="flex flex-col items-end gap-2 whitespace-break-spaces text-sm font-medium">
              <Image
                src="/baldur-square.jpg"
                width={88}
                height={88}
                quality={80}
                alt="Profile"
                className="rounded-xl"
              />
              Jökull Sólberg
            </div>
          </Item>
        </ul>
        <div className="flex flex-col gap-1 text-sm text-right mt-4">
          <a href="mailto:jokull@solberg.is">email</a>
          <a href="https://x.com/jokull">x.com/jokull</a>
          <a href="https://github.com/jokull/blog-next">source</a>
        </div>
      </div>
    </nav>
  );
}
