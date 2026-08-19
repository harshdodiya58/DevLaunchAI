'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Linkedin, Globe, Mail, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function PublicPortfolioPage({ params }: { params: { slug: string } }) {
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio', params.slug],
    queryFn: () => apiService.portfolio.getBySlug(params.slug).then(r => r.data.data),
    retry: false,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Skeleton className="h-96 w-full max-w-2xl" /></div>;
  if (error) return notFound();

  const sections = portfolio?.sections as any;
  const profile = portfolio?.user?.profile as any;
  const user = portfolio?.user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container max-w-3xl mx-auto py-12 px-4">
        <Card className="mb-8">
          <CardContent className="p-8 text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-primary">
              {user?.name?.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold mb-2">{user?.name}</h1>
            <p className="text-lg text-muted-foreground mb-4">{profile?.headline || profile?.targetRole || 'Developer'}</p>
            <div className="flex justify-center gap-3 mb-4">
              {profile?.githubUsername && <a href={`https://github.com/${profile.githubUsername}`} target="_blank" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>}
              {profile?.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>}
              {profile?.websiteUrl && <a href={profile.websiteUrl} target="_blank" className="text-muted-foreground hover:text-foreground"><Globe className="h-5 w-5" /></a>}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {(profile?.skills as string[])?.map((skill: string) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {sections?.bio && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-muted-foreground">{sections.bio}</p>
            </CardContent>
          </Card>
        )}

        {portfolio?.viewCount !== undefined && (
          <p className="text-center text-sm text-muted-foreground">
            {portfolio.viewCount} profile views
          </p>
        )}
      </div>
    </div>
  );
}
