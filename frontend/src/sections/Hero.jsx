import SplitText from '../components/SplitText';
import Button from '../components/Button';
import TeamPrism from '../components/TeamPrism';
import { team } from '../data/team';
import { scrollToId } from '../utils/scroll';
import { useEnquiry } from '../context/EnquiryContext';

const industries = ['Cafés', 'Restaurants', 'Gyms', 'Salons', 'Interior studios', 'Personal brands', 'Local businesses', 'Service businesses', 'Creators', 'Growing brands'];

export default function Hero() {
  const { startProject } = useEnquiry();
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-paper" aria-labelledby="hero-title">
      <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_40%,#000_10%,transparent_70%)]" aria-hidden="true" />
      <div className="container-site relative grid items-center gap-14 pb-16 pt-28 md:pt-36 lg:grid-cols-[1.25fr_1fr] lg:gap-10 lg:pb-20 lg:pt-36">
        <div>
          <p className="load-in label flex items-center gap-3 text-mist" style={{ '--d': '100ms' }}>
            <span className="h-px w-8 bg-mist/60" aria-hidden="true" />
            Frontend + backend web development
          </p>
          <SplitText
            as="h1"
            text="We build websites that *build businesses.*"
            className="mt-7 text-[clamp(2.75rem,7.6vw,6rem)] font-semibold leading-[.95] tracking-[-0.045em]"
            emClass="text-mist"
            baseDelay={150}
          />
          <p className="load-in mt-8 max-w-xl text-lg leading-relaxed text-mist md:text-xl" style={{ '--d': '650ms' }}>
            Modern, responsive and professional websites designed and developed for businesses, creators and growing brands.
          </p>
          <div className="load-in mt-10 flex flex-wrap gap-3" style={{ '--d': '800ms' }}>
            <Button href="#work" variant="light" size="lg" onClick={(e) => { e.preventDefault(); scrollToId('work'); }}>View our work</Button>
            <Button as="button" type="button" variant="outlineLight" size="lg" onClick={() => startProject()}>Start a project</Button>
          </div>
          <div className="load-in mt-12 flex items-center gap-4" style={{ '--d': '950ms' }}>
            <div className="flex -space-x-3">
              {[team.irin, team.kaviya].map((p) => (
                <img key={p.id} src={p.photoSm} alt="" width="48" height="48" className="h-12 w-12 rounded-full object-cover object-top ring-2 ring-ink" />
              ))}
            </div>
            <p className="text-[15px] leading-snug text-mist">
              A two-person team.<br />
              <span className="text-paper">Irin</span> on frontend, <span className="text-paper">Kaviya</span> on backend.
            </p>
          </div>
        </div>

        <div className="load-in relative" style={{ '--d': '400ms' }}>
          <span className="float-slow label absolute -left-2 top-10 z-10 hidden rounded-full bg-sky px-3 py-1.5 text-ink xl:block" aria-hidden="true">{'{ responsive: true }'}</span>
          <span className="float-slower label absolute -right-2 top-1/2 z-10 hidden rounded-full bg-rose px-3 py-1.5 text-ink xl:block" aria-hidden="true">api · 200 OK</span>
          <TeamPrism />
        </div>
      </div>

      <div className="marquee relative border-t border-paper/10 py-5" aria-label="Industries we build for">
        <ul className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...industries, ...industries].map((t, i) => (
            <li key={i} aria-hidden={i >= industries.length} className="flex items-center gap-10 font-display text-xl text-paper/50 md:text-2xl">
              {t}<span className="h-1.5 w-1.5 rounded-full bg-paper/25" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
