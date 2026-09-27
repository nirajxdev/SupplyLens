import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import DashboardPreview from '../components/landing/DashboardPreview';
import StatBar from '../components/landing/StatBar';
import BentoGrid from '../components/landing/BentoGrid';
import HowItWorks from '../components/landing/HowItWorks';
import ComparisonTable from '../components/landing/ComparisonTable';
import CTABand from '../components/landing/CTABand';
import Footer from '../components/landing/Footer';

const Landing = () => {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Navbar />
      <Hero />
      <div className="container-max" style={{ paddingBottom: 56 }}>
        <DashboardPreview />
      </div>
      <StatBar />
      <BentoGrid />
      <HowItWorks />
      <ComparisonTable />
      <CTABand />
      <Footer />
    </div>
  );
};

export default Landing;
