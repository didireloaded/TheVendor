import { useState } from 'react';
import { ArrowUpRight, MapPin, MessageCircle, Search } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: <Search size={28} />,
    title: 'Every Namibian business, one tap away',
    description: 'Discover photographers, mechanics, caterers, and more across all 14 regions.',
    accent: '#C9B6FF',
  },
  {
    icon: <MapPin size={28} />,
    title: 'Find what\'s open near you',
    description: 'Live map shows vendors who are open right now in your area.',
    accent: '#FFB199',
  },
  {
    icon: <MessageCircle size={28} />,
    title: 'WhatsApp them. Done.',
    description: 'One tap to contact, call, or request a quote — the Namibian way.',
    accent: '#6FE3C2',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide < SLIDES.length - 1) setCurrentSlide(currentSlide + 1);
    else finish();
  };

  const finish = () => {
    localStorage.setItem('tv_onboarded', 'true');
    onComplete();
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="onboarding-overlay">
      <button
        className="absolute top-6 right-6 t-label z-10"
        onClick={finish}
      >
        Skip
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 animate-fadeIn" key={currentSlide}>
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-ink-900 mb-8"
          style={{ background: slide.accent }}
        >
          {slide.icon}
        </div>
        <h2 className="t-display mb-3 max-w-sm">{slide.title}</h2>
        <p className="t-body text-ink-900/60 max-w-sm">{slide.description}</p>
      </div>

      <div className="pb-12 px-6">
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-8 bg-ink-900' : 'w-1.5 bg-ink-900/20'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          className="w-full py-4 rounded-full bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition active:scale-[0.98]"
          onClick={next}
        >
          {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          <ArrowUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
