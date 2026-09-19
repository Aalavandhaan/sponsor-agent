const API_BASE_URL = "https://zr5883qysl.execute-api.us-east-1.amazonaws.com";

export type EventBrief = {
  eventName: string;
  city: string;
  footfall: string;
  audience: string;
  category: string;
  sponsorshipNeeded: string;
};

export type ResearchSource = {
  title: string;
  url: string;
  domain: string;
};

export type SponsorCandidate = {
  company: string;
  whyRelevant: string;
  pastEvents: string[];
  evidenceUrls: string[];
  confidence: string;
};

export type AnalysisResult = {
  candidates: SponsorCandidate[];
  sources: ResearchSource[];
};

export type ContactResearch = {
  company: string;
  personFound: boolean;
  emailFound: boolean;
  emailReady: boolean;
  recommendedRole: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  whyThisContact: string;
  verification: string;
  evidenceUrls: string[];
  draftSubject: string;
  draftEmail: string;
  sources: ResearchSource[];
};

/** A candidate that passed email verification and can be contacted. */
export type VerifiedSponsor = SponsorCandidate & { contact: ContactResearch };

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const audienceField = (brief: EventBrief) =>
  `Expected footfall: ${brief.footfall}. Audience: ${brief.audience}`;

const categoryField = (brief: EventBrief) =>
  `${brief.category}. Sponsorship needed: ${brief.sponsorshipNeeded}`;

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Could not reach the Sponsor Agent backend. Check your internet connection and try again.",
    );
  }
  if (!response.ok) {
    throw new Error(`The backend returned an error (HTTP ${response.status}). Please try again.`);
  }
  return (await response.json()) as T;
}

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export async function analyzeEvent(
  brief: EventBrief,
  options: { candidateCount?: number; excludeCompanies?: string[] } = {},
): Promise<AnalysisResult> {
  const data = await post<{
    candidates?: Array<{
      company?: string;
      why_relevant?: string;
      past_events?: string[];
      evidence_urls?: string[];
      confidence?: string;
    }>;
    sources?: ResearchSource[];
  }>("/analyze", {
    event_name: brief.eventName,
    location: brief.city,
    audience: audienceField(brief),
    category: categoryField(brief),
    candidate_count: options.candidateCount ?? 10,
    exclude_companies: options.excludeCompanies ?? [],
  });

  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  return {
    candidates: candidates
      .map((item) => ({
        company: item.company ?? "",
        whyRelevant: item.why_relevant ?? "",
        pastEvents: toStringArray(item.past_events),
        evidenceUrls: toStringArray(item.evidence_urls),
        confidence: item.confidence ?? "",
      }))
      .filter((item) => item.company.trim().length > 0),
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}

export async function researchContact(
  company: string,
  brief: EventBrief,
): Promise<ContactResearch> {
  const data = await post<{
    company?: string;
    person_found?: boolean;
    email_found?: boolean;
    email_ready?: boolean;
    recommended_role?: string;
    contact_name?: string;
    contact_title?: string;
    contact_email?: string;
    why_this_contact?: string;
    verification?: string;
    evidence_urls?: string[];
    draft_subject?: string;
    draft_email?: string;
    sources?: ResearchSource[];
  }>("/find-contact", {
    company,
    event_name: brief.eventName,
    location: brief.city,
    audience: audienceField(brief),
    category: categoryField(brief),
  });
  return {
    company: data.company || company,
    personFound: data.person_found === true,
    emailFound: data.email_found === true,
    emailReady: data.email_ready === true,
    recommendedRole: data.recommended_role ?? "",
    contactName: data.contact_name ?? "",
    contactTitle: data.contact_title ?? "",
    contactEmail: (data.contact_email ?? "").trim(),
    whyThisContact: data.why_this_contact ?? "",
    verification: data.verification ?? "",
    evidenceUrls: toStringArray(data.evidence_urls),
    draftSubject: data.draft_subject ?? "",
    draftEmail: data.draft_email ?? "",
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}

export type DiscoveryProgress = {
  phase: "analyzing" | "discovering" | "verifying" | "expanding" | "preparing";
  message: string;
  verifiedCount: number;
  checkedCount: number;
};

const TARGET_VERIFIED = 5;
const MAX_CANDIDATES_CHECKED = 20;
const CONCURRENCY = 3;

/**
 * Discovers sponsors and keeps only those whose contact research is email-ready.
 * Rejected candidates are silently discarded and never surfaced to the user.
 */
export async function discoverSponsors(
  brief: EventBrief,
  onProgress: (progress: DiscoveryProgress) => void,
): Promise<VerifiedSponsor[]> {
  const verified: VerifiedSponsor[] = [];
  const checked: string[] = [];
  let firstRound = true;

  const report = (phase: DiscoveryProgress["phase"], message: string) =>
    onProgress({ phase, message, verifiedCount: verified.length, checkedCount: checked.length });

  while (verified.length < TARGET_VERIFIED && checked.length < MAX_CANDIDATES_CHECKED) {
    report(firstRound ? "analyzing" : "expanding", firstRound
      ? "Researching similar events..."
      : "Searching for additional prospects...");

    let analysis: AnalysisResult;
    try {
      analysis = await analyzeEvent(brief, {
        candidateCount: 10,
        excludeCompanies: [...checked],
      });
    } catch (error) {
      if (verified.length > 0) break;
      throw error;
    }

    const queue = analysis.candidates.filter(
      (candidate) =>
        !checked.some((name) => name.toLowerCase() === candidate.company.toLowerCase()),
    );
    if (queue.length === 0) break;

    report("discovering", `${queue.length} potential sponsors discovered`);
    report("verifying", "Verifying outreach contacts...");

    for (let index = 0; index < queue.length; index += CONCURRENCY) {
      if (verified.length >= TARGET_VERIFIED || checked.length >= MAX_CANDIDATES_CHECKED) break;

      const batch = queue
        .slice(index, index + CONCURRENCY)
        .slice(0, Math.max(0, MAX_CANDIDATES_CHECKED - checked.length));

      batch.forEach((candidate) => checked.push(candidate.company));

      const results = await Promise.all(
        batch.map(async (candidate) => {
          try {
            return { candidate, contact: await researchContact(candidate.company, brief) };
          } catch {
            return { candidate, contact: null };
          }
        }),
      );

      for (const { candidate, contact } of results) {
        if (!contact || !contact.emailReady || !isEmail(contact.contactEmail)) continue;
        if (verified.length >= TARGET_VERIFIED) break;
        verified.push({ ...candidate, contact });
      }

      report(
        "verifying",
        verified.length === 1
          ? "1 verified sponsor found"
          : `${verified.length} verified sponsors found`,
      );
    }

    firstRound = false;
  }

  report("preparing", "Preparing personalized emails...");
  return verified;
}
