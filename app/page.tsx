'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { GrowthCurveChart } from '@/components/dashboard/GrowthCurveChart';
import { SuccessGauge } from '@/components/dashboard/SuccessGauge';
import { ThresholdCards } from '@/components/dashboard/ThresholdCards';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mobileTab, setMobileTab] = useState<'calculator' | 'dashboard'>('calculator');
  const shouldReduceMotion = useReducedMotion();

  const fadeInUp = {
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 40, filter: shouldReduceMotion ? 'blur(0px)' : 'blur(10px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 1.2, ease: [0.32, 0.72, 0, 1] }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  return (
    <main className="flex flex-col w-full max-w-7xl mx-auto px-4 pb-24 gap-12 lg:gap-24 pt-8 lg:pt-16">
      
      {/* Header section */}
      <motion.header 
        className="flex flex-col gap-4 w-full"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1] }}
      >
        <span className="rounded-full bg-foreground/5 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium text-foreground w-max ring-1 ring-foreground/10">
          Probability Engine v1.0
        </span>
        <h1 className="font-display font-bold tracking-tight text-foreground leading-[1.1] text-4xl md:text-5xl lg:text-7xl max-w-4xl">
          Precision analytics<br/>for your next pull.
        </h1>
        <p className="font-sans text-foreground/50 max-w-xl mt-2 text-base md:text-lg lg:text-xl">
          Eliminate guesswork. Input your parameters and visualize your exact success rate before you spend.
        </p>
      </motion.header>

      {/* Mobile Segmented Control */}
      <div className="lg:hidden flex items-center justify-center p-1 bg-foreground/5 rounded-full ring-1 ring-foreground/10 w-full max-w-sm mx-auto mb-4 transition-colors duration-700 ease-awwwards">
        <button
          onClick={() => setMobileTab('calculator')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300",
            mobileTab === 'calculator' ? "bg-surface shadow-core text-foreground" : "text-foreground/60 hover:text-foreground"
          )}
        >
          Calculator
        </button>
        <button
          onClick={() => setMobileTab('dashboard')}
          className={cn(
            "flex-1 py-2 text-sm font-medium rounded-full transition-all duration-300",
            mobileTab === 'dashboard' ? "bg-surface shadow-core text-foreground" : "text-foreground/60 hover:text-foreground"
          )}
        >
          Results
        </button>
      </div>

      {/* Main Layout */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        
        {/* Left Column: Calculator */}
        <motion.section variants={fadeInUp} className={cn("lg:col-span-4 w-full", mobileTab === 'calculator' ? 'block' : 'hidden lg:block')}>
          <Card className="sticky top-24">
            <CalculatorForm onSimulate={() => {
              if (window.innerWidth < 1024) {
                setMobileTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} />
          </Card>
        </motion.section>

        {/* Right Column: Dashboard */}
        <motion.section variants={fadeInUp} className={cn("lg:col-span-8 flex-col gap-12 w-full", mobileTab === 'dashboard' ? 'flex' : 'hidden lg:flex')}>
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1 w-full">
              <GrowthCurveChart />
            </div>
            <div className="w-full md:w-auto">
              <SuccessGauge percentage={42.1} />
            </div>
          </div>
          
          <ThresholdCards />
        </motion.section>
      </motion.div>
    </main>
  );
}