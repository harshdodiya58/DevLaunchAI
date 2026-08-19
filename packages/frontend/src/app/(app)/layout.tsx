'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard, FileText, Search, UserSquare2, Code2, Brain, Briefcase, MessageSquareText, MapPin, Sparkles, LogOut, Component, Ghost, Bot, Github
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Primary items that go directly in the dock
const dockItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/resume', label: 'Resume Builder', icon: FileText },
  { href: '/ats', label: 'ATS Checker', icon: Search },
  { href: '/portfolio', label: 'Portfolio', icon: UserSquare2 },
  { href: '/jobs', label: 'Job Tracker', icon: Briefcase },
  { href: '/roadmaps', label: 'Roadmaps', icon: MapPin },
  { href: '/interview', label: 'Mock Interview', icon: Brain },
  { href: '/chat', label: 'AI Career Chat', icon: MessageSquareText },
];

// Secondary items that go in the "More Tools" dropdown
const secondaryItems = [
  { href: '/simulator', label: 'Neural Twin', icon: Ghost },
  { href: '/agent', label: 'Autonomous Agent', icon: Bot },
  { href: '/architect', label: 'Project Architect', icon: Component },
  { href: '/github', label: 'GitHub Analytics', icon: Github },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted) {
    return <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]"><Sparkles className="h-8 w-8 text-foreground animate-pulse" /></div>;
  }

  if (!isAuthenticated || !user) return null;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-[#fafafa] font-sans relative selection:bg-foreground/10 selection:text-foreground">
        
        {/* Main Content Area */}
        <main className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-24 min-h-screen">
          {children}
        </main>

        {/* The Premium Floating Dock */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 print:hidden w-full max-w-full px-4 sm:w-auto pointer-events-none flex justify-center">
          <nav className="pointer-events-auto flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-[#1c202a]/95 backdrop-blur-xl rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)_inset] border border-white/10 overflow-x-auto custom-scrollbar max-w-full">
            
            {dockItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className="shrink-0">
                      <div className={cn(
                        "relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 group hover:scale-110",
                        isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/10 hover:text-white"
                      )}>
                        <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px] transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={isActive ? 2.5 : 2} />
                        {isActive && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={16} className="bg-[#1c202a] text-white border-white/10 font-bold text-xs rounded-lg px-3 py-1.5 shadow-xl animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            <Separator orientation="vertical" className="h-8 bg-white/10 mx-1 sm:mx-2 shrink-0" />

            {/* "More Tools" Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger className="shrink-0 outline-none">
                    <div className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 text-white/50 hover:bg-white/10 hover:text-white hover:scale-110 group">
                      <Component className="h-5 w-5 sm:h-[22px] sm:w-[22px] transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2} />
                    </div>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={16} className="bg-[#1c202a] text-white border-white/10 font-bold text-xs rounded-lg px-3 py-1.5 shadow-xl animate-in fade-in zoom-in-95">
                  More Tools
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent side="top" align="center" sideOffset={24} className="w-52 bg-[#1c202a]/95 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                <DropdownMenuLabel className="text-[11px] text-white/50 font-bold px-2 uppercase tracking-wider mb-1">Advanced Tools</DropdownMenuLabel>
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}>
                      <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 cursor-pointer focus:bg-white/10 focus:text-white rounded-lg transition-colors">
                        <Icon className="h-4 w-4 text-white/70" />
                        <span className="font-bold text-sm">{item.label}</span>
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-8 bg-white/10 mx-1 sm:mx-2 shrink-0" />

            {/* User Profile Menu */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger className="shrink-0 outline-none">
                    <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer shadow-lg bg-[#1c202a]">
                      <AvatarImage src={user.avatarUrl || ''} />
                      <AvatarFallback className="bg-transparent text-white font-black text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={16} className="bg-[#1c202a] text-white border-white/10 font-bold text-xs rounded-lg px-3 py-1.5 shadow-xl animate-in fade-in zoom-in-95">
                  My Profile
                </TooltipContent>
              </Tooltip>

              <DropdownMenuContent side="top" align="end" sideOffset={24} className="w-60 bg-[#1c202a]/95 backdrop-blur-xl border-white/10 text-white rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-start gap-3 p-3 bg-white/5 rounded-lg mb-2">
                  <Avatar className="h-10 w-10 border border-white/20 bg-[#1c202a]">
                    <AvatarImage src={user.avatarUrl || ''} />
                    <AvatarFallback className="bg-transparent text-white font-black text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-0.5 leading-none min-w-0">
                    <p className="font-bold text-sm truncate">{user.name}</p>
                    <p className="text-xs text-white/50 font-medium truncate">{user.email}</p>
                  </div>
                </div>
                
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white rounded-lg px-3 py-2.5 mb-1">
                    <UserSquare2 className="mr-3 h-4 w-4 text-white/70" />
                    <span className="font-bold text-sm">Account Settings</span>
                  </DropdownMenuItem>
                </Link>
                
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem className="cursor-pointer focus:bg-red-500/20 focus:text-red-400 text-red-400 rounded-lg px-3 py-2.5 mt-1 transition-colors" onClick={() => { logout(); router.push('/'); }}>
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="font-bold text-sm">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}
