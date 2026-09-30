import Hero from '../sections/Hero';
import Stats from '../sections/Stats';
import About from '../sections/About';
import WhyWebsite from '../sections/WhyWebsite';
import Services from '../sections/Services';
import Work from '../sections/Work';
import Pricing from '../sections/Pricing';
import Payment from '../sections/Payment';
import WhatYouGet from '../sections/WhatYouGet';
import Process from '../sections/Process';
import Ownership from '../sections/Ownership';
import WhyUs from '../sections/WhyUs';
import TechStack from '../sections/TechStack';
import CtaBanner from '../sections/CtaBanner';
import Faq from '../sections/Faq';
import CustomRequirements from '../sections/CustomRequirements';
import Contact from '../sections/Contact';

// Visitor journey: who we are → why a website → services → work → pricing →
// what you get → process → ownership → why us → FAQ → custom → contact.
export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <About />
      <WhyWebsite />
      <Services />
      <Work />
      <Pricing />
      <Payment />
      <WhatYouGet />
      <Process />
      <Ownership />
      <WhyUs />
      <TechStack />
      <CtaBanner />
      <Faq />
      <CustomRequirements />
      <Contact />
    </>
  );
}
