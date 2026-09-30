import Reveal from '../components/Reveal';
import Button from '../components/Button';
import { useEnquiry } from '../context/EnquiryContext';

export default function CustomRequirements() {
  const { startProject } = useEnquiry();
  return (
    <section className="bg-paper py-16 md:py-20" aria-labelledby="custom-title">
      <div className="container-site">
        <Reveal className="grid items-center gap-8 rounded-[26px] border border-ink/15 p-7 sm:p-10 lg:grid-cols-[1.5fr_auto] lg:gap-16">
          <div>
            <h2 id="custom-title" className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.03em]">Need something custom?</h2>
            <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-steel">
              Every business is different. If your requirements don't fit one of our standard packages, contact us. We'll discuss what you need and send a custom proposal based on the features, design and functionality involved.
            </p>
          </div>
          <Button as="button" type="button" size="lg" onClick={() => startProject('not-sure')} className="justify-self-start">Discuss your project</Button>
        </Reveal>
      </div>
    </section>
  );
}
