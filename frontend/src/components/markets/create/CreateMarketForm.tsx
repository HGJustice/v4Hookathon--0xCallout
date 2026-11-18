"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";
import { appChain } from "@/lib/chain";
import { formatAmount, formatDateTime, formatEth, formatRelativeTime, parseEthInput } from "@/lib/format";
import { useCreateMarket } from "@/lib/markets/hooks";
import {
  DEADLINE_PRESETS,
  GAS_RESERVE,
  MIN_SEED,
  PROTOCOL_FEE,
  SEED_PRESETS,
  TITLE_MAX,
  TITLE_MIN,
  parseDeadlineParam,
  toDateTimeLocal,
} from "@/lib/markets/create";
import { getDeadlineProblem } from "@/lib/markets/market";
import { readClock, useNow } from "@/lib/useNow";
import { focusRing, monoLabel } from "../styles";
import ConnectPrompt from "../detail/ConnectPrompt";
import TxStatus from "../detail/TxStatus";

const DAY_MS = 86_400_000;
type Preset = "custom" | (typeof DEADLINE_PRESETS)[number]["id"];

const field =
  "w-full rounded-xs border border-foreground/40 bg-transparent px-5 text-foreground placeholder:text-foreground/50 focus:border-foreground focus:outline-none";
const choice = (selected: boolean) =>
  `h-11 rounded-xs border px-4 text-sm ${focusRing} ${
    selected ? "border-foreground bg-foreground text-background" : "border-foreground/40 text-foreground/80"
  }`;

/**
 * The create-market form: a question, when it closes, and the ETH that opens the pool.
 * `?title=` and `?deadline=` prefill it (the Farcaster bot links here); nothing is ever sent
 * without the user pressing the button.
 */
export default function CreateMarketForm() {
  const params = useSearchParams();
  // Keyed on the link, so opening another prefilled link starts the form over.
  return <Form key={params.toString()} titleParam={params.get("title")} deadlineParam={params.get("deadline")} />;
}

function Form({ titleParam, deadlineParam }: { titleParam: string | null; deadlineParam: string | null }) {
  const router = useRouter();
  const { address } = useAccount();
  const balance = useBalance({ address, chainId: appChain.id });
  const create = useCreateMarket();
  const now = useNow();

  const [linkedDeadline] = useState(() => parseDeadlineParam(deadlineParam));
  const [title, setTitle] = useState(() => (titleParam ?? "").replace(/\s+/g, " ").trim().slice(0, TITLE_MAX));
  const [preset, setPreset] = useState<Preset>(linkedDeadline ? "custom" : "week");
  const [custom, setCustom] = useState(linkedDeadline ? toDateTimeLocal(linkedDeadline) : "");
  const [seed, setSeed] = useState("0.01");

  // Editing anything clears the result of the last attempt.
  const edit = <T,>(set: (value: T) => void) => (value: T) => {
    if (!create.isIdle) create.reset();
    set(value);
  };

  // The closing time at a given moment: a preset counts days from it.
  const deadlineFor = (nowMs: number) =>
    preset === "custom"
      ? custom
        ? new Date(custom)
        : null
      : new Date(nowMs + DEADLINE_PRESETS.find(({ id }) => id === preset)!.days * DAY_MS);
  // The shared clock is at most 30s old, plenty for showing it; submit() re-checks with the real time.
  const deadline = now === null ? null : deadlineFor(now);
  const deadlineProblem = deadline && now !== null ? getDeadlineProblem(deadline, new Date(now)) : null;

  const amount = parseEthInput(seed);
  const tooLow = amount !== null && amount < MIN_SEED;
  const tooMuch = amount !== null && balance.data !== undefined && amount + GAS_RESERVE > balance.data.value;
  const question = title.trim();
  const canCreate =
    question.length >= TITLE_MIN && !!deadline && !deadlineProblem && !!amount && !tooLow && !tooMuch && !create.isPending;

  function submit() {
    // Nothing guards the deadline on-chain, so check it against the real time, not the shared clock.
    const sentAt = readClock();
    const closes = deadlineFor(sentAt);
    if (!canCreate || !closes || getDeadlineProblem(closes, new Date(sentAt)) || !amount) return;
    create.mutate(
      { question, deadline: closes, amount },
      { onSuccess: ({ marketId }) => router.push(`/markets/${marketId}`) },
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="mt-10 space-y-8"
    >
      <Field
        id="market-question"
        label="Question"
        hint="Name the event, the date and how it will be decided."
        aside={`${title.length}/${TITLE_MAX}`}
      >
        <textarea
          id="market-question"
          aria-describedby="market-question-note"
          rows={3}
          maxLength={TITLE_MAX}
          value={title}
          disabled={create.isPending}
          placeholder="Will ETH close above $10,000 on December 31, 2026?"
          onChange={(event) => edit(setTitle)(event.target.value.replace(/\s*\n\s*/g, " "))}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className={`${field} resize-none py-4 font-display text-xl leading-snug`}
        />
      </Field>

      <Field
        id="market-closes"
        label="Closes"
        group
        hint={
          deadline && !deadlineProblem && now !== null
            ? `${formatDateTime(deadline.getTime())} (${formatRelativeTime(deadline.getTime(), now)})`
            : undefined
        }
        error={deadlineProblem ?? undefined}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[...DEADLINE_PRESETS, { id: "custom", label: "Pick a date" } as const].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={preset === id}
              disabled={create.isPending}
              onClick={() => edit(setPreset)(id)}
              className={choice(preset === id)}
            >
              {label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <input
            type="datetime-local"
            aria-label="Closing date and time"
            value={custom}
            disabled={create.isPending}
            onChange={(event) => edit(setCustom)(event.target.value)}
            className={`${field} mt-3 h-12 [color-scheme:dark]`}
          />
        )}
      </Field>

      <Field
        id="market-deposit"
        label="Opening deposit"
        hint="The market's starting pot. It is paid out to the winning side, and you don't get shares for it."
        error={
          tooLow
            ? `The minimum is ${formatAmount(formatEther(MIN_SEED), "ETH")}.`
            : tooMuch
              ? "That's more than your balance after network fees."
              : undefined
        }
        aside={balance.data ? `Balance ${formatAmount(formatEther(balance.data.value), "ETH")}` : undefined}
      >
        <div className="relative">
          <input
            id="market-deposit"
            aria-describedby="market-deposit-note"
            inputMode="decimal"
            autoComplete="off"
            value={seed}
            disabled={create.isPending}
            onChange={(event) => {
              // Plain decimals only, up to 18 places; anything else is ignored as it's typed.
              if (/^\d*\.?\d{0,18}$/.test(event.target.value)) edit(setSeed)(event.target.value);
            }}
            className={`${field} h-14 pr-16 font-mono text-xl tabular-nums`}
          />
          <span className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-foreground/65">ETH</span>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SEED_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={seed === value}
              disabled={create.isPending}
              onClick={() => edit(setSeed)(value)}
              className={`${choice(seed === value)} font-mono`}
            >
              {value}
            </button>
          ))}
        </div>
      </Field>

      <dl className="space-y-3 border-t border-foreground/10 pt-8 text-sm">
        <Row label="Starting odds" value="50% YES · 50% NO" />
        <Row label="Protocol fee" value={formatEth(PROTOCOL_FEE)} />
        <Row label="Opens the pool with" value={amount && !tooLow ? formatEth(amount - PROTOCOL_FEE) : "–"} />
        <div className="flex items-baseline justify-between gap-4 border-t border-foreground/10 pt-3">
          <dt className="font-medium text-foreground">You pay</dt>
          <dd className="font-mono text-base font-medium tabular-nums">{amount ? formatEth(amount) : "–"}</dd>
        </div>
      </dl>

      <div>
        {address ? (
          <button
            type="submit"
            disabled={!canCreate}
            className={`h-12 w-full rounded-xs bg-brand font-medium text-background disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
          >
            {create.isPending ? "Creating market…" : "Create market"}
          </button>
        ) : (
          <ConnectPrompt>Sign in to create a market.</ConnectPrompt>
        )}
        <div className="mt-3 min-h-5">
          <TxStatus
            isPending={create.isPending}
            isSuccess={create.isSuccess}
            error={create.error}
            hash={create.hash}
            success="Market created."
          />
        </div>
      </div>
    </form>
  );
}

/** A labelled form field with a hint (or an error) underneath and an optional note on the right. */
function Field({
  id,
  label,
  hint,
  error,
  aside,
  group,
  children,
}: {
  /** The control's id (or, for a group, the group's); its hint and error get `${id}-note`. */
  id: string;
  label: string;
  hint?: string;
  error?: string;
  aside?: string;
  /** The content is several buttons rather than one input, so the label is a group heading (no `aside`). */
  group?: boolean;
  children: ReactNode;
}) {
  const note = `${id}-note`;
  const message = (
    <p id={note} role={error ? "alert" : undefined} className={`mt-2 min-h-5 text-sm ${error ? "text-red-300" : "text-foreground/65"}`}>
      {error ?? hint}
    </p>
  );
  // A group's heading has to be the fieldset's own <legend>, so it takes no side note.
  if (group) {
    return (
      <fieldset aria-describedby={note}>
        <legend className={`${monoLabel} mb-2`}>{label}</legend>
        {children}
        {message}
      </fieldset>
    );
  }
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className={monoLabel}>
          {label}
        </label>
        {aside && <span className="text-xs text-foreground/65">{aside}</span>}
      </div>
      {children}
      {message}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-foreground/70">{label}</dt>
      <dd className="font-mono tabular-nums">{value}</dd>
    </div>
  );
}
