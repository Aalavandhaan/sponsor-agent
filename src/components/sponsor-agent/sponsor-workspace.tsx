import { useRef, useState, type FormEvent } from "react";
import { Check, ExternalLink, LoaderCircle, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  discoverSponsors,
  type DiscoveryProgress,
  type EventBrief,
  type VerifiedSponsor,
} from "@/lib/sponsor-api";
import { isValidEmail, requestGmailAccessToken, sendGmailMessage } from "@/lib/gmail";
import logoAsset from "@/assets/sponsor-agent-logo.png.asset.json";

const initialBrief: EventBrief = {
  eventName: "",
  city: "",
  footfall: "",
  audience: "",
  category: "",
  sponsorshipNeeded: "",
};

const inputClass =
  "h-12 w-full rounded-lg border border-input bg-card px-3.5 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/15";

type Draft = { to: string; subject: string; message: string };
type SendState = "idle" | "sending" | "sent" | "error";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      {children}
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">
      {message}
    </p>
  );
}

const researchSteps = [
  "Finding similar events",
  "Discovering sponsor candidates",
  "Verifying outreach contacts",
  "Preparing personalized emails",
] as const;

function ResearchProgress({ progress }: { progress: DiscoveryProgress }) {
  const activeStep = progress.phase === "analyzing" || progress.phase === "expanding"
    ? 0
    : progress.phase === "discovering"
      ? 1
      : progress.phase === "verifying"
        ? 2
        : 3;

  return (
    <div className="rounded-lg border border-border bg-muted/35 p-4" aria-live="polite">
      <ol className="grid gap-3 sm:grid-cols-4 sm:gap-2">
        {researchSteps.map((step, index) => {
          const complete = index < activeStep;
          const active = index === activeStep;
          return (
            <li key={step} className="flex items-center gap-2 sm:block">
              <div className="flex items-center sm:mb-2">
                <span
                  aria-hidden="true"
                  className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                    complete
                      ? "border-success bg-success text-primary-foreground"
                      : active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {complete ? <Check className="size-3.5" /> : index + 1}
                </span>
                {index < researchSteps.length - 1 ? (
                  <span className={`mx-2 hidden h-px flex-1 sm:block ${complete ? "bg-success" : "bg-border"}`} />
                ) : null}
              </div>
              <span className={`text-xs leading-5 ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {step}
              </span>
            </li>
          );
        })}
      </ol>
      <p role="status" className="mt-4 border-t border-border pt-3 text-sm font-medium text-foreground">
        {progress.message}
      </p>
    </div>
  );
}

function EventBriefForm({
  loading,
  error,
  progress,
  onResults,
}: {
  loading: boolean;
  error: string | null;
  progress: DiscoveryProgress | null;
  onResults: (brief: EventBrief) => void;
}) {
  const [brief, setBrief] = useState(initialBrief);

  const update = (key: keyof EventBrief, value: string) =>
    setBrief((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onResults(brief);
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-8">
      <div className="grid gap-5">
        <Field label="Event name">
          <input required placeholder="e.g. Urban Beats Festival 2026" value={brief.eventName} onChange={(e) => update("eventName", e.target.value)} className={inputClass} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Place / City">
            <input required placeholder="e.g. Bengaluru" value={brief.city} onChange={(e) => update("city", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Expected footfall">
            <input required inputMode="numeric" placeholder="e.g. 5,000" value={brief.footfall} onChange={(e) => update("footfall", e.target.value)} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Audience type">
            <input required placeholder="e.g. Product leaders, founders, and engineers" value={brief.audience} onChange={(e) => update("audience", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Event category">
            <select required value={brief.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
              <option value="" disabled>Select category...</option>
              <option>Technology &amp; SaaS</option>
              <option>Business &amp; Leadership</option>
              <option>Arts &amp; Culture</option>
              <option>Sports &amp; Wellness</option>
              <option>Education</option>
            </select>
          </Field>
        </div>
        <Field label="Sponsorship needed">
          <input required placeholder="e.g. ₹2,00,000 — title sponsor + 3 co-sponsors" value={brief.sponsorshipNeeded} onChange={(e) => update("sponsorshipNeeded", e.target.value)} className={inputClass} />
        </Field>
        {error ? <ErrorMessage message={error} /> : null}
        <Button type="submit" disabled={loading} className="mt-1 h-12 w-full sm:w-auto sm:min-w-44">
          {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          {loading ? "Researching…" : "Find sponsors"}
        </Button>
        {loading && progress ? <ResearchProgress progress={progress} /> : null}
      </div>
    </form>
  );
}

function SponsorCard({
  sponsor,
  selected,
  onToggleSelect,
  draft,
  onDraftChange,
  sendState,
  sendError,
  onSend,
  gmailToken,
  onConnectGmail,
}: {
  sponsor: VerifiedSponsor;
  selected: boolean;
  onToggleSelect: () => void;
  draft: Draft;
  onDraftChange: (draft: Draft) => void;
  sendState: SendState;
  sendError: string | null;
  onSend: () => void;
  gmailToken: string | null;
  onConnectGmail: () => void;
}) {
  const [open, setOpen] = useState(false);
  const contact = sponsor.contact;

  return (
    <article className="rounded-xl border border-border bg-card shadow-soft">
      <div className="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-7">
        <input
          type="checkbox"
          aria-label={`Select ${sponsor.company}`}
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1 size-4 accent-[var(--color-primary)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-lg font-bold text-foreground">{sponsor.company}</h3>
            {sponsor.contact.emailReady ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-success/20 bg-success/8 px-2 py-1 text-xs font-semibold text-success">
                <Check className="size-3.5" />
                Verified email
              </span>
            ) : null}
            {sponsor.confidence ? (
              <span className="detail-label">Confidence: {sponsor.confidence}</span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[0.9fr_1.3fr]">
        <div className="border-b border-border p-5 sm:p-7 lg:border-b-0 lg:border-r">
          <dl className="grid gap-5">
            {sponsor.whyRelevant ? (
              <div>
                <dt className="detail-label">Why this sponsor</dt>
                <dd className="mt-1.5 text-sm leading-6 text-foreground">{sponsor.whyRelevant}</dd>
              </div>
            ) : null}
            {sponsor.pastEvents.length > 0 ? (
              <div>
                <dt className="detail-label">Past similar events sponsored</dt>
                <dd className="mt-1.5">
                  <ul className="grid list-disc gap-1 pl-5 text-sm leading-6 text-foreground marker:text-muted-foreground">
                    {sponsor.pastEvents.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </dd>
              </div>
            ) : null}
            {contact.contactName ? (
              <div>
                <dt className="detail-label">Verified contact</dt>
                <dd className="mt-1 text-sm font-medium text-foreground">{contact.contactName}</dd>
              </div>
            ) : null}
            <div>
              <dt className="detail-label">Title / role</dt>
              <dd className="mt-1 text-sm text-foreground">
                {contact.contactTitle || contact.recommendedRole || "—"}
              </dd>
            </div>
            <div>
              <dt className="detail-label">Verified email</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{contact.contactEmail}</dd>
            </div>
            {contact.whyThisContact ? (
              <div>
                <dt className="detail-label">Why this contact</dt>
                <dd className="mt-1 text-sm leading-6 text-foreground">{contact.whyThisContact}</dd>
              </div>
            ) : null}
          </dl>
          {sponsor.evidenceUrls.length > 0 ? (
            <details className="mt-6 border-t border-border pt-4">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">Research evidence</summary>
              <div className="mt-3 grid gap-2">
                {sponsor.evidenceUrls.map((url, index) => (
                  <a key={index} href={url} target="_blank" rel="noreferrer" className="source-link min-w-0">
                    <span className="truncate">{url}</span><ExternalLink className="size-3 shrink-0" />
                  </a>
                ))}
              </div>
            </details>
          ) : null}
        </div>

        <div className="p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Draft email</p>
              <h4 className="mt-1 font-bold text-foreground">Personalized for {sponsor.company}</h4>
              <p className="mt-1 text-xs text-muted-foreground">This sponsor receives this individual message.</p>
            </div>
            <Button variant="ghost" size="small" onClick={() => setOpen((value) => !value)}>
              {open ? "Hide email" : "Review email"}
            </Button>
          </div>

          {open ? (
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <label className="composer-row"><span>To</span><input value={draft.to} onChange={(e) => onDraftChange({ ...draft, to: e.target.value })} /></label>
              <label className="composer-row"><span>Subject</span><input value={draft.subject} onChange={(e) => onDraftChange({ ...draft, subject: e.target.value })} /></label>
              <label className="block">
                <span className="sr-only">Message</span>
                <textarea
                  aria-label={`Message to ${sponsor.company}`}
                  value={draft.message}
                  onChange={(e) => onDraftChange({ ...draft, message: e.target.value })}
                  className="min-h-64 w-full resize-y border-0 bg-card p-4 text-sm leading-6 text-foreground outline-none"
                />
              </label>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">{draft.subject || "(no subject)"}</p>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">{draft.message}</p>
            </div>
          )}

          {sendError ? <div className="mt-4"><ErrorMessage message={sendError} /></div> : null}
          {sendState === "sent" ? (
            <p role="status" className="mt-4 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm font-medium text-foreground">Email sent successfully.</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {gmailToken ? "Sending from your connected Gmail account." : (
                <>Gmail is not connected. <button type="button" onClick={onConnectGmail} className="font-semibold text-foreground underline">Connect Gmail</button> to send.</>
              )}
            </p>
            <Button onClick={onSend} disabled={sendState === "sending" || sendState === "sent"}>
              {sendState === "sending" ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {sendState === "sent" ? <Check className="size-4" /> : null}
              {sendState === "sending" ? "Sending…" : sendState === "sent" ? "Sent" : "Approve & send"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SponsorWorkspace() {
  const [brief, setBrief] = useState<EventBrief | null>(null);
  const [sponsors, setSponsors] = useState<VerifiedSponsor[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<DiscoveryProgress | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sendStates, setSendStates] = useState<Record<string, SendState>>({});
  const [sendErrors, setSendErrors] = useState<Record<string, string | null>>({});
  const [bulkSending, setBulkSending] = useState(false);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const connectGmail = async () => {
    setGmailError(null);
    setGmailConnecting(true);
    try {
      const clientId = import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined;
      if (!clientId) {
        throw new Error("Google sign-in is not configured yet (missing VITE_GOOGLE_CLIENT_ID). Please try again later.");
      }
      const token = await requestGmailAccessToken(clientId);
      setGmailToken(token);
    } catch (error) {
      setGmailError(error instanceof Error ? error.message : "Could not connect Gmail. Please try again.");
    } finally {
      setGmailConnecting(false);
    }
  };

  const runDiscovery = async (eventBrief: EventBrief) => {
    setBrief(eventBrief);
    setLoading(true);
    setSearchError(null);
    setSponsors(null);
    setDrafts({});
    setSelected({});
    setSendStates({});
    setSendErrors({});
    setProgress({ phase: "analyzing", message: "Researching similar events...", verifiedCount: 0, checkedCount: 0 });
    try {
      const found = await discoverSponsors(eventBrief, (update: DiscoveryProgress) => setProgress(update));
      setProgress({
        phase: "preparing",
        message: "Preparing personalized emails...",
        verifiedCount: found.length,
        checkedCount: 0,
      });
      await new Promise((resolve) => window.setTimeout(resolve, 400));
      setSponsors(found);
      setDrafts(
        Object.fromEntries(
          found.map((sponsor) => [
            sponsor.company,
            {
              to: sponsor.contact.contactEmail,
              subject: sponsor.contact.draftSubject,
              message: sponsor.contact.draftEmail,
            },
          ]),
        ),
      );
      window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (error) {
      setSponsors(null);
      setSearchError(error instanceof Error ? error.message : "Sponsor research failed. Please try again.");
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const sendOne = async (sponsor: VerifiedSponsor) => {
    const draft = drafts[sponsor.company];
    const setError = (message: string | null) =>
      setSendErrors((current) => ({ ...current, [sponsor.company]: message }));
    const setState = (state: SendState) =>
      setSendStates((current) => ({ ...current, [sponsor.company]: state }));

    setError(null);
    if (!gmailToken) {
      setError("Connect Gmail before sending this email.");
      return false;
    }
    if (!draft || !isValidEmail(draft.to)) {
      setError("This sponsor does not have a valid recipient email address.");
      return false;
    }
    setState("sending");
    try {
      await sendGmailMessage(gmailToken, draft);
      setState("sent");
      return true;
    } catch (error) {
      setState("error");
      setError(error instanceof Error ? error.message : "Could not send the email. Please try again.");
      return false;
    }
  };

  const sendMany = async (list: VerifiedSponsor[]) => {
    setBulkSending(true);
    for (const sponsor of list) {
      if (sendStates[sponsor.company] === "sent") continue;
      await sendOne(sponsor);
    }
    setBulkSending(false);
  };

  const sendable = (sponsors ?? []).filter(
    (sponsor) => sponsor.contact.emailReady && isValidEmail(drafts[sponsor.company]?.to ?? ""),
  );
  const selectedSponsors = sendable.filter((sponsor) => selected[sponsor.company]);

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-17 max-w-site items-center justify-between px-5 sm:px-7">
          <a href="#top" className="flex items-center gap-2.5 font-bold text-foreground"><img src={logoAsset.url} alt="Sponsor Agent" className="size-10 rounded-lg object-contain" />Sponsor Agent</a>
          <nav className="flex items-center gap-1 sm:gap-3" aria-label="Primary navigation">
            <a className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground sm:block" href="#workflow">How it works</a>
            <button className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:block" type="button">Past searches</button>
            <Button variant="outline" size="small" onClick={connectGmail} disabled={gmailConnecting || Boolean(gmailToken)}>
              {gmailConnecting ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {gmailToken ? <Check className="size-4" /> : null}
              {gmailToken ? "Gmail connected" : gmailConnecting ? "Connecting…" : "Connect Gmail"}
            </Button>
          </nav>
        </div>
      </header>
      <main id="top" className="mx-auto max-w-site px-5 pb-24 pt-12 sm:px-7 sm:pt-16">
        <section className="max-w-3xl">
          <p className="eyebrow">Sponsorship research workspace</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">Find sponsors for your event</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Tell us about your event. Sponsor Agent researches similar events, identifies companies that have sponsored them before, and helps you reach the right people.</p>
        </section>
        {gmailError ? <div className="mt-6 max-w-3xl"><ErrorMessage message={gmailError} /></div> : null}
        <section className="mt-8 max-w-4xl" aria-label="Event details">
          <EventBriefForm loading={loading} error={searchError} progress={progress} onResults={runDiscovery} />
        </section>

        {sponsors && brief ? (
          <section ref={resultsRef} id="workflow" className="scroll-mt-24 pt-14">
            <div className="mb-5">
              <p className="eyebrow">Outreach-ready sponsors</p>
              <h2 className="mt-1 text-2xl font-bold text-foreground">
                {sponsors.length < 5
                  ? `We found ${sponsors.length} verified outreach-ready ${sponsors.length === 1 ? "sponsor" : "sponsors"} for this event.`
                  : `${sponsors.length} verified sponsors for ${brief.eventName}`}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Only sponsors with publicly verified professional email addresses are shown.
              </p>
            </div>

            {sponsors.length > 0 ? (
              <>
                <div className="grid gap-6">
                  {sponsors.map((sponsor) => (
                    <SponsorCard
                      key={sponsor.company}
                      sponsor={sponsor}
                      selected={Boolean(selected[sponsor.company])}
                      onToggleSelect={() =>
                        setSelected((current) => ({ ...current, [sponsor.company]: !current[sponsor.company] }))
                      }
                      draft={drafts[sponsor.company] ?? { to: "", subject: "", message: "" }}
                      onDraftChange={(draft) => setDrafts((current) => ({ ...current, [sponsor.company]: draft }))}
                      sendState={sendStates[sponsor.company] ?? "idle"}
                      sendError={sendErrors[sponsor.company] ?? null}
                      onSend={() => void sendOne(sponsor)}
                      gmailToken={gmailToken}
                      onConnectGmail={connectGmail}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-soft sm:px-7">
                  <p className="text-sm text-muted-foreground">
                    {selectedSponsors.length} of {sendable.length} selected. Each sponsor receives its own personalized email.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      disabled={bulkSending || selectedSponsors.length === 0}
                      onClick={() => void sendMany(selectedSponsors)}
                    >
                      {bulkSending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                      Approve selected &amp; send
                    </Button>
                    <Button disabled={bulkSending || sendable.length === 0} onClick={() => void sendMany(sendable)}>
                      {bulkSending ? <LoaderCircle className="size-4 animate-spin" /> : null}
                      Approve all &amp; send
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        ) : null}

        <section className="mx-auto mt-20 max-w-3xl border-t border-border pt-12 text-center" aria-labelledby="aws-heading">
          <p className="eyebrow">Architecture</p>
          <h2 id="aws-heading" className="mt-2 text-xl font-bold text-foreground">Built on AWS</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Sponsor Agent uses Amazon Bedrock for grounded sponsor research, AWS Lambda for backend orchestration, Amazon API Gateway for secure API access, and AWS Amplify for hosting.
          </p>
          <ol className="mx-auto mt-7 grid max-w-xs justify-items-center gap-1 text-sm font-semibold text-foreground" aria-label="AWS architecture flow">
            {[
              "Frontend",
              "API Gateway",
              "Lambda",
              "Amazon Bedrock",
              "Live sponsor research",
            ].map((item, index, items) => (
              <li key={item} className="grid justify-items-center gap-1">
                <span>{item}</span>
                {index < items.length - 1 ? <span aria-hidden="true" className="text-muted-foreground">↓</span> : null}
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Sponsor Agent · Made by Team Doppenheimer 💜</p>
      </footer>
    </>
  );
}
