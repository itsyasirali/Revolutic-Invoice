import Container from "@/components/layout/container";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { LEGAL_UPDATED, type LegalSection } from "@/data/legal";

type Props = {
  badge: string;
  title: string;
  highlight: string;
  intro: string;
  sections: LegalSection[];
};

/** Shared layout for the Terms & Conditions and Privacy Policy pages. */
const LegalPage = ({ badge, title, highlight, intro, sections }: Props) => (
  <MarketingLayout>
    <section className="border-b border-slate-100 bg-white pb-12 pt-24 md:pt-32">
      <Container className="text-center">
        <span className="mb-6 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
          {badge}
        </span>
        <h1 className="mx-auto max-w-5xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
          {title} <span className="text-primary">{highlight}</span>
        </h1>
        <p className="mx-auto mt-8 max-w-3xl text-lg font-semibold leading-relaxed text-slate-600 md:text-xl">{intro}</p>
        <p className="mt-4 text-sm text-slate-500">Last updated: {LEGAL_UPDATED}</p>
      </Container>
    </section>

    <section className="py-12 md:py-16">
      <Container>
        <article className="w-full">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 py-6 first:pt-0">
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{s.title}</h2>
              {s.paragraphs?.map((p) => (
                <p key={p} className="mb-4 text-base leading-relaxed text-slate-600 md:text-lg">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="mb-4 list-disc space-y-3 pl-6 text-base text-slate-600 marker:text-primary md:text-lg">
                  {s.bullets.map((b) => (
                    <li key={b} className="leading-relaxed">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </Container>
    </section>
  </MarketingLayout>
);

export default LegalPage;
