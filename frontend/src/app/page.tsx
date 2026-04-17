import Hero from '@/components/landing/Hero';
import ProblemStatement from '@/components/landing/ProblemStatement';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureModules from '@/components/landing/FeatureModules';
import MembershipPreview from '@/components/landing/MembershipPreview';
import ImpactStats from '@/components/landing/ImpactStats';
import CTASection from '@/components/landing/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <FeatureModules />
      <MembershipPreview />
      <ImpactStats />
      <CTASection />
    </>
  );
}
