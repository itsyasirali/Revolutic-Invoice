import * as React from "react"
import Container from "@/components/layout/container"
import Button from "@/components/ui/Button";
import Link from "next/link"

import steps from "@/data/landing/howitwork"

const HowItWorks = () => {

  return (
    <section id="how-it-works" className="py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-6">
              How it works
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Skip the complex AI training. We&apos;ve simplified the process so you can deploy an intelligent conversational agent in minutes.
            </p>
            
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10">
              <Button asChild>
                <Link href="/auth">Start your 14-day free trial</Link>
              </Button>
            </div>
          </div>
          
          <div className="relative w-full max-w-[500px] mx-auto lg:ml-auto mt-10 lg:mt-0">
            {/* Tilted Background Plate */}
            <div className="absolute top-2 -right-6 bottom-[-2rem] left-6 bg-[#e0f8f8] rounded-[2rem] transform rotate-3"></div>
            
            {/* Main White Card */}
            <div className="relative bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100 p-8 sm:p-10 flex flex-col justify-center">
               
               {/* Header / Title */}
               <div className="mb-8 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                     <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Status</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Deployment Sequence</h3>
               </div>

               {/* Checklist */}
               <div className="flex-1 relative mt-2">
                  {/* Vertical line connecting steps */}
                  <div className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-slate-100 -z-10"></div>
                  
                  <div className="space-y-8 relative">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 bg-white relative z-10">
                     <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white ring-1 ring-primary/20">
                        <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                        <div className="text-sm font-semibold text-slate-800">Connecting WhatsApp API</div>
                        <div className="text-xs font-medium text-primary mt-0.5 flex items-center gap-1.5">
                           Linked to +1 (555) 0198
                        </div>
                     </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4 bg-white relative z-10">
                     <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white ring-1 ring-primary/20">
                        <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                        <div className="text-sm font-semibold text-slate-800">Ingesting knowledge base</div>
                        <div className="flex flex-col gap-2 mt-2.5">
                           <div className="flex items-center gap-2 text-xs">
                              <span className="bg-slate-50 text-slate-600 font-medium px-2 py-1 rounded border border-slate-200">yourwebsite.com</span>
                              <span className="text-slate-400">142 pages</span>
                           </div>
                           <div className="flex items-center gap-2 text-xs">
                              <span className="bg-slate-50 text-slate-600 font-medium px-2 py-1 rounded border border-slate-200">product_catalog.pdf</span>
                              <span className="text-slate-400">24 pages</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 bg-white relative z-10">
                     <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white ring-1 ring-primary/20">
                        <svg className="h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                     </div>
                     <div>
                        <div className="text-sm font-semibold text-slate-800">Training neural engine</div>
                        <div className="text-xs font-medium text-primary mt-0.5">Bypassed — Zero-shot enabled</div>
                     </div>
                  </div>

                  </div>
               </div>

               {/* Footer / Go Live */}
               <div className="mt-8 bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-center gap-3">
                  <div className="relative flex h-3 w-3">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                  </div>
                  <span className="text-sm font-bold text-primary">Agent is Live & Routing</span>
               </div>
               
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default HowItWorks
