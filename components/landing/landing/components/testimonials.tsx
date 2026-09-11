import * as React from "react"
import Container from "@/components/layout/container"
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import { Star } from "lucide-react"
import testimonialData from "@/data/landing/testimonialData"

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            Loved by fast-growing teams
          </h2>
          <p className="text-lg text-slate-600">
            Don&apos;t just take our word for it. See what our customers have to say about AgentChat.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonialData.map((review, index) => (
            <Card key={index} className="bg-slate-50 border-none shadow-sm">
              <CardHeader>
                <div className="flex text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 italic">&quot;{review.content}&quot;</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{review.name}</h4>
                    <p className="text-sm text-slate-500">{review.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Testimonials
