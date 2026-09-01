import React, { useState, useEffect } from 'react';
import { Target, Code2, Users2, Trophy, Search, Settings, Skull, ArrowRight, FileText, User, Bug, Wifi } from 'lucide-react';
import { motion } from 'motion/react';
import { TriquetraInsignia } from '../components/TriquetraInsignia';
import { CyberBackground } from '../components/CyberBackground';
import { RegistrationModal } from '../components/RegistrationModal';
import { RulesModal } from '../components/RulesModal';
import { AboutModal } from '../components/AboutModal';
import { AdminLoginModal } from '../components/AdminLoginModal';
import { Department, ParticipantInfo } from '../types';
import { soundManager } from '../utils/audio';
import { participantStore } from '../utils/participantStore';

interface LandingPageProps {
  onStartRegistration: (info: ParticipantInfo) => void;
  onDirectStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartRegistration,
  onDirectStart
}) => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department>('IT');
  const [participantCount, setParticipantCount] = useState<number>(() => participantStore.getCachedParticipants().length);

  useEffect(() => {
    const handleUpdate = () => {
      setParticipantCount(participantStore.getCachedParticipants().length);
    };
    window.addEventListener('triquetra_participants_updated', handleUpdate);
    return () => {
      window.removeEventListener('triquetra_participants_updated', handleUpdate);
    };
  }, []);

  const handleOpenRegister = (dept: Department = 'IT') => {
    setSelectedDept(dept);
    setIsRegisterOpen(true);
    soundManager.playBeep(520, 'sine', 0.05);
  };

  const handleOpenRules = () => {
    setIsRulesOpen(true);
    soundManager.playBeep(480, 'sine', 0.05);
  };

  const handleOpenAbout = () => {
    setIsAboutOpen(true);
    soundManager.playBeep(440, 'sine', 0.05);
  };

  const handleOpenAdmin = () => {
    setIsAdminOpen(true);
    soundManager.playBeep(600, 'sine', 0.05);
  };

  return (
    <div className="relative min-h-screen bg-[#030713] text-white flex flex-col justify-between overflow-x-hidden font-sans selection:bg-[#00f0ff]/30 selection:text-[#c7f9ff]">
      
      {/* High-Fidelity Cyber Space, 3D Grid, Matrix Code & Circuit Background */}
      <CyberBackground />

      {/* ========================================================================= */}
      {/* TOP NAVIGATION HEADER (Matching symposium branding) */}
      {/* ========================================================================= */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
        {/* Left: Brand / Logo with Symposium Emblem */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#00f0ff]/50 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.4)] bg-[#07152e] flex-shrink-0">
            <img src="/logo.png" alt="Triquetra'26" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base tracking-wide text-white flex items-center gap-1.5 font-sans">
              <span>TRIQUETRA'26</span>
            </div>
            <div className="text-[10px] font-mono tracking-[0.2em] text-[#00f0ff] uppercase -mt-0.5 font-semibold">
              CODING &amp; DEBUGGING
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest uppercase">
          <button 
            className="text-[#00f0ff] relative py-1 cursor-pointer font-bold transition-colors"
          >
            <span>HOME</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
          </button>
          
          <button 
            onClick={handleOpenAbout}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            ABOUT
          </button>
          
          <button 
            onClick={handleOpenRules}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer py-1"
          >
            RULES
          </button>
          
          <button 
            onClick={() => handleOpenRegister('IT')}
            className="text-gray-400 hover:text-[#00f0ff] transition-colors cursor-pointer py-1"
          >
            REGISTER
          </button>
        </nav>

        {/* Right: Admin Login & Live Database Sync Status */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdmin}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] transition-all cursor-pointer"
            title="Live cloud database connected across all PCs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{participantCount} Active in Arena</span>
          </button>

          <button
            onClick={handleOpenAdmin}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#09142e]/80 hover:bg-[#0e214d] border border-[#00f0ff]/40 hover:border-[#00f0ff] text-white font-mono text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_20px_rgba(0,240,255,0.35)] cursor-pointer active:scale-95"
          >
            <User className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Admin Login</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* COLLEGE & SYMPOSIUM TOP BANNER (First page alone, matching reference) */}
      {/* ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-20 w-full max-w-5xl mx-auto px-4 pt-3 pb-4 text-center select-none"
      >
        {/* College Name */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white drop-shadow-[0_0_35px_rgba(0,240,255,0.45)] font-sans leading-tight">
          Ganadipathy Tulsi's Jain Engineering College
        </h2>

        {/* Department Sub-title */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2 text-xs sm:text-sm font-semibold tracking-wide text-gray-200">
          <span className="text-[#ff9e00] text-xs">✦</span>
          <span>
            Department of <strong className="text-[#00f0ff] font-bold">IT</strong>,{' '}
            <strong className="text-[#ff9e00] font-bold">AI&amp;DS</strong> and{' '}
            <strong className="text-[#c084fc] font-bold">CSBS</strong>
          </span>
          <span className="text-[#ff9e00] text-xs">✦</span>
        </div>

        {/* Symposium Type Sub-heading */}
        <div className="mt-2 text-xs sm:text-sm font-serif tracking-[0.25em] sm:tracking-[0.35em] text-[#93c5fd] font-bold uppercase drop-shadow-[0_0_15px_rgba(147,197,253,0.3)]">
          A NATIONAL LEVEL TECHNICAL SYMPOSIUM
        </div>

        {/* Triquetra'26 with Glowing Cyber Accents & Circuit Lines */}
        <div className="relative flex items-center justify-center gap-3 sm:gap-6 mt-3 sm:mt-4">
          {/* Left Circuit Line */}
          <div className="flex-1 max-w-[80px] sm:max-w-[140px] md:max-w-[180px] h-[1.5px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-[#00f0ff] relative flex items-center justify-end">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
          </div>

          {/* Center Symposium Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black font-sans tracking-[0.12em] text-[#00f0ff] drop-shadow-[0_0_30px_rgba(0,240,255,0.9)]">
            TRIQUETRA'26
          </h1>

          {/* Right Circuit Line */}
          <div className="flex-1 max-w-[80px] sm:max-w-[140px] md:max-w-[180px] h-[1.5px] bg-gradient-to-l from-transparent via-[#00f0ff]/50 to-[#00f0ff] relative flex items-center justify-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* MAIN HERO SECTION (Left: Typography & CTAs, Right: Glowing Triquetra Insignia) */}
      {/* ========================================================================= */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex-1 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Typography, Banner & Department Badges */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 text-center lg:text-left"
          >
            {/* Massive Textured Cyber Headline: CODING & DEBUGGING */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-black tracking-tight uppercase leading-none font-sans drop-shadow-[0_0_35px_rgba(0,240,255,0.4)] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#d6e9ff] to-[#7aa4cc]">
                CODING &amp; DEBUGGING
              </h1>
            </div>

            {/* Circuit Sub-banner */}
            <div className="inline-flex items-center justify-center lg:justify-start gap-3 py-1 font-mono text-sm sm:text-lg font-bold tracking-[0.25em] text-[#00f0ff]">
              <span className="text-[#00f0ff]/60">☵</span>
              <span className="uppercase text-white tracking-[0.2em] shadow-cyan-500/50">THE BUG ARENA</span>
              <span className="text-[#00f0ff]/60">☵</span>
            </div>

            {/* Tagline */}
            <p className="text-sm sm:text-base md:text-lg text-gray-300 font-medium">
              Find the <span className="text-[#ff9e00] font-bold">Bug.</span> Fix the <span className="text-[#00f0ff] font-bold">Code.</span> Prove Your <span className="text-[#c084fc] font-bold">Skill.</span>
            </p>

            {/* Department Selection Badges */}
            <div className="flex items-center justify-center lg:justify-start gap-3 pt-1">
              <button
                onClick={() => handleOpenRegister('IT')}
                className="px-5 py-2 rounded-xl bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/60 hover:border-[#00f0ff] text-[#00f0ff] font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:scale-105 cursor-pointer"
              >
                IT
              </button>

              <button
                onClick={() => handleOpenRegister('AIDS')}
                className="px-5 py-2 rounded-xl bg-[#ff9e00]/10 hover:bg-[#ff9e00]/20 border border-[#ff9e00]/60 hover:border-[#ff9e00] text-[#ff9e00] font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(255,158,0,0.2)] hover:scale-105 cursor-pointer"
              >
                AIDS
              </button>

              <button
                onClick={() => handleOpenRegister('CSBS')}
                className="px-5 py-2 rounded-xl bg-[#a855f7]/10 hover:bg-[#a855f7]/20 border border-[#a855f7]/60 hover:border-[#a855f7] text-[#c084fc] font-mono font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:scale-105 cursor-pointer"
              >
                CSBS
              </button>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              {/* Primary Register CTA */}
              <button
                onClick={() => handleOpenRegister('IT')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#2563eb] via-[#00d2ff] to-[#00f0ff] hover:from-[#3b82f6] hover:to-[#38e1ff] text-black font-extrabold font-mono text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,240,255,0.5)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer"
              >
                <span>REGISTER NOW</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
              </button>

              {/* View Rules Secondary CTA */}
              <button
                onClick={handleOpenRules}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#09142e]/80 hover:bg-[#0e214d] border border-[#00f0ff]/40 hover:border-[#00f0ff] text-gray-200 hover:text-white font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(0,240,255,0.15)] cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#00f0ff]" />
                <span>VIEW RULES</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: High-fidelity Glowing Triquetra Insignia Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-6 flex items-center justify-center relative py-6"
          >
            <TriquetraInsignia size={440} glow={true} />
          </motion.div>

        </div>

        {/* ========================================================================= */}
        {/* 4 STATS / FEATURES CARDS (03 Rounds, 15 Questions, 03 Departments, ∞ Bugs) */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 mb-10 select-none">
          
          {/* Card 1: 03 Rounds */}
          <div className="bg-[#08122a]/90 backdrop-blur-md border border-[#00f0ff]/30 hover:border-[#00f0ff] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">03</div>
              <div className="text-xs font-bold font-mono text-[#00f0ff] uppercase tracking-wider mt-1">ROUNDS</div>
              <div className="text-[11px] text-gray-400 font-sans mt-0.5">Progressive Challenges</div>
            </div>
          </div>

          {/* Card 2: 15 Questions */}
          <div className="bg-[#08122a]/90 backdrop-blur-md border border-[#ff9e00]/30 hover:border-[#ff9e00] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(255,158,0,0.25)]">
            <div className="w-12 h-12 rounded-xl bg-[#ff9e00]/10 border border-[#ff9e00]/40 flex items-center justify-center text-[#ff9e00] shrink-0">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">15</div>
              <div className="text-xs font-bold font-mono text-[#ff9e00] uppercase tracking-wider mt-1">QUESTIONS</div>
              <div className="text-[11px] text-gray-400 font-sans mt-0.5">Per Round</div>
            </div>
          </div>

          {/* Card 3: 03 Departments */}
          <div className="bg-[#08122a]/90 backdrop-blur-md border border-[#a855f7]/30 hover:border-[#a855f7] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc] shrink-0">
              <Users2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">03</div>
              <div className="text-xs font-bold font-mono text-[#c084fc] uppercase tracking-wider mt-1">DEPARTMENTS</div>
              <div className="text-[11px] text-gray-400 font-sans mt-0.5">Independent Sessions</div>
            </div>
          </div>

          {/* Card 4: ∞ Bugs */}
          <div className="bg-[#08122a]/90 backdrop-blur-md border border-[#00f0ff]/30 hover:border-[#00f0ff] rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]">
            <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white leading-none">∞</div>
              <div className="text-xs font-bold font-mono text-[#00f0ff] uppercase tracking-wider mt-1">BUGS</div>
              <div className="text-[11px] text-gray-400 font-sans mt-0.5">Can you fix them all?</div>
            </div>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* BOTTOM SECTION: THREE LEVELS. ONE ARENA. (Bug Scan, Code Repair, Boss Arena) */}
        {/* ========================================================================= */}
        <section className="mt-4 mb-8">
          {/* Header */}
          <div className="text-center space-y-1 mb-6">
            <div className="text-[11px] font-mono tracking-[0.3em] text-[#00f0ff] uppercase">
              — THE CHALLENGE —
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase font-sans">
              THREE LEVELS. ONE ARENA.
            </h2>
          </div>

          {/* 3 Level HUD Cards Container */}
          <div className="border border-[#00f0ff]/30 rounded-3xl p-4 sm:p-6 bg-[#060e24]/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.15)]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Level 1: BUG SCAN (Cyan HUD) */}
              <div 
                onClick={() => handleOpenRegister('IT')}
                className="group relative bg-[#07132e]/90 border border-[#00f0ff]/40 hover:border-[#00f0ff] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff] shrink-0 group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono text-[#00f0ff] tracking-wider uppercase">
                      BUG SCAN
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mt-1">
                      Detect bugs, identify errors and prove your debugging fundamentals.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#00f0ff]/20 flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">LEVEL 01</span>
                  <span className="text-[#00f0ff] font-bold">15 QUESTIONS</span>
                </div>
              </div>

              {/* Level 2: CODE REPAIR (Amber HUD) */}
              <div 
                onClick={() => handleOpenRegister('AIDS')}
                className="group relative bg-[#07132e]/90 border border-[#ff9e00]/40 hover:border-[#ff9e00] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-[0_0_25px_rgba(255,158,0,0.3)] hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#ff9e00]/10 border border-[#ff9e00]/40 flex items-center justify-center text-[#ff9e00] shrink-0 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono text-[#ff9e00] tracking-wider uppercase">
                      CODE REPAIR
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mt-1">
                      Repair broken programs, understand logic and eliminate hidden bugs.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#ff9e00]/20 flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">LEVEL 02</span>
                  <span className="text-[#ff9e00] font-bold">15 QUESTIONS</span>
                </div>
              </div>

              {/* Level 3: BOSS ARENA (Purple HUD) */}
              <div 
                onClick={() => handleOpenRegister('CSBS')}
                className="group relative bg-[#07132e]/90 border border-[#a855f7]/40 hover:border-[#a855f7] rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc] shrink-0 group-hover:scale-110 transition-transform">
                    <Skull className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-mono text-[#c084fc] tracking-wider uppercase">
                      BOSS ARENA
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mt-1">
                      Face the hardest debugging challenges and conquer the final arena.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-[#a855f7]/20 flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-400">LEVEL 03</span>
                  <span className="text-[#c084fc] font-bold">15 QUESTIONS</span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-4 text-center font-mono text-[11px] text-gray-500 border-t border-[#00f0ff]/10">
        TRIQUETRA'26 // THE BUG ARENA // CODING &amp; DEBUGGING // IT • AIDS • CSBS JOINT SYMPOSIUM
      </footer>

      {/* Modals */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegister={(info) => {
          setIsRegisterOpen(false);
          onStartRegistration(info);
        }}
        defaultDepartment={selectedDept}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
};

