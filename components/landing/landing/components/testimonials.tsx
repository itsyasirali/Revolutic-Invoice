import * as React from "react"
import Container from "@/components/layout/container"
import { Quote } from "lucide-react"
import testimonialData from "@/data/landing/testimonialData"

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Loved by fast-growing businesses
          </h2>
          <p className="text-lg text-slate-600">
            Don&apos;t just take our word for it. See what our customers have to say about InvoiceSmarty.
          </p>
        </div>

        {/* Cards stretch to the same height; on hover a blue fill grows from the centre towards both sides */}
        <div className="flex flex-col gap-6 md:flex-row">
          {testimonialData.map((review) => (
            <figure
              key={review.name}
              className="group relative flex min-w-0 flex-col overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-colors duration-500 hover:border-primary md:flex-1"
            >
              <span className="pointer-events-none absolute inset-0 origin-center scale-x-0 bg-primary transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <Quote className="relative mb-3 h-10 w-10 fill-current text-primary transition-colors duration-500 group-hover:text-white" />
              <p className="relative mb-4 text-xl font-bold uppercase tracking-wide text-primary transition-colors duration-500 group-hover:text-white">
                Client Testimonial
              </p>
              <blockquote className="relative flex-1 text-base leading-relaxed text-slate-600 transition-colors duration-500 group-hover:text-white">
                &quot;{review.content}&quot;
              </blockquote>
              <figcaption className="relative mt-6 border-t border-slate-100 pt-5 transition-colors duration-500 group-hover:border-white/25">
                <span className="leading-tight">
                  <span className="block font-bold text-slate-900 transition-colors duration-500 group-hover:text-white">{review.name}</span>
                  <span className="text-sm text-slate-400 transition-colors duration-500 group-hover:text-white/80">{review.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Testimonials
