import Nav from '@/landing/Nav'
import Hero from '@/landing/Hero'
import HowItWorks from '@/landing/HowItWorks'
import WhySemantic from '@/landing/WhySemantic'
import Features from '@/landing/Features'
import Footer from '@/landing/Footer'
import PipelineDemo from '@/PipelineDemo'

// Explanation first, interactive demo last. The pipeline visualizer is the closing
// centerpiece, framed by the README content. Fully static (offline replay, no
// backend). See LANDING-PLAN.md.
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Nav />
      <Hero />
      <HowItWorks />
      <WhySemantic />
      <Features />

      <section id="demo" className="scroll-mt-16 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-50">
              See the pipeline in action
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-slate-400">
              Now try it. Pick a search and watch every stage — query rewrite, filter
              extraction, vector search over content and taxonomy, filtering and ranking.
              Pre-recorded runs over a real travel catalog, replayed offline (no backend).
            </p>
          </div>
          <div className="h-[82vh] min-h-[620px] overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
            <PipelineDemo />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
