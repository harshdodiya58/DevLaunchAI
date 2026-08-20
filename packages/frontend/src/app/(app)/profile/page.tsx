'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
  User, Mail, MapPin, Briefcase, Globe, Github, Linkedin,
  Sparkles, Save, ShieldCheck, CheckCircle2,
  Calendar, Layers, Plus, Trash2, ExternalLink,
  Code2, Camera, RefreshCw, KeyRound, LogOut,
} from 'lucide-react';
import Link from 'next/link';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
];

const SUGGESTED_SKILLS = [
  'React', 'Next.js', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS',
  'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'GraphQL', 'Prisma', 'Git',
  'System Design', 'FastAPI', 'Redis', 'Kubernetes'
];

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('general');
  const [skillInput, setSkillInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatarUrl: '',
    headline: '',
    bio: '',
    targetRole: '',
    location: '',
    linkedinUrl: '',
    githubUsername: '',
    websiteUrl: '',
    skills: [] as string[],
  });

  // Fetch full user and profile from backend
  const { data: profileData, isLoading, isFetching } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await apiService.auth.me();
      return res.data.data;
    },
  });

  // Initialize form when data loads
  useEffect(() => {
    if (profileData) {
      const p = profileData.profile || {};
      setFormData({
        name: profileData.name || user?.name || '',
        email: profileData.email || user?.email || '',
        avatarUrl: profileData.avatarUrl || user?.avatarUrl || '',
        headline: p.headline || '',
        bio: p.bio || '',
        targetRole: p.targetRole || '',
        location: p.location || '',
        linkedinUrl: p.linkedinUrl || '',
        githubUsername: p.githubUsername || '',
        websiteUrl: p.websiteUrl || '',
        skills: Array.isArray(p.skills) ? p.skills : [],
      });
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
      }));
    }
  }, [profileData, user]);

  // Mutation to save profile changes
  const saveMutation = useMutation({
    mutationFn: async (dataToSave: typeof formData) => {
      const res = await apiService.auth.updateProfile(dataToSave);
      return res.data.data;
    },
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      updateUser({
        name: updatedData.name,
        avatarUrl: updatedData.avatarUrl,
      });
      toast({
        title: 'Profile Updated! ✨',
        description: 'Your account and persona details have been saved successfully.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Save Failed',
        description: err?.response?.data?.error?.message || 'Could not update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleAddSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData(f => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(f => ({ ...f, skills: f.skills.filter(s => s !== skillToRemove) }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tighter">Account Settings</h1>
            <Badge variant="outline" className="font-mono text-xs uppercase px-2.5 py-1 border-foreground/30 bg-foreground/5">
              {profileData?.role || user?.role || 'STUDENT'}
            </Badge>
            {profileData?.isVerified && (
              <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-500 bg-emerald-500/10 font-bold text-xs">
                <ShieldCheck className="w-3 h-3" /> Verified
              </Badge>
            )}
          </div>
          <p className="text-lg font-light text-muted-foreground mt-1">
            Manage your personal persona, career profile, and security preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleSave()}
            disabled={saveMutation.isPending}
            className="gap-2 h-11 px-6 font-bold bg-foreground text-background hover:bg-foreground/90 shadow-xl"
          >
            {saveMutation.isPending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── User Overview Hero Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-3xl border-2 border-border bg-gradient-to-r from-card via-card to-muted/20 relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative group">
            <Avatar className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border-2 border-border shadow-2xl bg-muted overflow-hidden">
              <AvatarImage src={formData.avatarUrl || ''} className="object-cover" />
              <AvatarFallback className="text-3xl font-black bg-foreground text-background">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white text-xs font-bold gap-1">
              <Camera className="w-4 h-4" /> Edit
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight truncate">
              {formData.name || 'Your Name'}
            </h2>
            <p className="text-muted-foreground font-medium text-sm flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-3.5 h-3.5" /> {formData.email}
              {formData.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {formData.location}</span>
                </>
              )}
            </p>
            {formData.headline && (
              <p className="text-sm font-light text-foreground/80 pt-1 leading-relaxed max-w-2xl">
                {formData.headline}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              {formData.targetRole && (
                <Badge variant="secondary" className="gap-1.5 text-xs font-bold py-1 px-3">
                  <Briefcase className="w-3 h-3" /> {formData.targetRole}
                </Badge>
              )}
              {formData.githubUsername && (
                <Link
                  href={`https://github.com/${formData.githubUsername}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-mono bg-muted/80 hover:bg-muted px-3 py-1 rounded-full border border-border transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Github className="w-3 h-3" /> {formData.githubUsername}
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              )}
              {formData.linkedinUrl && (
                <Link
                  href={formData.linkedinUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-mono bg-muted/80 hover:bg-muted px-3 py-1 rounded-full border border-border transition-colors text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="w-3 h-3 text-blue-500" /> LinkedIn
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Main Tabbed Content ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="h-12 bg-muted/40 p-1 border border-border rounded-2xl w-full justify-start sm:w-auto">
          <TabsTrigger value="general" className="font-bold text-sm px-6 h-10 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="w-4 h-4 mr-2" /> General Info
          </TabsTrigger>
          <TabsTrigger value="persona" className="font-bold text-sm px-6 h-10 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" /> Career & Persona
          </TabsTrigger>
          <TabsTrigger value="skills" className="font-bold text-sm px-6 h-10 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Layers className="w-4 h-4 mr-2" /> Skills & Stack
          </TabsTrigger>
          <TabsTrigger value="security" className="font-bold text-sm px-6 h-10 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShieldCheck className="w-4 h-4 mr-2" /> Account Security
          </TabsTrigger>
        </TabsList>

        {/* ── TAB 1: General Info ── */}
        <TabsContent value="general" className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50 pb-5">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" /> Personal Details
              </CardTitle>
              <CardDescription>
                Basic contact information used across resume exports and portfolio pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Alex Johnson"
                    className="h-12 border-2 border-border focus:border-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground flex items-center justify-between">
                    <span>Email Address</span>
                    <span className="text-[10px] text-muted-foreground lowercase">(primary account login)</span>
                  </Label>
                  <Input
                    value={formData.email}
                    disabled
                    className="h-12 border-2 border-border/50 bg-muted/30 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. San Francisco, CA or Vadodara, India"
                    className="h-12 border-2 border-border focus:border-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">Target Role</Label>
                  <Input
                    value={formData.targetRole}
                    onChange={e => setFormData(f => ({ ...f, targetRole: e.target.value }))}
                    placeholder="e.g. Full Stack Engineer"
                    className="h-12 border-2 border-border focus:border-foreground"
                  />
                </div>
              </div>

              {/* Avatar Preset Chooser */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Avatar Image URL</Label>
                <Input
                  value={formData.avatarUrl}
                  onChange={e => setFormData(f => ({ ...f, avatarUrl: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-12 border-2 border-border focus:border-foreground"
                />

                <div className="space-y-2 pt-2">
                  <span className="text-xs text-muted-foreground font-medium">Or pick a quick avatar preset:</span>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, avatarUrl: url }))}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                          formData.avatarUrl === url
                            ? 'border-foreground ring-2 ring-foreground/20 scale-105'
                            : 'border-border opacity-70 hover:opacity-100 hover:border-foreground/50'
                        }`}
                      >
                        <img src={url} alt={`Avatar ${i}`} className="w-10 h-10 object-cover rounded-lg" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Career & Persona ── */}
        <TabsContent value="persona" className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50 pb-5">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-muted-foreground" /> Career Persona & Bio
              </CardTitle>
              <CardDescription>
                Craft your executive bio and professional headline for AI assistants and employers.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">Professional Headline</Label>
                <Input
                  value={formData.headline}
                  onChange={e => setFormData(f => ({ ...f, headline: e.target.value }))}
                  placeholder="e.g. Senior Frontend Engineer | React, TypeScript & Web Performance Specialist"
                  className="h-12 border-2 border-border focus:border-foreground font-medium"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="font-bold text-xs uppercase text-muted-foreground">About / Bio</Label>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formData.bio.length} characters
                  </span>
                </div>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                  rows={5}
                  placeholder="Share your background, engineering passions, and the kind of impact you drive..."
                  className="w-full rounded-xl border-2 border-border bg-transparent p-4 text-sm focus-visible:outline-none focus-visible:border-foreground resize-none leading-relaxed"
                />
              </div>

              {/* Socials & Links */}
              <div className="pt-4 border-t border-border/50 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Online Links & Socials</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" /> GitHub Username
                    </Label>
                    <Input
                      value={formData.githubUsername}
                      onChange={e => setFormData(f => ({ ...f, githubUsername: e.target.value }))}
                      placeholder="e.g. octocat"
                      className="h-12 border-2 border-border focus:border-foreground font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5" /> LinkedIn URL
                    </Label>
                    <Input
                      value={formData.linkedinUrl}
                      onChange={e => setFormData(f => ({ ...f, linkedinUrl: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="h-12 border-2 border-border focus:border-foreground text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-xs uppercase text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Personal Website
                    </Label>
                    <Input
                      value={formData.websiteUrl}
                      onChange={e => setFormData(f => ({ ...f, websiteUrl: e.target.value }))}
                      placeholder="https://yourportfolio.dev"
                      className="h-12 border-2 border-border focus:border-foreground text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 3: Skills & Stack ── */}
        <TabsContent value="skills" className="space-y-6">
          <Card className="border border-border">
            <CardHeader className="border-b border-border/50 pb-5">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-muted-foreground" /> Tech Stack & Skills
              </CardTitle>
              <CardDescription>
                These skills power your ATS checker, roadmap matches, and AI portfolio builder.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Input for custom skill */}
              <div className="flex gap-3">
                <Input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder="Type a skill (e.g. Next.js, Docker, Python) and press Enter"
                  className="h-12 border-2 border-border focus:border-foreground font-medium"
                />
                <Button
                  type="button"
                  onClick={() => handleAddSkill(skillInput)}
                  className="h-12 px-6 font-bold gap-1.5 border-2"
                  variant="outline"
                >
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </div>

              {/* Current skills list */}
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-muted-foreground">
                  Active Skills ({formData.skills.length})
                </Label>
                {formData.skills.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">
                    <Code2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No skills added yet.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Click suggestions below or type your top languages & frameworks.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl border-2 border-border/60 bg-muted/10 min-h-[80px] items-center">
                    {formData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-sm font-bold py-1.5 px-3.5 gap-2 border border-border flex items-center group transition-all"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-muted-foreground hover:text-red-500 transition-colors ml-0.5"
                          title="Remove skill"
                        >
                          ✕
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Suggested Skills */}
              <div className="space-y-3 pt-3 border-t border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Quick Add Suggestions:
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-border/80 bg-card hover:border-foreground hover:bg-muted transition-all flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="w-3 h-3" /> {skill}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 4: Security & Account ── */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border">
              <CardHeader className="border-b border-border/50 pb-5">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-muted-foreground" /> Security & Account Status
                </CardTitle>
                <CardDescription>
                  Your account verification, role level, and authentication details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div>
                    <p className="font-bold text-sm">Account Status</p>
                    <p className="text-xs text-muted-foreground">Email identity validation</p>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 font-bold">
                    Active & Verified
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/40">
                  <div>
                    <p className="font-bold text-sm">Role Privilege</p>
                    <p className="text-xs text-muted-foreground">Platform access level</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold">
                    {profileData?.role || user?.role || 'STUDENT'}
                  </Badge>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="font-bold text-sm">User ID</p>
                    <p className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {profileData?.id || user?.id || '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border">
              <CardHeader className="border-b border-border/50 pb-5">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
                  <LogOut className="w-5 h-5" /> Session & Logout
                </CardTitle>
                <CardDescription>
                  Manage active session and disconnect from this device.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Logging out will securely clear your local session tokens and redirect you to the main landing page.
                </p>

                <div className="pt-4">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      logout();
                      window.location.href = '/';
                    }}
                    className="w-full h-12 font-bold gap-2 rounded-xl"
                  >
                    <LogOut className="w-4 h-4" /> Disconnect & Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Sticky Action Bar */}
      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Link href="/dashboard">
          <Button variant="outline" className="h-12 px-6 font-bold border-2">
            Back to Dashboard
          </Button>
        </Link>
        <Button
          onClick={() => handleSave()}
          disabled={saveMutation.isPending}
          className="gap-2 h-12 px-8 font-bold bg-foreground text-background hover:bg-foreground/90 shadow-xl"
        >
          {saveMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
