export function generatePortfolioHtml(portfolio: any): string {
  const { user, sections } = portfolio;
  const bioSection = sections?.bio;
  const bioText = typeof bioSection === 'string' ? bioSection : bioSection?.bio || sections?.bio;
  const fullName = sections?.fullName || (typeof bioSection === 'object' ? bioSection?.fullName : null) || user.name;
  const taglineText = (typeof bioSection === 'object' ? bioSection?.tagline : null) || sections?.tagline;
  const targetRole = sections?.targetRole || (typeof bioSection === 'object' ? bioSection?.targetRole : null) || user.profile?.targetRole || 'Software Engineer';
  const locationText = sections?.location || (typeof bioSection === 'object' ? bioSection?.location : null) || user.profile?.location;
  const skills = sections?.skills || user.profile?.skills || [];

  const experienceHtml = (sections?.experience || []).map((exp: any) => `
    <div class="group">
      <div class="flex flex-col md:flex-row md:items-baseline justify-between mb-4 gap-2">
        <h3 class="font-serif text-2xl md:text-3xl font-light text-[#f4f0e6] group-hover:text-[#f95738] transition-colors">${exp.role}</h3>
        <span class="font-mono text-xs text-[#f4f0e6]/40 uppercase tracking-widest">${exp.duration}</span>
      </div>
      <div class="flex items-center gap-4 mb-6">
        <span class="text-[#f95738] font-medium">${exp.company}</span>
        <span class="w-1 h-1 rounded-full bg-[#f4f0e6]/20"></span>
        <span class="text-[#f4f0e6]/50 font-mono text-xs uppercase tracking-widest">${exp.location}</span>
      </div>
      <ul class="space-y-3">
        ${(exp.description || []).map((desc: string) => `
          <li class="text-[#f4f0e6]/70 leading-relaxed font-light flex gap-3">
            <span class="text-[#f95738] mt-1.5">—</span>
            <span>${desc}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  const projectsHtml = (sections?.projects || []).map((project: any) => `
    <div class="group border-b border-[#0f1014]/10 pb-16 last:border-0 last:pb-0">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 class="font-serif text-3xl md:text-4xl font-light">${project.title}</h3>
        ${project.link ? `<a href="${project.link}" target="_blank" class="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-[#f95738] transition-colors">View Project ↗</a>` : ''}
      </div>
      <ul class="space-y-3 mb-8">
        ${(project.description || []).map((desc: string) => `
          <li class="text-[#0f1014]/80 leading-relaxed font-light">${desc}</li>
        `).join('')}
      </ul>
      <div class="flex flex-wrap gap-2">
        ${(project.techStack || []).map((tech: string) => `
          <span class="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border border-[#0f1014]/20 rounded-full">${tech}</span>
        `).join('')}
      </div>
    </div>
  `).join('');

  const skillsHtml = skills.map((skill: string) => `
    <span class="font-serif text-xl md:text-2xl font-light text-[#f4f0e6] hover:text-[#f95738] transition-colors cursor-default">${skill}</span>
  `).join('');

  const educationHtml = (sections?.education || []).map((edu: any) => `
    <div class="flex flex-col md:flex-row md:items-baseline justify-between gap-2 border-l-2 border-[#f4f0e6]/10 pl-6">
      <div>
        <h4 class="font-serif text-xl text-[#f4f0e6]">${edu.degree}</h4>
        <p class="text-[#f4f0e6]/50 font-light mt-1">${edu.institution}</p>
      </div>
      <div class="flex flex-col md:items-end font-mono text-[10px] uppercase tracking-widest text-[#f4f0e6]/40">
        <span>${edu.duration}</span>
        ${edu.score ? `<span class="mt-1">${edu.score}</span>` : ''}
      </div>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fullName} - Portfolio</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=IBM+Plex+Mono:ital,wght@0,100..700;1,100..700&family=Inter:wght@100..900&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            serif: ['Fraunces', 'serif'],
            mono: ['"IBM Plex Mono"', 'monospace'],
            sans: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    ::selection { background-color: #f95738; color: white; }
  </style>
</head>
<body class="bg-[#0f1014] text-[#f4f0e6] antialiased overflow-x-hidden">

  <!-- Header -->
  <header class="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 md:px-10 bg-[#0f1014]/80 backdrop-blur-md border-b border-[#f4f0e6]/10">
    <div class="flex items-center gap-2">
      <span class="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
      <span class="font-serif text-lg italic tracking-tight">${fullName}<span class="text-[#f95738]">.</span></span>
    </div>
    <div class="hidden md:flex items-center gap-8 font-mono text-[11px] uppercase tracking-widest text-[#f4f0e6]/60">
      <a href="#about" class="hover:text-[#f95738] transition-colors">About</a>
      <a href="#experience" class="hover:text-[#f95738] transition-colors">Experience</a>
      <a href="#projects" class="hover:text-[#f95738] transition-colors">Projects</a>
      <a href="#contact" class="hover:text-[#f95738] transition-colors">Contact</a>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative min-h-screen flex flex-col justify-center px-6 md:px-10 pt-24 pb-12">
    <div class="absolute -right-32 top-16 w-[28rem] h-[28rem] rounded-full bg-[#f95738]/5 blur-[100px]"></div>
    <div class="absolute -left-40 bottom-10 w-[30rem] h-[30rem] rounded-full bg-emerald-500/5 blur-[100px]"></div>
    
    <div class="relative z-10 w-full max-w-7xl mx-auto flex flex-col justify-center">
      <p class="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50 mb-6 md:mb-10 animate-fade-in-up">
        ( ${targetRole} )
      </p>
      
      <h1 class="font-serif text-[clamp(3.5rem,10vw,8rem)] font-light leading-[0.9] tracking-tighter animate-fade-in-up" style="animation-delay: 0.1s">
        <span class="block">${fullName.split(' ')[0]}</span>
        <span class="block italic text-[#f4f0e6]/80 md:pl-[10vw]">
          ${fullName.split(' ').slice(1).join(' ')}<span class="text-[#f95738]">.</span>
        </span>
      </h1>

      <div class="mt-16 md:mt-24 grid md:grid-cols-2 gap-10 md:gap-20 items-end animate-fade-in-up" style="animation-delay: 0.3s">
        <p class="text-lg md:text-xl leading-relaxed text-[#f4f0e6]/70 max-w-md font-light">
          ${taglineText || `I design and build precise, scalable software — from backend systems to intuitive interfaces.`}
        </p>
        
        <div class="flex flex-col md:items-end gap-3 font-mono text-[11px] uppercase tracking-widest text-[#f4f0e6]/50">
          ${locationText ? `<span class="flex items-center gap-2">📍 ${locationText}</span>` : ''}
          <span class="flex items-center gap-2">✉ Available for work</span>
          <div class="flex gap-4 mt-2">
            ${user.profile?.githubUsername ? `<a href="https://github.com/${user.profile.githubUsername}" target="_blank" class="hover:text-[#f4f0e6] transition-colors">GitHub</a>` : ''}
            ${user.profile?.linkedinUrl ? `<a href="${user.profile.linkedinUrl}" target="_blank" class="hover:text-[#f4f0e6] transition-colors">LinkedIn</a>` : ''}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- About Section -->
  ${bioText ? `
  <section id="about" class="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
      <p class="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50">( About — 01 )</p>
      <div>
        <p class="font-serif text-[clamp(1.5rem,3vw,2.5rem)] font-light leading-snug tracking-tight">
          ${bioText}
        </p>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Experience Section -->
  ${experienceHtml ? `
  <section id="experience" class="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
      <p class="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50">( Experience — 02 )</p>
      <div class="space-y-16">
        ${experienceHtml}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Projects Section -->
  ${projectsHtml ? `
  <section id="projects" class="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10 bg-[#f4f0e6] text-[#0f1014]">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
      <p class="font-mono text-xs uppercase tracking-widest text-[#0f1014]/50">( Projects — 03 )</p>
      <div class="grid gap-16">
        ${projectsHtml}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Education & Skills Section -->
  <section class="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-[1fr_1.5fr] gap-16 lg:gap-24">
      <p class="font-mono text-xs uppercase tracking-widest text-[#f4f0e6]/50">( Arsenal — 04 )</p>
      <div class="space-y-24">
        
        ${skillsHtml ? `
        <div>
          <h3 class="font-serif text-2xl font-light mb-8 text-[#f95738]">Technologies</h3>
          <div class="flex flex-wrap gap-x-6 gap-y-3">
            ${skillsHtml}
          </div>
        </div>
        ` : ''}

        ${educationHtml ? `
        <div>
          <h3 class="font-serif text-2xl font-light mb-8 text-[#f95738]">Education</h3>
          <div class="space-y-8">
            ${educationHtml}
          </div>
        </div>
        ` : ''}

      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer id="contact" class="px-6 py-24 md:px-10 md:py-32 border-t border-[#f4f0e6]/10 bg-[#0f1014]">
    <div class="max-w-7xl mx-auto flex flex-col items-center text-center space-y-12">
      <h2 class="font-serif text-[clamp(3rem,8vw,6rem)] font-light leading-none tracking-tighter">
        Let's build <span class="italic text-[#f4f0e6]/50">together.</span>
      </h2>
      
      <a href="mailto:${user.email}" class="inline-flex items-center justify-center h-14 px-8 rounded-full bg-[#f4f0e6] text-[#0f1014] font-medium hover:bg-[#f95738] hover:text-white transition-all duration-300 gap-2">
        Get in touch ↗
      </a>

      <div class="flex gap-8 font-mono text-[11px] uppercase tracking-widest text-[#f4f0e6]/40 pt-12 border-t border-[#f4f0e6]/10 w-full justify-center">
        <span>© ${new Date().getFullYear()}</span>
        ${user.profile?.githubUsername ? `<a href="https://github.com/${user.profile.githubUsername}" target="_blank" class="hover:text-[#f95738] transition-colors">GitHub</a>` : ''}
        ${user.profile?.linkedinUrl ? `<a href="${user.profile.linkedinUrl}" target="_blank" class="hover:text-[#f95738] transition-colors">LinkedIn</a>` : ''}
      </div>
    </div>
  </footer>

  <style>
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fadeInUp 0.8s ease-out forwards;
      opacity: 0;
    }
  </style>
</body>
</html>
  `;
}
