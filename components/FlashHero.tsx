'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { Code2 } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const NOISE_DATA = [
  { id: 1, text: "Gong: 'Enterprise leads are asking for automated seat provisioning'", type: 'feedback', source: 'gong' },
  { id: 2, text: "Mixpanel: 65% drop-off in 'Organization Invite' flow on Step 2", type: 'usage', source: 'mixpanel' },
  { id: 3, text: "GitHub: Issue #442 - 'Redundant API calls in Dashboard component'", type: 'build', source: 'github' },
  { id: 4, text: "Slack: 'Sales team can't see the ROI metrics users keep asking for'", type: 'feedback', source: 'slack' },
  { id: 5, text: "Zendesk: 'Resetting passwords takes 4 clicks and a 2-minute wait'", type: 'feedback', source: 'zendesk' },
];

const FEATURE_SPECS = [
  {
    id: 1,
    title: 'Just-in-Time Provisioning',
    match: 98,
    points: ['Automate seat allocation via SSO claims', 'Reduce manual Admin overhead by 40%', 'Sync directly with Stripe seat-based pricing'],
    reasoning: 'Analyzed: /auth/provisioning.ts. Found: Missing SCIM handler for enterprise roles.',
  },
  {
    id: 2,
    title: 'Magic-Link Team Onboarding',
    match: 92,
    points: ['Replace multi-step forms with single-link invites', 'Pre-populate team metadata from email domain', 'Instant-access workspace preview'],
    reasoning: 'Detected: Conflict in InviteModel.js schema. Logic fix: Move validation to edge-worker.',
  },
  {
    id: 3,
    title: 'Dashboard State Memoization',
    match: 95,
    points: ['Implement TanStack Query for caching', 'Reduce initial load time from 4.2s to 0.8s', 'Eliminate redundant /api/user calls'],
    reasoning: 'Audited: /components/Dashboard.tsx. Found: UseEffect loop triggering triple-renders.',
  },
  {
    id: 4,
    title: 'Self-Serve ROI Visualizer',
    match: 89,
    points: ['Expose analytics_events to client-side charts', 'Custom date-range impact reporting', 'One-click export for Stakeholders'],
    reasoning: 'Reasoning: Database has raw_events; missing View-Model to serve Dashboard.json.',
  },
  {
    id: 5,
    title: 'Asynchronous Auth Recovery',
    match: 91,
    points: ['Shift password reset to Background Job', 'Zero-latency UI feedback for email dispatch', 'Predictive field-focus for recovery codes'],
    reasoning: 'Path: /api/auth/reset. Detected: Sequential SMTP block. Fix: Offload to Redis queue.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const CARD_TRAVEL_DURATION = 3.5;
const CARD_SPAWN_INTERVAL = 3000;
const ABSORB_POINT = 85;
const SHATTER_DURATION = 0.85;
const SHATTER_COLS = 6;
const SHATTER_ROWS = 4;
const NUM_SHATTER_PIECES = SHATTER_COLS * SHATTER_ROWS; // 24 smaller pieces
const ASSEMBLE_DURATION = 0.5;
const SHOCKWAVE_DURATION = 0.4;
const GLOW_PEAK_DURATION = 0.15;
const GLOW_EASE_DURATION = 0.5;
const DESCRAMBLE_DURATION = 300;
const NUM_ASSEMBLE_PIECES = 8;
const MOBILE_BREAKPOINT = 1024;
const TYPEWRITER_MS_PER_CHAR = 28;

// Brand SVGs for Raw Insight cards (source-based, with brand colors)
function SlackIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: '#E01E5A' }}>
      <path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5zM10.5 14c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5z" />
      <path d="M20.5 10.5c0 .83-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5zM3.5 13.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z" />
    </svg>
  );
}
function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: 'var(--slate-900,#0f172a)' }}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}
function GongIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: '#FF00FF' }}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}
function MixpanelIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: '#7856FF' }}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
function ZendeskIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ color: '#03363D' }}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}

const SOURCE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: SlackIcon,
  github: GithubIcon,
  gong: GongIcon,
  mixpanel: MixpanelIcon,
  zendesk: ZendeskIcon,
};
function SourceIcon({ source, className }: { source: string; className?: string }) {
  const key = (source || '').toLowerCase();
  const Icon = SOURCE_ICON_MAP[key];
  if (Icon) return <Icon className={className} />;
  return <Code2 className={className} />;
}

// Shatter: each piece flies outward in a different direction and spins (slower, smaller pieces)
function getShatterOffset(i: number) {
  const angle = (i / NUM_SHATTER_PIECES) * Math.PI * 2 + i * 0.5;
  const dist = 50 + (i % 5) * 18;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist * 0.7,
    rotate: (i % 2 === 0 ? 1 : -1) * (18 + (i % 6) * 8),
    scale: 0.03,
  };
}

interface ConveyorCard {
  uid: string;
  data: (typeof NOISE_DATA)[0];
  specIndex: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

function useDescrambleText(finalText: string, isActive: boolean) {
  const [displayText, setDisplayText] = useState(finalText);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayText(finalText);
      return;
    }
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    const finalChars = finalText.split('');
    let elapsed = 0;
    const shuffleInterval = 50;
    intervalRef.current = setInterval(() => {
      elapsed += shuffleInterval;
      if (elapsed >= DESCRAMBLE_DURATION) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(finalText);
        return;
      }
      setDisplayText(
        finalChars
          .map((c) => (c === ' ' ? ' ' : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      );
    }, shuffleInterval);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [finalText, isActive]);
  return displayText;
}

/** Type out reasoning text character by character when card is manifested (terminal-style). */
function useTypewriter(fullText: string, shouldStart: boolean) {
  const [visibleLength, setVisibleLength] = useState(0);

  useEffect(() => {
    if (!shouldStart) {
      setVisibleLength(0);
      return;
    }
    setVisibleLength(0);
  }, [fullText, shouldStart]);

  useEffect(() => {
    if (!shouldStart || visibleLength >= fullText.length) return;
    const t = setTimeout(() => setVisibleLength((n) => n + 1), TYPEWRITER_MS_PER_CHAR);
    return () => clearTimeout(t);
  }, [shouldStart, visibleLength, fullText.length, fullText]);

  return fullText.slice(0, visibleLength);
}

// ─────────────────────────────────────────────────────────────────────────────
// RAW INSIGHT CARD – shatter into pieces at lens (horizontal on desktop, vertical on mobile)
// ─────────────────────────────────────────────────────────────────────────────
function RawInsightCard({
  card,
  onAbsorb,
  isMobile,
  lensCenterX,
  trackLeft,
  lensCenterY,
  trackTop,
}: {
  card: ConveyorCard;
  onAbsorb: (uid: string, specIndex: number) => void;
  isMobile: boolean;
  lensCenterX: number;
  trackLeft: number;
  lensCenterY: number;
  trackTop: number;
}) {
  const controls = useAnimationControls();
  const [isAbsorbing, setIsAbsorbing] = useState(false);
  const [showShatter, setShowShatter] = useState(false);
  const hasAbsorbed = useRef(false);

  useEffect(() => {
    if (isMobile) {
      // Vertical: move from top down toward lens
      controls.start({
        y: lensCenterY - trackTop - 50,
        opacity: 1,
        transition: { duration: CARD_TRAVEL_DURATION, ease: 'linear' },
      });
    } else {
      // Horizontal: move from left to lens
      controls.start({
        x: 'calc(100% + 40px)',
        opacity: 1,
        transition: { duration: CARD_TRAVEL_DURATION, ease: 'linear' },
      });
    }

    const absorbTime = (ABSORB_POINT / 100) * CARD_TRAVEL_DURATION * 1000;
    const absorbTimer = setTimeout(() => {
      if (!hasAbsorbed.current) {
        hasAbsorbed.current = true;
        setIsAbsorbing(true);
        onAbsorb(card.uid, card.specIndex);

        if (isMobile) {
          controls.start({
            y: lensCenterY - trackTop - 50,
            transition: { duration: 0.15, ease: 'easeOut' },
          });
        } else {
          const lensCenterRelativeToTrack = lensCenterX - trackLeft - 120;
          controls.start({
            x: lensCenterRelativeToTrack,
            transition: { duration: 0.15, ease: 'easeOut' },
          });
        }
        const shatterTimer = setTimeout(() => setShowShatter(true), 80);
        return () => clearTimeout(shatterTimer);
      }
    }, absorbTime);

    return () => clearTimeout(absorbTimer);
  }, [card.uid, card.specIndex, controls, onAbsorb, isMobile, lensCenterX, trackLeft, lensCenterY, trackTop]);

  return (
    <motion.div
      initial={
        isMobile
          ? { y: '-120%', x: 0, opacity: 0.8 }
          : { x: '-120%', y: 0, opacity: 0.8 }
      }
      animate={controls}
      className={
        isMobile
          ? 'absolute left-1/2 top-0 -translate-x-1/2 w-[220px] origin-center'
          : 'absolute left-0 top-1/2 -translate-y-1/2 w-[240px] origin-center'
      }
    >
      {/* Card content – hide when shattering */}
      <motion.div
        animate={{
          opacity: showShatter ? 0 : 1,
          filter: isAbsorbing && !showShatter ? 'blur(2px)' : 'blur(1px)',
        }}
        transition={{ duration: 0.05 }}
        className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm p-4 shadow-lg relative z-0"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span className="shrink-0 flex items-center justify-center w-5 h-5">
            <SourceIcon source={card.data.source} className="w-4 h-4" />
          </span>
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
            Raw Insight
          </span>
        </div>
        <p className="text-sm font-mono text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-2 font-medium">
          {card.data.text}
        </p>
      </motion.div>

      {/* Shatter pieces – card breaks into fragments that fly outward and disappear */}
      <AnimatePresence>
        {showShatter && (
          <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ zIndex: 10 }}>
            {Array.from({ length: NUM_SHATTER_PIECES }).map((_, i) => {
              const { x, y, rotate, scale } = getShatterOffset(i);
              const row = Math.floor(i / SHATTER_COLS);
              const col = i % SHATTER_COLS;
              return (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                  }}
                  animate={{
                    opacity: 0,
                    x,
                    y,
                    scale,
                    rotate,
                  }}
                  transition={{
                    duration: SHATTER_DURATION,
                    delay: i * 0.028,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="absolute rounded-sm bg-white border border-slate-200 shadow-md"
                  style={{
                    left: `${(col / SHATTER_COLS) * 100}%`,
                    top: `${(row / SHATTER_ROWS) * 100}%`,
                    width: `${100 / SHATTER_COLS}%`,
                    height: `${100 / SHATTER_ROWS}%`,
                    transformOrigin: 'center center',
                  }}
                />
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {!isAbsorbing && !isMobile && (
        <motion.div
          className="absolute inset-y-2 -left-4 w-10 rounded-l-xl bg-gradient-to-r from-slate-300/50 to-transparent -z-10 pointer-events-none"
          style={{ filter: 'blur(5px)', opacity: 0.6 }}
        />
      )}
      {!isAbsorbing && isMobile && (
        <motion.div
          className="absolute -top-2 inset-x-2 h-8 rounded-t-xl bg-gradient-to-b from-slate-300/50 to-transparent -z-10 pointer-events-none"
          style={{ filter: 'blur(5px)', opacity: 0.6 }}
        />
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLASH LENS – vertical capsule on desktop, horizontal bar on mobile
// ─────────────────────────────────────────────────────────────────────────────
function FlashLens({
  glowIntensity,
  shockwaveActive,
  isMobile,
}: {
  glowIntensity: number;
  shockwaveActive: boolean;
  isMobile: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center z-20 shrink-0 w-full lg:w-auto">
      <motion.div
        animate={{
          boxShadow: `0 0 ${glowIntensity}px rgba(0, 102, 255, 0.5), 0 0 ${glowIntensity * 1.5}px rgba(0, 102, 255, 0.25)`,
        }}
        transition={{
          duration: glowIntensity > 40 ? GLOW_EASE_DURATION : GLOW_PEAK_DURATION,
          ease: 'easeOut',
        }}
        className={
          isMobile
            ? 'h-3 w-full max-w-[220px] rounded-full border-2 border-electric-blue dark:border-electric-blue-dark bg-electric-blue/25 dark:bg-electric-blue-dark/25 backdrop-blur-[20px] relative overflow-visible shadow-[0_0_16px_rgba(0,102,255,0.3)]'
            : 'h-[280px] w-[80px] rounded-full border-2 border-electric-blue dark:border-electric-blue-dark bg-white/30 dark:bg-white/20 backdrop-blur-[20px] relative overflow-visible'
        }
      >
        {!isMobile && (
          <>
            <AnimatePresence>
              {shockwaveActive && (
                <motion.div
                  key="shockwave"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: SHOCKWAVE_DURATION, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-electric-blue dark:border-electric-blue-dark pointer-events-none"
                  style={{ borderWidth: '1px' }}
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-electric-blue/20 to-transparent rounded-full" />
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-electric-blue/30 blur-xl rounded-full"
            />
          </>
        )}
      </motion.div>
      <span className="mt-1 lg:mt-4 text-center text-[10px] lg:text-xs font-bold uppercase tracking-widest text-electric-blue dark:text-electric-blue-dark">
        The Flash Lens
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE SPEC CARD – assembles from pieces flying in from lens
// ─────────────────────────────────────────────────────────────────────────────
function FeatureSpecCard({
  spec,
  isAssembling,
  triggerDescramble,
}: {
  spec: (typeof FEATURE_SPECS)[0];
  isAssembling: boolean;
  triggerDescramble: boolean;
}) {
  const displayTitle = useDescrambleText(spec.title, triggerDescramble);
  const [showContent, setShowContent] = useState(!isAssembling);
  const reasoningVisible = useTypewriter(
    spec.reasoning ?? '',
    showContent && !!spec.reasoning
  );
  const isTyping = showContent && spec.reasoning && reasoningVisible.length < (spec.reasoning?.length ?? 0);

  useEffect(() => {
    if (isAssembling) {
      setShowContent(false);
      const t = setTimeout(() => setShowContent(true), ASSEMBLE_DURATION * 1000 * 0.7);
      return () => clearTimeout(t);
    } else {
      setShowContent(true);
    }
  }, [isAssembling, spec.id]);

  return (
    <motion.div
      layout
      className="rounded-2xl border-2 border-electric-blue dark:border-electric-blue-dark bg-white dark:bg-deep-black p-3 lg:p-5 shadow-2xl w-full max-w-xs relative overflow-hidden shrink-0"
    >
      {/* Assemble pieces – fly in from the lens (left) and snap into place to form the card */}
      <AnimatePresence>
        {isAssembling && (
          <>
            {Array.from({ length: NUM_ASSEMBLE_PIECES }).map((_, i) => {
              const row = Math.floor(i / 4);
              const col = i % 4;
              const delay = i * 0.035;
              const fromX = -100 - (i % 4) * 25;
              const fromY = (i % 2 === 0 ? -1 : 1) * 20;
              return (
                <motion.div
                  key={`assemble-${spec.id}-${i}`}
                  initial={{
                    opacity: 0,
                    x: fromX,
                    y: fromY,
                    scale: 0.2,
                    rotate: (i % 2 === 0 ? -12 : 12),
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                  }}
                  transition={{
                    duration: ASSEMBLE_DURATION * 0.9,
                    delay,
                    ease: [0.34, 1.2, 0.64, 1],
                  }}
                  className="absolute rounded-lg bg-electric-blue/10 border-2 border-electric-blue/40 shadow-md"
                  style={{
                    left: `${(col / 4) * 100}%`,
                    top: `${(row / 2) * 100}%`,
                    width: `${100 / 4}%`,
                    height: `${100 / 2}%`,
                    transformOrigin: 'center center',
                  }}
                />
              );
            })}
          </>
        )}
      </AnimatePresence>

      {/* Card content – fades in after pieces settle */}
      <motion.div
        initial={false}
        animate={{
          opacity: showContent ? 1 : 0,
          scale: showContent ? 1 : 0.96,
        }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative z-10"
      >
        <div className="mb-1.5 lg:mb-3 flex items-center justify-between gap-2">
          <span className="rounded-full bg-electric-blue/15 dark:bg-electric-blue-dark/20 px-2 py-0.5 text-[9px] lg:text-[10px] font-bold text-electric-blue dark:text-electric-blue-dark uppercase">
            Feature Concept
          </span>
          <span className="text-electric-blue dark:text-electric-blue-dark font-bold text-xs lg:text-sm">
            {spec.match}% Match
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={spec.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-sm lg:text-lg font-bold mb-1 lg:mb-2 text-slate-900 dark:text-white font-mono leading-tight">{displayTitle}</h2>
            <ul className="space-y-0.5 lg:space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] lg:text-sm leading-snug">
              {spec.points.map((point, i) => (
                <li key={i} className="flex items-start gap-1.5 lg:gap-2">
                  <div className="mt-0.5 lg:mt-1.5 h-1 w-1 lg:h-1.5 lg:w-1.5 rounded-full bg-safety-orange shrink-0" />
                  {point}
                </li>
              ))}
            </ul>

            {/* Reasoning pane – IDE/terminal style, types out when manifested */}
            {spec.reasoning && (
              <div className="mt-2 lg:mt-3 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden">
                <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-slate-700 bg-slate-800/80">
                  <Code2 className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Reasoning
                  </span>
                </div>
                <div className="px-2.5 py-2 min-h-[2.5rem] font-mono text-[10px] lg:text-xs text-green-400 leading-relaxed break-words">
                  {reasoningVisible}
                  {isTyping && (
                    <span className="inline-block w-2 h-3.5 ml-0.5 bg-green-400 animate-pulse align-middle" />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <button className="mt-2 lg:mt-4 w-full rounded-lg bg-electric-blue dark:bg-electric-blue-dark py-2 lg:py-2.5 text-xs lg:text-sm font-bold text-white hover:opacity-90 transition-opacity active:scale-[0.98]">
          Manifest this Concept
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export default function FlashHero() {
  const isMobile = useIsMobile();
  const [cards, setCards] = useState<ConveyorCard[]>([]);
  const [currentSpecIndex, setCurrentSpecIndex] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(20);
  const [shockwaveActive, setShockwaveActive] = useState(false);
  const [triggerDescramble, setTriggerDescramble] = useState(false);
  const [isAssembling, setIsAssembling] = useState(false);
  const cardIndexRef = useRef(0);
  const uidCounterRef = useRef(0);
  const lensRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [lensCenterX, setLensCenterX] = useState(0);
  const [trackLeft, setTrackLeft] = useState(0);
  const [lensCenterY, setLensCenterY] = useState(0);
  const [trackTop, setTrackTop] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (lensRef.current) {
        const r = lensRef.current.getBoundingClientRect();
        setLensCenterX(r.left + r.width / 2);
        setLensCenterY(r.top + r.height / 2);
      }
      if (trackRef.current) {
        const r = trackRef.current.getBoundingClientRect();
        setTrackLeft(r.left);
        setTrackTop(r.top);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [cards.length, isMobile]);

  useEffect(() => {
    const spawnCard = () => {
      const dataIndex = cardIndexRef.current % NOISE_DATA.length;
      const specIndex = cardIndexRef.current % FEATURE_SPECS.length;
      const newCard: ConveyorCard = {
        uid: `card-${uidCounterRef.current++}`,
        data: NOISE_DATA[dataIndex],
        specIndex,
      };
      setCards((prev) => [...prev.slice(-2), newCard]);
      cardIndexRef.current++;
    };
    const initialDelay = setTimeout(spawnCard, 500);
    const interval = setInterval(spawnCard, CARD_SPAWN_INTERVAL);
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  const handleAbsorb = useCallback((uid: string, specIndex: number) => {
    setGlowIntensity(80);
    setTimeout(() => setGlowIntensity(20), 120);

    setShockwaveActive(true);
    setTimeout(() => setShockwaveActive(false), SHOCKWAVE_DURATION * 1000 + 50);

    setTriggerDescramble(true);
    setIsAssembling(true);
    setCurrentSpecIndex(specIndex);
    setTimeout(() => setTriggerDescramble(false), DESCRAMBLE_DURATION + 100);
    setTimeout(() => setIsAssembling(false), ASSEMBLE_DURATION * 1000 + 50);

    // Remove card after shatter animation (move 150ms + shatter ~1s)
    setTimeout(() => {
      setCards((prev) => prev.filter((c) => c.uid !== uid));
    }, 1100);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="absolute top-3 lg:top-12 left-1/2 -translate-x-1/2 text-center w-full max-w-2xl px-3 lg:px-4 z-30">
        <h1 className="text-lg sm:text-2xl lg:text-4xl xl:text-5xl font-black tracking-tighter mb-0.5 lg:mb-2 text-slate-900 dark:text-white">
          The Brain Between Your Users and <span className="text-electric-blue dark:text-electric-blue-dark">Your Code.</span>
        </h1>
        <p className="text-[10px] sm:text-sm lg:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Flashbuild listens to your customers, watches your data, and reasons with your codebase to tell you exactly what to build next. Insight to impact, autocompleted.
        </p>
      </div>

      {/* Desktop: horizontal row | Mobile: vertical funnel (raw top → lens center → spec bottom) */}
      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center px-3 lg:px-8 pt-16 lg:pt-0 pb-10 lg:pb-0">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-2 lg:gap-8 w-full max-w-5xl flex-1 min-h-0 lg:flex-initial">
          {/* 1. Raw feed / track – top on mobile, left on desktop */}
          <div
            ref={trackRef}
            className="order-1 lg:order-1 relative w-full lg:flex-1 h-[90px] lg:h-[120px] overflow-visible flex justify-center shrink-0"
          >
            {/* Desktop: horizontal track */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-slate-200 via-slate-300 to-electric-blue/60 -translate-y-1/2" />
            <motion.div
              animate={isMobile ? { y: ['0%', '100%'] } : { x: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="hidden lg:block absolute top-1/2 left-0 w-1.5 h-1.5 rounded-full bg-electric-blue -translate-y-1/2 opacity-60"
            />
            <motion.div
              animate={isMobile ? { y: ['0%', '100%'] } : { x: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.7 }}
              className="hidden lg:block absolute top-1/2 left-0 w-1 h-1 rounded-full bg-electric-blue/70 -translate-y-1/2 opacity-40"
            />
            {/* Mobile: vertical track (funnel line from top to center) */}
            <div className="lg:hidden absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-electric-blue/40 via-slate-300 to-electric-blue/60 -translate-x-1/2" />
            <motion.div
              animate={{ y: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="lg:hidden absolute top-0 left-1/2 w-1.5 h-1.5 rounded-full bg-electric-blue -translate-x-1/2 opacity-60"
            />

            <AnimatePresence>
              {cards.map((card) => (
                <RawInsightCard
                  key={card.uid}
                  card={card}
                  onAbsorb={handleAbsorb}
                  isMobile={isMobile}
                  lensCenterX={lensCenterX}
                  trackLeft={trackLeft}
                  lensCenterY={lensCenterY}
                  trackTop={trackTop}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* 2. Lens – center on both; horizontal bar on mobile, vertical capsule on desktop */}
          <div ref={lensRef} className="order-2 w-full lg:w-auto flex justify-center shrink-0">
            <FlashLens
              glowIntensity={glowIntensity}
              shockwaveActive={shockwaveActive}
              isMobile={isMobile}
            />
          </div>

          {/* 3. Feature Spec – bottom on mobile (shrink to content), right on desktop */}
          <div className="order-3 flex-initial lg:flex-1 flex justify-center lg:justify-start max-w-xs w-full overflow-visible min-h-0">
            <FeatureSpecCard
              spec={FEATURE_SPECS[currentSpecIndex]}
              isAssembling={isAssembling}
              triggerDescramble={triggerDescramble}
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-2 lg:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-slate-400 text-[10px] lg:text-xs z-10">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-electric-blue dark:bg-electric-blue-dark shrink-0"
        />
        <span>Processing insights automatically</span>
      </div>
    </section>
  );
}
