'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { PityRunway } from '@/components/dashboard/PityRunway';
import { SuccessGauge } from '@/components/dashboard/SuccessGauge';
import { ThresholdCards } from '@/components/dashboard/ThresholdCards';
import { ResultSummary } from '@/components/dashboard/ResultSummary';
import { CalculationInput } from '@/types/pity';
import { usePityCalculation } from '@/hooks/usePityCalculation';
import { PRESETS } from '@/lib/config/presets';

export default function Home() {
  // Hoisted Form State (Draft)
  const [preset, setPreset] = useState('genshin');
  const [pulls, setPulls] = useState<string | number>('90');
  const [pityOffset, setPityOffset] = useState<string | number>('0');
  const [guarantee, setGuarantee] = useState(false);
  const [targetItemName, setTargetItemName] = useState<string | undefined>(undefined);

  // Active State (Dashboard Freeze)
  const [activeInput, setActiveInput] = useState<CalculationInput>({
    baseRatePercent: 'genshin',
    pullsInput: 90,
    pityOffset: 0,
    guarantee: false,
    targetItemName: undefined
  });

  const [mobileTab, setMobileTab] = useState<'calculator' | 'dashboard'>('calculator');
  const [showModal, setShowModal] = useState(false);

  const handleCalculate = () => {
    setActiveInput({
      baseRatePercent: preset,
      pullsInput: Number(pulls) || 0,
      pityOffset: Number(pityOffset) || 0,
      guarantee: guarantee,
      targetItemName: targetItemName
    });
    setShowModal(true);
    // Switch to dashboard tab on mobile when calculated
    setMobileTab('dashboard');
  };

  const calculationResult = usePityCalculation(activeInput);
  const activePreset = PRESETS.find(p => p.id === activeInput.baseRatePercent) || PRESETS[0];
  
  const fadeInUp = {
    initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  // Safe fallback values
  const currentPercentage = calculationResult ? +(calculationResult.currentP * 100).toFixed(1) : 0;
  const thresholds = calculationResult?.thresholds;
  const maxPulls = calculationResult?.pdf ? calculationResult.pdf.length - 1 : (activePreset?.curve?.hardPity || 180);

  return (
    <main className="flex flex-col w-full min-h-[100dvh] bg-background">
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 pb-32 pt-8 md:pt-16 lg:pt-24 flex flex-col gap-10 md:gap-16 lg:gap-24">
        
        {/* Header section (hidden on mobile when in dashboard view to save space, visible on tablet+) */}
        <motion.header 
          className={`flex-col gap-4 md:gap-6 w-full items-center text-center ${mobileTab === 'dashboard' ? 'hidden md:flex' : 'flex'}`}
          initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
        >
          <span className="rounded-full bg-foreground/5 px-4 py-1.5 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium text-foreground ring-1 ring-foreground/10">
            Probability Engine v1.0
          </span>
          <h1 className="font-display font-bold tracking-tight text-foreground leading-[1.1] text-4xl md:text-5xl lg:text-7xl max-w-4xl">
            Precision analytics<br/>for your next pull.
          </h1>
          <p className="font-sans text-foreground/50 max-w-xl mt-1 md:mt-2 text-base md:text-lg lg:text-xl">
            Eliminate guesswork. Input your parameters and visualize your exact success rate before you spend.
          </p>
        </motion.header>

        {/* Main Layout (Asymmetrical Bento) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-start w-full"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          
          {/* Left Column: Calculator */}
          <motion.section 
            variants={fadeInUp} 
            className={`md:col-span-5 lg:col-span-4 w-full flex-col gap-6 md:gap-8 ${mobileTab === 'calculator' ? 'flex' : 'hidden md:flex'}`}
          >
            <div className="md:sticky md:top-24 z-10 w-full flex flex-col gap-6 md:gap-8">
              <CalculatorForm 
                preset={preset} setPreset={setPreset}
                pulls={pulls} setPulls={setPulls}
                pityOffset={pityOffset} setPityOffset={setPityOffset}
                guarantee={guarantee} setGuarantee={setGuarantee}
                targetItemName={targetItemName} setTargetItemName={setTargetItemName}
              />
              
              {/* Premium Button Island Architecture */}
              <button 
                onClick={handleCalculate}
                className="group relative w-full flex items-center justify-center gap-3 overflow-hidden rounded-full bg-foreground text-background px-6 py-4 md:px-8 md:py-5 font-display text-base md:text-lg tracking-wide shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10">Calculate Results</span>
                
                {/* Button-in-Button Trailing Icon */}
                <div className="relative z-10 flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-background/20 transition-transform duration-500 group-hover:translate-x-1 group-hover:scale-105">
                  <svg className="h-3 w-3 md:h-4 md:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </button>
            </div>
          </motion.section>

          {/* Right Column: Dashboard */}
          <motion.section 
            variants={fadeInUp} 
            className={`md:col-span-7 lg:col-span-8 flex-col gap-6 md:gap-8 lg:gap-12 w-full ${mobileTab === 'dashboard' ? 'flex' : 'hidden md:flex'}`}
          >
            <PityRunway 
              currentPull={activeInput.pullsInput + activeInput.pityOffset} 
              maxPulls={maxPulls} 
              softPityStart={activePreset.curve.softPityStart} 
              thresholds={thresholds} 
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 w-full">
              <div className="xl:col-span-5 w-full">
                <SuccessGauge percentage={currentPercentage} />
              </div>
              <div className="xl:col-span-7 w-full">
                <ThresholdCards thresholds={thresholds} />
              </div>
            </div>
          </motion.section>

        </motion.div>
      </div>

      {/* Mobile Bottom Navigation (Tabs) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-4 pt-2 px-2 bg-background/80 backdrop-blur-xl border-t border-foreground/10">
        <div className="relative flex justify-around items-center">
          <button
            onClick={() => setMobileTab('calculator')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 ${
              mobileTab === 'calculator' 
                ? 'bg-foreground/10 text-foreground scale-105' 
                : 'text-foreground/50 hover:bg-foreground/5'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16.01" y1="14" y2="14"/><line x1="16" x2="16.01" y1="18" y2="18"/><line x1="12" x2="12.01" y1="14" y2="14"/><line x1="12" x2="12.01" y1="18" y2="18"/><line x1="8" x2="8.01" y1="14" y2="14"/><line x1="8" x2="8.01" y1="18" y2="18"/></svg>
            <span className="text-[10px] font-semibold font-sans uppercase tracking-widest">Calculator</span>
          </button>
          <button
            onClick={() => setMobileTab('dashboard')}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300 ${
              mobileTab === 'dashboard' 
                ? 'bg-foreground/10 text-foreground scale-105' 
                : 'text-foreground/50 hover:bg-foreground/5'
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            <span className="text-[10px] font-semibold font-sans uppercase tracking-widest">Dashboard</span>
          </button>
        </div>
      </div>

      {/* Responsive Modal (Bottom Sheet on Mobile, Center Modal on Desktop) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-8">
            {/* Glassmorphic Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-xl transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
            />
            
            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, y: "100%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8, bounce: 0.1 }}
              className="relative w-full max-w-2xl z-10 bg-background md:bg-transparent rounded-t-[2rem] md:rounded-none max-h-[90vh] overflow-y-auto pb-8 md:pb-0 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-none"
            >
              {/* Mobile Drag Handle */}
              <div className="w-full flex justify-center pt-4 pb-2 md:hidden">
                <div className="w-12 h-1.5 bg-foreground/20 rounded-full" />
              </div>
              <div className="px-2 pb-2 md:p-0">
                <ResultSummary 
                  input={activeInput} 
                  onDismiss={() => setShowModal(false)} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}