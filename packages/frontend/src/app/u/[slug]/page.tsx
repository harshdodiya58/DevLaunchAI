'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { notFound } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, ArrowUpRight, Globe, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';

/* ─────────────────────────────────── helpers ─────────────────────────────── */

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
});

const fadeInView = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.65, delay, ease: 'easeOut' as const },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

/** Make sure bio never repeats the full name and always uses proper pronouns/name once. */
function formatBio(bio: string, fullName: string): string {
  if (!bio) return bio;
  const firstName = fullName?.split(' ')[0] || '';
  // Remove repeated first name after the first occurrence
  let count = 0;
  return bio.replace(new RegExp(`\\b${firstName}\\b`, 'g'), (match) => {
    count++;
    return count === 1 ? match : 'they';
  });
}

/** Resolve a project link to a full URL */
function resolveLink(link: string | undefined): string | null {
  if (!link || link.trim() === '' || link === 'N/A') return null;
  const l = link.trim();
  if (l.startsWith('http://') || l.startsWith('https://')) return l;
  if (l.includes('github.com') || l.includes('huggingface') || l.includes('kaggle') || l.includes('.io') || l.includes('.com')) {
    return `https://${l}`;
  }
  return null;
}

/* ──────────────────────────────── skeleton ──────────────────────────────── */

function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f1014] text-[#f4f0e6] font-sans overflow-x-hidden animate-pulse">
      {/* nav skeleton */}
      <header className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-10 border-b border-[#f4f0e6]/10 bg-[#0f1014]/80">
        <div className="h-5 w-40 bg-[#f4f0e6]/10 rounded-full" />
        <div className="hidden md:flex gap-8">
          {[1,2,3,4].map(i => <div key={i} className="h-3 w-16 bg-[#f4f0e6]/10 rounded-full" />)}
        </div>
      </header>

      {/* hero skeleton matching actual layout */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-24 pb-12">
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center">
          {/* role badge */}
          <div className="h-3 w-36 bg-[#f4f0e6]/10 rounded-full mb-8" />
          {/* big name */}
          <div className="space-y-4 mb-8">
            <div className="h-20 w-64 md:w-96 bg-[#f4f0e6]/10 rounded-lg" />
            <div className="h-20 w-72 md:w-[28rem] bg-[#f4f0e6]/10 rounded-lg md:ml-[10vw]" />
          </div>
          {/* bottom row */}
          <div className="mt-20 grid md:grid-cols-2 gap-10 md:gap-20 items-end">
            <div className="space-y-3">
              <div className="h-4 w-full bg-[#f4f0e6]/10 rounded-full" />
              <div className="h-4 w-4/5 bg-[#f4f0e6]/10 rounded-full" />
              <div className="h-4 w-3/5 bg-[#f4f0e6]/10 rounded-full" />
            </div>
            <div className="flex flex-col md:items-end gap-3">
              <div className="h-3 w-32 bg-[#f4f0e6]/10 rounded-full" />
              <div className="h-3 w-28 bg-[#f4f0e6]/10 rounded-full" />
              <div className="flex gap-3 mt-2">
                <div className="h-5 w-5 bg-[#f4f0e6]/10 rounded-full" />
                <div className="h-5 w-5 bg-[#f4f0e6]/10 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ──────────────────────────────── page ──────────────────────────────────── */

export default function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const { data: portfolio, isLoading, isError } = useQuery({
    queryKey: ['portfolio', params.slug],
    queryFn: () => apiService.portfolio.getBySlug(params.slug).then(r => r.data.data),
    retry: false,
  });

  const { scrollYProgress } = useScroll();
  const progressBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const heroParallaxY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  if (isLoading) return <HeroSkeleton />;
  if (isError || !portfolio) return notFound();

  const { user, sections } = portfolio;
  const bioSection = sections?.bio;
  const rawBioText: string = typeof bioSection === 'string' ? bioSection : bioSection?.bio || sections?.bio || '';
  const fullName: string = sections?.fullName || (typeof bioSection === 'object' ? bioSection?.fullName : null) || user.name || '';
  const taglineText: string = (typeof bioSection === 'object' ? bioSection?.tagline : null) || sections?.tagline || '';
  const targetRole: string = sections?.targetRole || (typeof bioSection === 'object' ? bioSection?.targetRole : null) || user.profile?.targetRole || 'Software Engineer';
  const locationText: string = sections?.location || (typeof bioSection === 'object' ? bioSection?.location : null) || user.profile?.location || '';
  const skills: string[] = sections?.skills || user.profile?.skills || [];

  const bioText = formatBio(rawBioText, fullName);
  const nameParts = fullName.split(' ');
  const firstName = nameParts[0];
  const restName = nameParts.slice(1).join(' ');

  return (
    <div className="min-h-screen bg-[#0f1014] text-[#f4f0e6] selection:bg-[#f95738] selection:text-white font-sans overflow-x-hidden">

      {/* ── scroll progress bar ── */}
      <motion.div
        className="fixed top-0 left-0 z-[100] h-[2px] bg-[#f95738] origin-left"
        style={{ width: progressBarWidth }}
      />

      {/* ── Navigation ── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-[2px] inset-x-0 z-50 flex items-center justify-between px-6 py-5 md:px-10 bg-[#0f1014]/80 backdrop-blur-md border-b border-[#f4f0e6]/10"
      >
        <div className="flex items-center gap-2">
          <motion.span
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
          />
          <span className="font-serif text-lg italic tracking-tight">
            {firstName}<span className="not-italic font-light">{restName ? ` ${restName}` : ''}</span><span className="text-[#f95738]">.</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest text-[#f4f0e6]/60">
          {['About', 'Experience', 'Projects', 'Contact'].map((item) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              whileHover={{ color: '#f95738', y: -1 }}
              transition={{ duration: 0.15 }}
              className="hover:text-[#f95738] transition-colors"
            >
              {item}
            </motion.a>
          ))}
        </nav>
      </motion.header>

      <main>
        {/* ─────────── Hero ─────────── */}
        <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-24 pb-12 overflow-hidden">
          {/* atmospheric blobs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
            className="absolute -right-32 top-16 size-[28rem] rounded-full bg-[#f95738]/5 blur-[100px] pointer-events-none"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
            transition={{ repeat: Infinity, duration: 15, ease: 'easeInOut' }}
            className="absolute -left-40 bottom-10 size-[30rem] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none"
          />

          <motion.div style={{ y: heroParallaxY }} className="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center">
            {/* role badge */}
            <motion.p {...fadeUp(0)} className="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50 mb-6 md:mb-10">
              ( {targetRole} )
            </motion.p>

            {/* giant name */}
            <motion.h1
              {...fadeUp(0.1)}
              className="font-serif text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-tighter"
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {firstName}
              </motion.span>
              <motion.span
                className="block italic text-[#f4f0e6]/80 md:pl-[10vw]"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.25 }}
              >
                {restName}<span className="text-[#f95738]">.</span>
              </motion.span>
            </motion.h1>

            {/* bottom row */}
            <motion.div {...fadeUp(0.4)} className="mt-16 md:mt-24 grid md:grid-cols-2 gap-10 md:gap-20 items-end">
              <p className="text-lg md:text-xl leading-relaxed text-[#f4f0e6]/70 max-w-md font-light">
                {taglineText || `Designing and building precise, scalable software — from backend systems to intuitive interfaces.`}
              </p>

              <div className="flex flex-col md:items-end gap-3 font-mono text-[11px] uppercase tracking-widest text-[#f4f0e6]/50">
                {locationText && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#f95738]" /> {locationText}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available for work
                </span>
                <div className="flex gap-4 mt-2">
                  {user.profile?.githubUsername && (
                    <motion.a whileHover={{ scale: 1.15, color: '#f4f0e6' }} href={`https://github.com/${user.profile.githubUsername}`} target="_blank" className="hover:text-[#f4f0e6] transition-colors">
                      <Github className="w-5 h-5" />
                    </motion.a>
                  )}
                  {user.profile?.linkedinUrl && (
                    <motion.a whileHover={{ scale: 1.15, color: '#f4f0e6' }} href={user.profile.linkedinUrl} target="_blank" className="hover:text-[#f4f0e6] transition-colors">
                      <Linkedin className="w-5 h-5" />
                    </motion.a>
                  )}
                  <motion.a whileHover={{ scale: 1.15, color: '#f4f0e6' }} href={`mailto:${user.email}`} className="hover:text-[#f4f0e6] transition-colors">
                    <Mail className="w-5 h-5" />
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#f4f0e6]/30"
          >
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-[1px] h-10 bg-gradient-to-b from-[#f4f0e6]/30 to-transparent"
            />
          </motion.div>
        </section>

        {/* ─────────── About ─────────── */}
        {bioText && (
          <section id="about" className="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
              <motion.p {...fadeInView()} className="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50">
                ( About — 01 )
              </motion.p>
              <motion.div {...fadeInView(0.1)}>
                <p className="font-serif text-[clamp(1.4rem,2.8vw,2.3rem)] font-light leading-snug tracking-tight">
                  {bioText}
                </p>
                {skills.length > 0 && (
                  <motion.div
                    {...fadeInView(0.2)}
                    className="mt-12 flex flex-wrap gap-2"
                  >
                    {skills.slice(0, 10).map((skill, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ borderColor: '#f95738', color: '#f95738', scale: 1.05 }}
                        className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-[#f4f0e6]/20 rounded-full text-[#f4f0e6]/60 transition-colors cursor-default"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </div>
          </section>
        )}

        {/* ─────────── Experience ─────────── */}
        {sections?.experience && sections.experience.length > 0 && (
          <section id="experience" className="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
              <motion.p {...fadeInView()} className="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50">
                ( Experience — 02 )
              </motion.p>
              <div className="space-y-16">
                {sections.experience.map((exp: any, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.65, delay: i * 0.08 }}
                    className="group relative pl-6 border-l border-[#f4f0e6]/10 hover:border-[#f95738]/50 transition-colors"
                  >
                    <motion.div
                      className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#f4f0e6]/20 group-hover:bg-[#f95738] transition-colors"
                    />
                    <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-3 gap-2">
                      <h3 className="font-serif text-2xl md:text-3xl font-light text-[#f4f0e6] group-hover:text-[#f95738] transition-colors">
                        {exp.role}
                      </h3>
                      <span className="font-mono text-xs text-[#f4f0e6]/40 uppercase tracking-widest shrink-0">{exp.duration}</span>
                    </div>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-[#f95738] font-medium">{exp.company}</span>
                      {exp.location && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#f4f0e6]/20" />
                          <span className="text-[#f4f0e6]/40 font-mono text-xs uppercase tracking-widest">{exp.location}</span>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2.5">
                      {exp.description?.map((desc: string, j: number) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 + j * 0.06 }}
                          className="text-[#f4f0e6]/70 leading-relaxed font-light flex gap-3 text-sm"
                        >
                          <span className="text-[#f95738] mt-1.5 shrink-0">—</span>
                          <span>{desc}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─────────── Projects ─────────── */}
        {sections?.projects && sections.projects.length > 0 && (
          <section id="projects" className="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10 bg-[#f4f0e6] text-[#0f1014]">
            <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
              <motion.p {...fadeInView()} className="font-mono text-xs uppercase tracking-widest text-[#0f1014]/50">
                ( Projects — 03 )
              </motion.p>
              <div className="grid gap-0">
                {sections.projects.map((project: any, i: number) => {
                  const projectUrl = resolveLink(project.link) || resolveLink(project.github) || resolveLink(project.url);
                  const isHovered = hoveredProject === i;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.6, delay: i * 0.07 }}
                      onHoverStart={() => setHoveredProject(i)}
                      onHoverEnd={() => setHoveredProject(null)}
                      className="group border-b border-[#0f1014]/10 py-12 last:border-0"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-5 gap-4">
                        <motion.h3
                          animate={{ x: isHovered ? 6 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="font-serif text-3xl md:text-4xl font-light"
                        >
                          {project.title}
                        </motion.h3>

                        {projectUrl ? (
                          <motion.a
                            href={projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest border border-[#0f1014]/30 rounded-full px-4 py-2 hover:bg-[#f95738] hover:border-[#f95738] hover:text-white transition-all shrink-0 self-start"
                          >
                            View Project <ArrowUpRight className="w-3.5 h-3.5" />
                          </motion.a>
                        ) : (
                          <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#0f1014]/30 shrink-0 self-start">
                            No Link Available
                          </span>
                        )}
                      </div>

                      <ul className="space-y-2 mb-6">
                        {project.description?.map((desc: string, j: number) => (
                          <li key={j} className="text-[#0f1014]/70 leading-relaxed font-light text-sm flex gap-2">
                            <span className="text-[#f95738] mt-1.5 shrink-0">·</span>
                            <span>{desc}</span>
                          </li>
                        ))}
                      </ul>

                      <motion.div
                        initial={false}
                        animate={{ opacity: isHovered ? 1 : 0.7 }}
                        className="flex flex-wrap gap-2"
                      >
                        {project.techStack?.map((tech: string, j: number) => (
                          <motion.span
                            key={j}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: j * 0.04 }}
                            className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-[#0f1014]/20 rounded-full hover:border-[#f95738] hover:text-[#f95738] transition-colors cursor-default"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ─────────── Arsenal (Skills + Education) ─────────── */}
        <section className="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
            <motion.p {...fadeInView()} className="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50">
              ( Arsenal — 04 )
            </motion.p>
            <div className="space-y-24">

              {skills.length > 0 && (
                <div>
                  <motion.h3 {...fadeInView()} className="font-serif text-2xl font-light mb-8 text-[#f95738]">
                    Technologies
                  </motion.h3>
                  <motion.div
                    variants={stagger}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                    className="flex flex-wrap gap-x-6 gap-y-3"
                  >
                    {skills.map((skill: string, i: number) => (
                      <motion.span
                        key={i}
                        variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}
                        whileHover={{ color: '#f95738', scale: 1.05 }}
                        className="font-serif text-xl md:text-2xl font-light text-[#f4f0e6] transition-colors cursor-default"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
              )}

              {sections?.education && sections.education.length > 0 && (
                <div>
                  <motion.h3 {...fadeInView()} className="font-serif text-2xl font-light mb-8 text-[#f95738]">
                    Education
                  </motion.h3>
                  <div className="space-y-8">
                    {sections.education.map((edu: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -15 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.08 }}
                        className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-l-2 border-[#f4f0e6]/10 pl-6 hover:border-[#f95738]/40 transition-colors"
                      >
                        <div>
                          <h4 className="font-serif text-xl text-[#f4f0e6]">{edu.degree}</h4>
                          <p className="text-[#f4f0e6]/50 font-light mt-1">{edu.institution}</p>
                        </div>
                        <div className="flex flex-col md:items-end font-mono text-[10px] uppercase tracking-widest text-[#f4f0e6]/40">
                          <span>{edu.duration}</span>
                          {edu.score && <span className="mt-1 text-[#f95738]/70">{edu.score}</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ─────────── Contact / Footer ─────────── */}
        <footer id="contact" className="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10 bg-[#0f1014] relative overflow-hidden">
          {/* animated background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(244,240,230,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(244,240,230,0.03)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12 relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="font-serif text-[clamp(3rem,8vw,6rem)] font-light leading-none tracking-tighter"
            >
              Let's build{' '}
              <motion.span
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="italic text-[#f4f0e6]/50"
              >
                together.
              </motion.span>
            </motion.h2>

            <motion.a
              href={`mailto:${user.email}`}
              whileHover={{ scale: 1.05, backgroundColor: '#f95738', color: '#fff' }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#f4f0e6] text-[#0f1014] font-medium gap-2"
            >
              Get in touch <ArrowUpRight className="w-4 h-4" />
            </motion.a>

            <div className="flex gap-8 font-mono text-[11px] uppercase tracking-widest text-[#f4f0e6]/40 pt-12 border-t border-[#f4f0e6]/10 w-full justify-center">
              <span>© {new Date().getFullYear()} {fullName}</span>
              {user.profile?.githubUsername && (
                <a href={`https://github.com/${user.profile.githubUsername}`} target="_blank" className="hover:text-[#f95738] transition-colors">GitHub</a>
              )}
              {user.profile?.linkedinUrl && (
                <a href={user.profile.linkedinUrl} target="_blank" className="hover:text-[#f95738] transition-colors">LinkedIn</a>
              )}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
