import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { getMarketStatus, getOutcomeLabel, Outcome, type Market } from "@/lib/markets/market";
import { Check } from "../../icons";
import Section from "./Section";

type StepState = "done" | "current" | "todo";
type Step = { title: string; detail?: string; state: StepState };

function buildSteps(market: Market, now: number): Step[] {
  const status = getMarketStatus(market, BigInt(Math.floor(now / 1000)));
  const deadline = Number(market.deadline) * 1000;
  const proposedAt = Number(market.proposedAt) * 1000;
  // The multisig can resolve a market that was never proposed, and before its deadline.
  const wasProposed = market.proposedOutcome !== Outcome.Unresolved;
  const proposedDetail = `${getOutcomeLabel(market.proposedOutcome)} · ${formatRelativeTime(proposedAt, now)}`;

  const steps: Step[] = [
    status === "open"
      ? { title: "Betting open", detail: `Closes ${formatDateTime(deadline)}`, state: "current" }
      : { title: "Betting closed", detail: deadline > now ? "Closed early" : formatDateTime(deadline), state: "done" },
  ];

  if (status === "open") {
    steps.push({ title: "Result proposed", state: "todo" });
  } else if (status === "closed") {
    steps.push({ title: "Result proposed", detail: "Waiting for someone to propose it", state: "current" });
  } else if (wasProposed) {
    steps.push({ title: "Result proposed", detail: proposedDetail, state: status === "proposed" ? "current" : "done" });
  }

  if (market.outcomeDisputed) {
    steps.push({
      title: "Disputed",
      detail: `With ${getOutcomeLabel(market.disputedOutcome)}`,
      state: status === "disputed" ? "current" : "done",
    });
  }

  steps.push(
    status === "resolved"
      ? { title: `Resolved ${getOutcomeLabel(market.finalOutcome)}`, detail: "Winners can redeem", state: "done" }
      : { title: "Resolved", state: "todo" },
  );
  return steps;
}

/** The market's progress from open to resolved, as a vertical list of steps. */
export default function StatusTimeline({ market, now }: { market: Market; now: number }) {
  const steps = buildSteps(market, now);
  return (
    <Section title="How this market resolves">
      <p className="mt-2 max-w-[560px] text-[15px] leading-7 text-foreground/65">
        After the deadline anyone can propose the result. If nobody disputes it, the resolver finalises it; if someone
        does, the multisig decides. Winners then redeem their shares for their cut of the pot.
      </p>
      <ol className="mt-6">
        {steps.map((step, i) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0" aria-current={step.state === "current" ? "step" : undefined}>
            {i < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-7 bottom-0 left-3 w-px -translate-x-1/2 ${step.state === "done" ? "bg-foreground/40" : "bg-foreground/10"}`}
              />
            )}
            <span
              aria-hidden="true"
              className={`relative flex size-6 shrink-0 items-center justify-center rounded-full ${
                step.state === "done"
                  ? "bg-foreground text-background"
                  : step.state === "current"
                    ? "border-2 border-brand bg-brand/15"
                    : "border border-foreground/20"
              }`}
            >
              {step.state === "done" && <Check className="size-3.5" />}
            </span>
            <div className="min-w-0 pt-px">
              <p className={`text-[15px] font-medium ${step.state === "todo" ? "text-foreground/65" : "text-foreground"}`}>
                {step.title}
              </p>
              {step.detail && <p className="mt-0.5 text-sm text-foreground/70">{step.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
