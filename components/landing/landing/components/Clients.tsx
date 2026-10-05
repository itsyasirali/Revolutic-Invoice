import Container from "@/components/layout/container";

/** Client logos in public/clients (numbered files; 12 is not in the folder). */
const clientLogos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16]
  .map((n) => `/clients/${n}.svg`)
  .concat("/clients/17.png");

const Clients = () => {
  const logos = [...clientLogos, ...clientLogos];

  return (
    <section className="overflow-hidden py-10 md:py-12">
      <Container>
        <div className="flex items-center gap-8">
          <p className="shrink-0 border-r border-slate-300/70 pr-8 text-lg font-semibold leading-snug md:text-2xl text-indigo-900">
            Trusted By
            <br />
            Innovative Brands
          </p>

          <div className="relative flex min-w-0 flex-1 overflow-hidden">
            <div className="flex min-w-max animate-marquee items-center gap-16">
              {logos.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${src}-${index}`}
                  src={src}
                  alt=""
                  loading="lazy"
                  className="h-12 w-auto max-w-[11rem] md:h-16 object-contain"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Clients;
