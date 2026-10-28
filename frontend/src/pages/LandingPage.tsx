import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  Shield,
  Bell,
  Gauge,
  LineChart,
  Lock,
  ArrowRight,
  Compass,
  CheckCircle2,
  Cpu,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { SiteNavigation } from '../components/navigation/SiteNavigation';
import { Footer } from '../components/navigation/Footer';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { SecondaryButton } from '../components/common/SecondaryButton';
import { SectionHeading } from '../components/common/SectionHeading';
import { EditorialCard } from '../components/common/EditorialCard';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ivory text-ink selection:bg-gold/20 selection:text-forest-dark overflow-x-hidden">
      {/* Navigation Header */}
      <SiteNavigation />

      {/* SECTION 2: HERO COMPOSITION */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6 md:px-12 overflow-hidden border-b border-gold/20">
        {/* Subtle Heritage Motoring Backdrop Grid */}
        <div className="absolute inset-0 paper-subtle opacity-70 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Editorial Text Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-gold/40 bg-gold/10 text-forest font-semibold text-[11px] eyebrow">
                <Compass className="w-3.5 h-3.5 text-gold-dark" />
                <span>INTELLIGENT DRIVER SAFETY</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-ink leading-[1.12]">
                Stay Alert. <br />
                <span className="italic font-normal text-forest">Arrive Assured.</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-ink-muted max-w-xl leading-relaxed font-sans font-normal">
                An intelligent driver-monitoring experience designed to recognize observable signs of drowsiness through real-time facial landmark analysis, helping make every journey safer.
              </p>

              {/* Call to Action Deck */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <PrimaryButton
                  size="lg"
                  variant="forest"
                  onClick={() => navigate('/app/monitor')}
                  icon={<ArrowRight className="w-4 h-4 text-gold" />}
                >
                  Enter the Monitoring Studio
                </PrimaryButton>

                <SecondaryButton
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById('technology');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Explore the Technology
                </SecondaryButton>
              </div>

              {/* Verified Technical Annotation */}
              <div className="pt-6 border-t border-gold/20 flex flex-wrap items-center gap-6 text-xs text-ink-muted font-sans">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>MediaPipe Facial Landmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Real-Time EAR Calculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-forest" />
                  <span>Zero Cloud Video Transmission</span>
                </div>
              </div>
            </div>

            {/* Right Automotive Editorial Instrument Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md p-6 rounded bg-forest-dark text-ivory border-2 border-gold/40 shadow-luxury">
                {/* Vintage Instrument Bezel Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gold/20 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="eyebrow text-gold text-[10px] tracking-widest">
                      CHRONO TELEMETRY &bull; MK-I
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-parchment/60">
                    640&times;480 @ 10 FPS
                  </span>
                </div>

                {/* Simulated Reticle Instrument Visual */}
                <div className="relative aspect-[4/3] rounded bg-charcoal border border-gold/30 p-4 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-forest/10 to-transparent pointer-events-none" />

                  {/* Top Status */}
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-600/50 text-[10px] font-mono uppercase">
                      STATUS: VIGILANT
                    </span>
                    <span className="text-[10px] font-mono text-gold">
                      EAR: 0.284
                    </span>
                  </div>

                  {/* Centered Golden Eye Reticle Graphic */}
                  <div className="my-auto text-center relative z-10">
                    <div className="w-24 h-24 mx-auto rounded-full border border-dashed border-gold/40 flex items-center justify-center p-2 relative">
                      <div className="w-16 h-16 rounded-full border border-gold/60 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-gold animate-pulse" />
                      </div>
                      {/* Compass Crosshair Lines */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-0.5 bg-gold" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-0.5 bg-gold" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-0.5 h-2 bg-gold" />
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0.5 h-2 bg-gold" />
                    </div>
                    <span className="text-[11px] font-serif text-parchment/70 italic mt-2 block">
                      Active Palpebral Monitoring
                    </span>
                  </div>

                  {/* Bottom Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gold/20 text-center font-mono text-[10px] z-10">
                    <div>
                      <span className="text-parchment/40 block text-[9px]">L-EAR</span>
                      <span className="text-gold font-semibold">0.281</span>
                    </div>
                    <div>
                      <span className="text-parchment/40 block text-[9px]">R-EAR</span>
                      <span className="text-gold font-semibold">0.287</span>
                    </div>
                    <div>
                      <span className="text-parchment/40 block text-[9px]">CLOSURE</span>
                      <span className="text-ivory font-semibold">0 ms</span>
                    </div>
                  </div>
                </div>

                {/* Instrument Caption */}
                <p className="mt-4 text-[11px] text-parchment/60 leading-normal font-sans italic text-center">
                  Handcrafted digital telemetry inspired by heritage motoring instrumentation and high-precision horology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUST / PRINCIPLES STRIP */}
      <section className="py-12 bg-parchment/50 border-b border-gold/25">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-forest text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-forest-dark mb-1">
                  Real-Time Observation
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Continuous optical landmark telemetry assessing eye closure and temporal blinking rates with high mathematical fidelity.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-forest text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-forest-dark mb-1">
                  Thoughtful Warnings
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Carefully choreographed acoustic chimes and visual notices designed to prompt driver attention without dangerous distraction.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-forest text-gold flex items-center justify-center shrink-0 border border-gold/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-forest-dark mb-1">
                  Privacy-Conscious Design
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Camera frames are analyzed in-session for telemetry. Raw video recordings are never harvested or transmitted to external advertising networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THE PURPOSE */}
      <section id="purpose" className="py-24 px-6 md:px-12 border-b border-gold/20">
        <div className="max-w-5xl mx-auto">
          <SectionHeading
            eyebrow="THE IMPERATIVE"
            title="Fatigue Is An Unseen Passenger."
            description="Driver drowsiness degrades cognitive reaction times, impairs peripheral vigilance, and accounts for thousands of preventable roadway occurrences each year."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mt-12">
            <div className="space-y-4 text-base text-ink-muted leading-relaxed">
              <p>
                Prolonged driving across highway corridors, late-night transit, and monotonous commutes often induce micro-sleep episodes—fleeting moments where eyelids remain closed for seconds at a time without full driver awareness.
              </p>
              <p>
                DriveSafe AI establishes a vigilant companion system. By applying canonical geometric metrics—the Eye Aspect Ratio (EAR)—the system detects when eyelid closure crosses safe temporal thresholds, delivering immediate sensory alerts before hazardous loss of control can occur.
              </p>
              <div className="p-4 rounded bg-parchment/60 border-l-4 border-gold text-xs text-forest-dark font-sans leading-normal">
                <strong>Assistive Technology Notice:</strong> DriveSafe AI is an analytical monitoring aid and does not replace adequate restorative rest, planned travel breaks, or safe personal driving decisions.
              </div>
            </div>

            <div className="p-8 rounded bg-parchment/30 border border-gold/30 space-y-6">
              <h3 className="font-serif text-xl font-medium text-forest-dark">
                Observable Warning Indicators
              </h3>
              <ul className="space-y-4 text-sm text-ink font-sans">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest text-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    01
                  </span>
                  <div>
                    <strong className="block text-forest-dark">Prolonged Eyelid Closure</strong>
                    <span className="text-ink-muted text-xs">
                      Eye closure sustained beyond 1.5 seconds indicates potential micro-sleep.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest text-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    02
                  </span>
                  <div>
                    <strong className="block text-forest-dark">Repetitive Yawning Frequency</strong>
                    <span className="text-ink-muted text-xs">
                      Elevated Mouth Aspect Ratio (MAR) sustained across multiple instances.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-forest text-gold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    03
                  </span>
                  <div>
                    <strong className="block text-forest-dark">Gaze Deviations & Head Droop</strong>
                    <span className="text-ink-muted text-xs">
                      Observable departures from forward road orientation.
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURE SHOWCASE */}
      <section id="features" className="py-24 px-6 md:px-12 bg-parchment/20 border-b border-gold/20">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            eyebrow="TECHNICAL EXCELLENCE"
            title="Engineered For Discriminating Motoring"
            description="Six core capabilities crafted with architectural precision, mathematical rigor, and restrained elegance."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <EditorialCard
              number="01"
              title="Eye Closure Monitoring"
              description="Continuous computation of the 6-point Eye Aspect Ratio (EAR) based on Soukupová & Čech algorithms, distinguishing instantaneous blinks from perilous prolonged closures."
              icon={<Eye className="w-5 h-5 text-gold" />}
              tag="COMPUTER VISION"
            />
            <EditorialCard
              number="02"
              title="Possible Yawning Detection"
              description="Mouth Aspect Ratio (MAR) telemetry detecting sustained open-mouth profiles exceeding temporal thresholds to identify potential respiratory fatigue signs."
              icon={<Gauge className="w-5 h-5 text-gold" />}
              tag="FATIGUE TELEMETRY"
            />
            <EditorialCard
              number="03"
              title="Intelligent Audio Alerts"
              description="Harmonic acoustic chimes and pulse alarms synthesized directly via Web Audio API with strict cooldown logic to prevent continuous jarring noise."
              icon={<Bell className="w-5 h-5 text-gold" />}
              tag="ACOUSTIC WARNINGS"
            />
            <EditorialCard
              number="04"
              title="Live Monitoring Studio"
              description="A dark luxury cockpit displaying real-time video, palpebral aperture gauges, closure chronometers, and immediate semantic status pills."
              icon={<Gauge className="w-5 h-5 text-gold" />}
              tag="INSTRUMENTATION"
            />
            <EditorialCard
              number="05"
              title="Session Insights & Logs"
              description="Chronological archives detailing session durations, qualifying event tallies, and fatigue distributions over travel intervals."
              icon={<LineChart className="w-5 h-5 text-gold" />}
              tag="DATA ARCHIVAL"
            />
            <EditorialCard
              number="06"
              title="Privacy-Conscious Processing"
              description="Strict ephemeral frame processing. Telemetry is computed in real-time without writing raw facial video to cloud storage."
              icon={<Shield className="w-5 h-5 text-gold" />}
              tag="SECURITY & PRIVACY"
            />
          </div>
        </div>
      </section>

      {/* SECTION 6: HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 border-b border-gold/20">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="METHODOLOGY"
            title="The Three-Phase Vigilance Cycle"
            description="A clean, deterministic pipeline from optical capture to calibrated driver notification."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-8 rounded bg-ivory border border-gold/30 space-y-4">
              <span className="font-serif text-3xl font-normal text-gold italic">01 &mdash;</span>
              <h3 className="font-serif text-2xl font-medium text-forest-dark">Observe</h3>
              <p className="text-sm text-ink-muted leading-relaxed font-sans">
                Upon explicit user initiation, the browser camera captures video frames at a calibrated 10 FPS rate, maintaining an optimized resolution for minimal processing latency.
              </p>
            </div>

            <div className="p-8 rounded bg-ivory border border-gold/30 space-y-4">
              <span className="font-serif text-3xl font-normal text-gold italic">02 &mdash;</span>
              <h3 className="font-serif text-2xl font-medium text-forest-dark">Analyze</h3>
              <p className="text-sm text-ink-muted leading-relaxed font-sans">
                The Python engine detects facial landmarks using MediaPipe, extracts Euclidean eyelid distances, computes the Eye Aspect Ratio, and tracks temporal duration against configured thresholds.
              </p>
            </div>

            <div className="p-8 rounded bg-ivory border border-gold/30 space-y-4">
              <span className="font-serif text-3xl font-normal text-gold italic">03 &mdash;</span>
              <h3 className="font-serif text-2xl font-medium text-forest-dark">Alert</h3>
              <p className="text-sm text-ink-muted leading-relaxed font-sans">
                When closure duration exceeds 1.5 seconds, the cockpit flashes high-contrast visual warnings and triggers an urgent auditory pulse to prompt swift driver reorientation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TECHNOLOGY */}
      <section id="technology" className="py-24 px-6 md:px-12 bg-charcoal text-ivory border-b border-gold/25">
        <div className="max-w-6xl mx-auto">
          <SectionHeading
            eyebrow="SYSTEM ARCHITECTURE"
            title="Built Upon Proven Technologies"
            description="An uncompromising full-stack implementation engineered for stability, performance, and analytical veracity."
            variant="dark"
          />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12 text-center">
            <div className="p-6 rounded bg-charcoal-elevated border border-gold/20 flex flex-col items-center justify-center space-y-3">
              <Cpu className="w-8 h-8 text-gold" />
              <span className="font-serif text-lg font-medium text-ivory">React & TS</span>
              <span className="text-[11px] text-parchment/50 font-sans">Strictly Typed Frontend</span>
            </div>

            <div className="p-6 rounded bg-charcoal-elevated border border-gold/20 flex flex-col items-center justify-center space-y-3">
              <Layers className="w-8 h-8 text-gold" />
              <span className="font-serif text-lg font-medium text-ivory">FastAPI</span>
              <span className="text-[11px] text-parchment/50 font-sans">Python Async Server</span>
            </div>

            <div className="p-6 rounded bg-charcoal-elevated border border-gold/20 flex flex-col items-center justify-center space-y-3">
              <Eye className="w-8 h-8 text-gold" />
              <span className="font-serif text-lg font-medium text-ivory">MediaPipe</span>
              <span className="text-[11px] text-parchment/50 font-sans">478-Point FaceMesh</span>
            </div>

            <div className="p-6 rounded bg-charcoal-elevated border border-gold/20 flex flex-col items-center justify-center space-y-3">
              <Gauge className="w-8 h-8 text-gold" />
              <span className="font-serif text-lg font-medium text-ivory">OpenCV</span>
              <span className="text-[11px] text-parchment/50 font-sans">Frame Preprocessing</span>
            </div>

            <div className="p-6 rounded bg-charcoal-elevated border border-gold/20 flex flex-col items-center justify-center space-y-3 col-span-2 md:col-span-1">
              <Lock className="w-8 h-8 text-gold" />
              <span className="font-serif text-lg font-medium text-ivory">Firebase</span>
              <span className="text-[11px] text-parchment/50 font-sans">Auth & Firestore</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: FINAL CALL TO ACTION */}
      <section className="py-24 px-6 md:px-12 bg-ivory text-center relative">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="eyebrow text-forest text-xs tracking-widest block">
            THE JOURNEY AHEAD
          </span>

          <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight text-ink leading-tight">
            Attention is a journey. <br />
            <span className="text-forest italic font-normal">Safety is the destination.</span>
          </h2>

          <p className="text-base md:text-lg text-ink-muted max-w-xl mx-auto font-sans leading-relaxed">
            Experience the confluence of vintage motoring prestige and intelligent biometric vigilance.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton
              size="lg"
              variant="forest"
              onClick={() => navigate('/app/monitor')}
              icon={<ArrowRight className="w-4 h-4 text-gold" />}
            >
              Open DriveSafe AI
            </PrimaryButton>

            <Link
              to="/login"
              className="px-6 py-3 text-sm font-medium text-forest-dark hover:text-gold transition-colors"
            >
              Sign In to Your Studio Account &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
