import type { HTMLAttributes } from "react";

/** The one container every block on a market page lives in: a boxed section ruled in ink, like a newspaper sidebar. */
export default function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <section {...rest} className={`border border-foreground p-6 ${className}`}>
      {children}
    </section>
  );
}
