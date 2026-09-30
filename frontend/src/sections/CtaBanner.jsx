import SplitText from '../components/SplitText';
import Reveal from '../components/Reveal';
import Button from '../components/Button';
import { team } from '../data/team';
import { useEnquiry } from '../context/EnquiryContext';
import { scrollToId } from '../utils/scroll';

export default function CtaBanner() {
  const { startProject } = useEnquiry();
  return (
    <section className="bg-paper py-16 md:py-24" aria-labelledby="cta-title">
      <div className="container-site">
        <div className="relative overflow-hidden rounded-[32px] bg-ink px-6 py-14 text-paper sm:px-12 md:py-20 lg:px-16">
          <div className="grid-lines pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_80%_50%,#000,transparent_70%)]" aria-hidden="true" />
          <div className="relative grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <SplitText as="h2" id="cta-title" text="Have a project *in mind?*" className="text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[.98] tracking-[-0.04em]" emClass="text-mist" />
              <Reveal as="p" delay={150} className="mt-6 max-w-lg text-lg leading-relaxed text-mist md:text-xl">Let's turn your idea into a professional website.</Reveal>
              <Reveal className="mt-10 flex flex-wrap gap-3" delay={250}>
                <Button as="button" type="button" variant="light" size="lg" onClick={() => startProject()}>Start a project</Button>
                <Button href="#work" variant="outlineLight" size="lg" onClick={(e) => { e.preventDefault(); scrollToId('work'); }}>View our work</Button>
              </Reveal>
            </div>
            <div className="relative mx-auto h-[300px] w-full max-w-[380px] sm:h-[360px]" aria-hidden="true">
              <Reveal variant="right" className="absolute left-0 top-0 w-[58%]">
                <div className="float-slow"><img src={team.irin.photo} alt="" loading="lazy" width="600" height="800" className="aspect-[3/4] w-full -rotate-6 rounded-[20px] object-cover shadow-2xl ring-1 ring-paper/10" /></div>
                <span className="label absolute -top-3 left-4 z-10 rounded-full bg-sky px-3 py-1 text-ink">Irin · Frontend</span>
              </Reveal>
              <Reveal variant="left" delay={150} className="absolute bottom-0 right-0 w-[58%]">
                <div className="float-slower"><img src={team.kaviya.photo} alt="" loading="lazy" width="600" height="800" className="aspect-[3/4] w-full rotate-6 rounded-[20px] object-cover shadow-2xl ring-1 ring-paper/10" /></div>
                <span className="label absolute -bottom-3 right-4 rounded-full bg-rose px-3 py-1 text-ink">Kaviya · Backend</span>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
