import type { ReactNode } from "react";
import Card from "./Card";

/** The card an action lives in, with a title and spaced content. */
export default function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </Card>
  );
}
