'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Brain, FileText, Briefcase, Zap, Github, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { motion, Variants, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 100 } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const textStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.2 },
  },
};

const charVariant: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', damping: 12, stiffness: 100 } },
};

const BackgroundGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="absolute inset-[-100%]"
    >
      <motion.div
        animate={{ y: [0, -40] }}
        transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
        className="w-full h-[200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(150, 150, 150, 0.25) 1.5px, transparent 1.5px)',
          backgroundSize: '40px 40px',
        }}
      />
    </motion.div>
    <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
    {/* Ambient Glows */}
    <motion.div 
      animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
      transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      className="absolute top-1/4 left-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[100px]" 
    />
    <motion.div 
      animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
      transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
      className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-foreground/5 rounded-full blur-[100px]" 
    />
  </div>
);

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col scroll-smooth relative overflow-x-hidden">
      <BackgroundGrid />
      
      {/* Navigation */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 flex h-20 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity cursor-pointer">
              <motion.div 
                whileHover={{ rotate: 90 }}
                transition={{ type: 'spring', damping: 10 }}
                className="h-6 w-6 bg-foreground rounded-sm flex items-center justify-center"
              >
                <Zap className="h-4 w-4 text-background" />
              </motion.div>
              DEVLAUNCH
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="hover:opacity-60 transition-opacity">Features</a>
            <a href="#how-it-works" className="hover:opacity-60 transition-opacity">How it Works</a>
            <a href="#pricing" className="hover:opacity-60 transition-opacity">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:opacity-60 transition-opacity hidden sm:block">
              Sign In
            </Link>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="rounded-full px-6 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-glow hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]">
                  Get Started
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 px-6">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="container mx-auto max-w-5xl text-center"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm px-5 py-2 text-sm font-medium mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-foreground animate-pulse"></span>
              The Operating System for Developers
            </motion.div>
            
            <motion.h1 
              variants={textStagger} 
              initial="hidden"
              animate="visible"
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8"
            >
              <div className="overflow-hidden flex flex-wrap justify-center gap-x-4">
                {"Ship your career.".split(' ').map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-flex">
                    {word.split('').map((char, index) => (
                      <motion.span key={index} variants={charVariant} className="inline-block">
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </div>
              <div className="overflow-hidden mt-2 flex flex-wrap justify-center gap-x-4 text-muted-foreground bg-gradient-to-r from-muted-foreground to-foreground/30 bg-clip-text text-transparent">
                {"Faster than ever.".split(' ').map((word, wordIndex) => (
                  <span key={wordIndex} className="inline-flex">
                    {word.split('').map((char, index) => (
                      <motion.span key={index} variants={charVariant} className="inline-block">
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </div>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Unify your resume, coding practice, mock interviews, and job tracking into one seamlessly designed, AI-powered platform.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="rounded-full h-14 px-8 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto shadow-glow hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transition-all">
                    Start Building <ArrowRight className="h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="https://github.com" target="_blank">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg gap-2 w-full sm:w-auto bg-background/50 backdrop-blur-sm">
                    <Github className="h-5 w-5" /> View on GitHub
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Orbiting Elements */}
          <div className="absolute inset-0 pointer-events-none hidden md:block">
            <motion.div animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} className="absolute top-[20%] left-[10%] opacity-50">
              <div className="bg-background border border-border rounded-xl p-4 shadow-xl"><Code className="h-8 w-8 text-muted-foreground" /></div>
            </motion.div>
            <motion.div animate={{ y: [0, 40, 0], rotate: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }} className="absolute bottom-[20%] right-[10%] opacity-50">
              <div className="bg-background border border-border rounded-xl p-4 shadow-xl"><Brain className="h-8 w-8 text-muted-foreground" /></div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 bg-secondary/10 border-y border-border/50 px-6 scroll-mt-20 relative">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              <motion.div variants={fadeUp} className="lg:col-span-3 mb-16 text-center">
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Everything you need.</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Designed with absolute minimalism and focus. We've stripped away the noise so you can focus on shipping your career.</p>
              </motion.div>

              {features.map((feature, i) => (
                <motion.div 
                  key={feature.title} 
                  variants={fadeUp}
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="group glass-panel p-8 rounded-3xl transition-all duration-300 hover:shadow-glow hover:border-primary/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 group-hover:scale-150 transition-all duration-500 pointer-events-none">
                    {feature.icon}
                  </div>
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how-it-works" className="py-32 px-6 overflow-hidden scroll-mt-20 relative">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-24"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">How it works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From raw skills to signed offer letters. A seamless, automated pipeline powered by AI.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-32 relative"
            >
              {/* Animated connecting line */}
              <div className="absolute left-[39px] lg:left-1/2 lg:-ml-px top-12 bottom-12 w-[2px] bg-border/50 hidden md:block" />
              <motion.div 
                initial={{ height: 0 }}
                whileInView={{ height: '100%' }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute left-[39px] lg:left-1/2 lg:-ml-px top-12 w-[2px] bg-foreground hidden md:block" 
              />

              {/* Step 1 */}
              <motion.div variants={fadeUp} className="flex flex-col lg:flex-row items-center gap-16 relative">
                <div className="flex-1 space-y-6 lg:text-right lg:pr-12">
                  <h3 className="text-3xl font-black tracking-tight">Sync your digital identity</h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Connect your GitHub to instantly import repositories and tech stacks. DevLaunch analyzes your commits to build an accurate profile of your engineering capabilities.
                  </p>
                </div>
                <div className="hidden lg:flex absolute left-1/2 -ml-6 h-12 w-12 items-center justify-center rounded-full bg-background border-4 border-foreground font-black text-foreground z-10">1</div>
                <div className="flex-1 w-full relative lg:pl-12">
                  <div className="bg-background border border-border/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-foreground/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-tr from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors"><Github className="h-6 w-6" /></div>
                        <div><p className="font-bold">GitHub Integration</p><p className="text-sm text-green-500 font-medium">Connected</p></div>
                      </div>
                      <Button variant="outline" size="sm">Sync Now</Button>
                    </div>
                    <div className="space-y-4">
                      <motion.div animate={{ width: ['0%', '75%'] }} transition={{ duration: 1, delay: 0.5 }} className="h-4 bg-muted rounded" />
                      <motion.div animate={{ width: ['0%', '50%'] }} transition={{ duration: 1, delay: 0.7 }} className="h-4 bg-muted rounded" />
                      <div className="flex gap-2 pt-4">
                        <span className="px-3 py-1 bg-foreground/5 text-foreground rounded-full text-xs font-bold border border-border">React</span>
                        <span className="px-3 py-1 bg-foreground/5 text-foreground rounded-full text-xs font-bold border border-border">TypeScript</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div variants={fadeUp} className="flex flex-col lg:flex-row-reverse items-center gap-16 relative">
                <div className="flex-1 space-y-6 lg:pl-12">
                  <h3 className="text-3xl font-black tracking-tight">AI Resume Engine</h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Stop writing generic bullets. Our AI rewrites your experience to match exact ATS requirements, then exports it in mathematically perfect, Silicon Valley-grade PDF layouts.
                  </p>
                </div>
                <div className="hidden lg:flex absolute left-1/2 -ml-6 h-12 w-12 items-center justify-center rounded-full bg-background border-4 border-foreground font-black text-foreground z-10">2</div>
                <div className="flex-1 w-full relative lg:pr-12">
                  <div className="bg-background border border-border/50 rounded-3xl p-2 shadow-2xl relative overflow-hidden flex h-80 group hover:border-foreground/30 transition-colors">
                    <div className="w-1/3 border-r border-border p-4 bg-muted/20">
                      <div className="h-8 bg-foreground/10 rounded mb-4 w-1/2"></div>
                      <div className="space-y-2 mb-6">
                        <div className="h-10 bg-background border border-border rounded flex items-center justify-between px-3 shadow-sm"><span className="text-xs font-bold">Improve Bullet</span><Sparkles className="h-3 w-3 text-foreground" /></div>
                        <div className="h-10 bg-background border border-border rounded opacity-50"></div>
                      </div>
                      <div className="h-8 bg-foreground rounded w-full flex items-center justify-center group-hover:scale-105 transition-transform"><span className="text-xs text-background font-bold">Export PDF</span></div>
                    </div>
                    <div className="w-2/3 bg-background p-6 relative overflow-hidden">
                      <div className="h-12 bg-foreground text-background p-3 -mx-6 -mt-6 mb-4 flex flex-col justify-center items-center">
                        <div className="h-3 w-1/2 bg-background/20 rounded mb-1"></div>
                      </div>
                      <motion.div animate={{ width: ['0%', '25%'] }} transition={{ duration: 1, delay: 0.5 }} className="h-2 bg-foreground/20 mb-2"></motion.div>
                      <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 1, delay: 0.6 }} className="h-1.5 bg-foreground/10 mb-1"></motion.div>
                      <motion.div animate={{ width: ['0%', '75%'] }} transition={{ duration: 1, delay: 0.7 }} className="h-1.5 bg-foreground/10 mb-4"></motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div variants={fadeUp} className="flex flex-col lg:flex-row items-center gap-16 relative">
                <div className="flex-1 space-y-6 lg:text-right lg:pr-12">
                  <h3 className="text-3xl font-black tracking-tight">Visualize your pipeline</h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Drop the spreadsheets. Drag and drop jobs through your personalized Kanban board. Log interview notes, track deadlines, and let AI predict your chances of an offer.
                  </p>
                </div>
                <div className="hidden lg:flex absolute left-1/2 -ml-6 h-12 w-12 items-center justify-center rounded-full bg-background border-4 border-foreground font-black text-foreground z-10">3</div>
                <div className="flex-1 w-full relative lg:pl-12">
                  <div className="bg-background border border-border/50 rounded-3xl p-6 shadow-2xl h-80 flex gap-4 group hover:border-foreground/30 transition-colors">
                    <div className="flex-1 bg-muted/20 rounded-2xl p-3 border border-border/50">
                      <h4 className="text-xs font-bold uppercase mb-3 text-muted-foreground">Applied (2)</h4>
                      <div className="bg-background p-3 rounded-lg border border-border shadow-sm mb-3">
                        <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-muted/20 rounded-2xl p-3 border border-border/50 relative overflow-hidden">
                      <h4 className="text-xs font-bold uppercase mb-3 text-foreground">Interview (1)</h4>
                      <motion.div 
                        initial={{ y: -50, rotate: -5, opacity: 0 }}
                        whileInView={{ y: 0, rotate: 2, opacity: 1 }}
                        transition={{ type: 'spring', delay: 0.5 }}
                        viewport={{ once: true }}
                        className="bg-background p-3 rounded-lg border-2 border-foreground shadow-xl absolute left-3 right-3 z-10 cursor-grab"
                      >
                        <div className="h-3 bg-foreground/20 rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-muted rounded w-3/4 mb-3"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold bg-foreground text-background px-2 py-0.5 rounded">Technical</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32 px-6 bg-secondary/10 border-y border-border/50 scroll-mt-20 relative">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">Simple, transparent pricing</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Invest in your career. Unbelievable value for engineers ready to level up.</p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
            >
              {/* Free Tier */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="bg-background rounded-3xl border border-border p-8 hover:border-foreground/30 transition-colors flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Starter</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">₹0</span>
                    <span className="text-muted-foreground font-medium">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">Perfect for trying out the platform.</p>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /><span className="text-sm">1 AI Resume Generation</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /><span className="text-sm">Basic ATS Formatting</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /><span className="text-sm">Up to 10 Job Trackings</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /><span className="text-sm">Basic Code Arena</span></div>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-12 font-bold border-2 hover:bg-foreground hover:text-background transition-colors">Get Started</Button>
              </motion.div>

              {/* Pro Tier */}
              <motion.div variants={fadeUp} whileHover={{ y: -20, scale: 1.02 }} className="bg-foreground text-background rounded-3xl border-2 border-foreground p-8 shadow-2xl relative flex flex-col transform md:-translate-y-4 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background text-foreground border-2 border-foreground px-4 py-1 rounded-full text-xs font-black tracking-wide flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" /> MOST POPULAR
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-background/80">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">₹299</span>
                    <span className="text-background/60 font-medium">/month</span>
                  </div>
                  <p className="text-sm text-background/70 mt-4">Everything you need to land the job.</p>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /><span className="text-sm font-medium">Unlimited AI Resumes</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /><span className="text-sm font-medium">Full AI Mock Interviews</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /><span className="text-sm font-medium">Unlimited Job Kanban</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /><span className="text-sm font-medium">Advanced ATS Scoring</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-background" /><span className="text-sm font-medium">AI Code Reviews</span></div>
                </div>
                <Button className="w-full rounded-xl h-12 font-bold bg-background text-foreground hover:bg-background/90 hover:scale-[1.02] transition-transform">Upgrade to Pro</Button>
              </motion.div>

              {/* Elite Tier */}
              <motion.div variants={fadeUp} whileHover={{ y: -10 }} className="bg-background rounded-3xl border border-border p-8 hover:border-foreground/30 transition-colors flex flex-col">
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Elite</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">₹799</span>
                    <span className="text-muted-foreground font-medium">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">For maximum career acceleration.</p>
                </div>
                <div className="flex-1 space-y-4 mb-8">
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /><span className="text-sm">Everything in Pro</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-foreground" /><span className="text-sm font-bold">1-on-1 Expert Review (Monthly)</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-foreground" /><span className="text-sm font-bold">Priority Support</span></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-foreground" /><span className="text-sm font-bold">API Access</span></div>
                </div>
                <Button variant="outline" className="w-full rounded-xl h-12 font-bold border-2 hover:bg-foreground hover:text-background transition-colors">Contact Sales</Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-foreground z-[-2]" />
          <div className="absolute inset-0 opacity-10 z-[-1]" style={{ backgroundImage: 'radial-gradient(circle at center, white 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="container mx-auto max-w-4xl text-center text-background p-12 md:p-24 relative z-10"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">Ready to launch?</h2>
            <p className="text-xl text-background/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Join thousands of developers who are streamlining their career progression with DevLaunch AI. The operating system for your career is here.
            </p>
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                <Button size="lg" className="rounded-full h-16 px-12 text-lg font-bold bg-background text-foreground hover:bg-background/90 shadow-2xl">
                  Create Free Account
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-16 px-6 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 font-black text-xl mb-4">
                <Zap className="h-5 w-5" /> DEVLAUNCH
              </div>
              <p className="text-muted-foreground max-w-sm leading-relaxed">
                The ultimate AI-powered career operating system for software engineers. Build, practice, interview, and land the job.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Resume Builder</Link></li>
                <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Mock Interviews</Link></li>
                <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Job Tracker</Link></li>
                <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Code Arena</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="https://www.linkedin.com/in/harsh-dodiya-5b7864270/" target="_blank" className="hover:text-foreground transition-colors">LinkedIn</Link></li>
                <li><Link href="https://github.com/harshdodiya58/" target="_blank" className="hover:text-foreground transition-colors">GitHub</Link></li>
                <li><Link href="/support" className="hover:text-foreground transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} DevLaunch AI. All rights reserved. <span className="block mt-1 font-medium">Developed by Harsh Dodiya.</span></p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { 
    title: 'Resume Engine', 
    description: 'Construct mathematically perfect, ATS-optimized resumes. Let AI instantly generate high-impact bullet points based on your raw experience.', 
    icon: <FileText className="h-6 w-6" /> 
  },
  { 
    title: 'Code Arena', 
    description: 'Solve real-world algorithmic challenges in an integrated environment. Receive instant, AI-driven code reviews and complexity analysis.', 
    icon: <Code className="h-6 w-6" /> 
  },
  { 
    title: 'Mock Interviews', 
    description: 'Simulate high-pressure technical interviews. Voice-to-text AI evaluates your behavioral and technical responses in real-time.', 
    icon: <Brain className="h-6 w-6" /> 
  },
  { 
    title: 'Kanban Tracker', 
    description: 'Visualize your entire application pipeline. Drag and drop jobs across stages and let AI predict your offer probability.', 
    icon: <Briefcase className="h-6 w-6" /> 
  },
  {
    title: 'Neural Twin',
    description: 'Spawn an autonomous AI clone of yourself to battle our AI Recruiter. Watch them converse in real-time to spot your weak points.',
    icon: <Zap className="h-6 w-6" />
  },
  {
    title: 'Project Architect',
    description: 'Input any app idea. Our AI will instantly architect the entire tech stack and output a gorgeous Mermaid blueprint graph.',
    icon: <CheckCircle2 className="h-6 w-6" />
  }
];
