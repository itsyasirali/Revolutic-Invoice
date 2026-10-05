import Container from "@/components/layout/container";
import MarketingLayout from "@/components/landing/MarketingLayout";
import { LEGAL_UPDATED, type LegalSection } from "@/data/legal";

type Props = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

/** Shared layout for the Terms & Conditions and Privacy Policy pages. */
const LegalPage = ({ title, intro, sections }: Props) => (
  <MarketingLayout>
    <section className="border-b border-slate-100 bg-slate-50 pb-12 pt-16 md:pt-20">
      <Container>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-primary">Legal</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">{intro}</p>
        <p className="mt-4 text-sm text-slate-500">Last updated: {LEGAL_UPDATED}</p>
      </Container>
    </section>

    <section className="py-12 md:py-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
              <ul className="space-y-2 border-l border-slate-200 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="-ml-px block border-l border-transparent py-0.5 pl-4 text-slate-600 hover:border-primary hover:text-primary"
                    >
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <article className="max-w-3xl">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 border-b border-slate-100 py-8 first:pt-0 last:border-b-0">
                <h2 className="mb-4 text-xl font-bold text-slate-900">{s.title}</h2>
                {s.paragraphs?.map((p) => (
                  <p key={p} className="mb-3 leading-relaxed text-slate-600">
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="list-disc space-y-2 pl-5 text-slate-600 marker:text-primary">
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
        </div>
      </Container>
    </section>
  </MarketingLayout>
);

export default LegalPage;
