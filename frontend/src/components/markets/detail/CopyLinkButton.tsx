"use client";

import { useEffect, useState } from "react";
import { Check, LinkIcon } from "../../icons";
import { focusRing } from "../styles";

/** Copies this page's address, with a short "Copied" confirmation. */
export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard access can be refused (e.g. an insecure origin); there is nothing useful to show then.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Link copied" : "Copy link"}
      className={`flex h-9 items-center gap-2 rounded-xs border border-foreground/40 px-3.5 text-sm text-foreground/70 transition-colors hover:border-foreground/40 hover:text-foreground ${focusRing}`}
    >
      {copied ? <Check className="size-4" /> : <LinkIcon />}
      <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
    </button>
  );
}
