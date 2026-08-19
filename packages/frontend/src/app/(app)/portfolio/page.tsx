'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Globe, ExternalLink, Upload, Loader2, Save, CheckCircle2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PortfolioPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => apiService.portfolio.getMine().then(r => r.data.data),
  });

  const [slugValue, setSlugValue] = useState('');
  const [slugInitialized, setSlugInitialized] = useState(false);

  // Initialize slug from portfolio data once loaded
  if (portfolio?.slug && !slugInitialized) {
    setSlugValue(portfolio.slug);
    setSlugInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiService.portfolio.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      toast({ title: 'Portfolio Updated', description: 'Your portfolio settings have been saved.' });
    },
    onError: (err: any) => {
      toast({ title: 'Update Failed', description: err.message, variant: 'destructive' });
    }
  });

  const downloadMutation = useMutation({
    mutationFn: () => apiService.portfolio.download(),
    onSuccess: (res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-portfolio.html');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({ title: 'Download Started', description: 'Your portfolio website has been downloaded.' });
    },
    onError: (err: any) => {
      toast({ title: 'Download Failed', description: err.message || 'Failed to download website', variant: 'destructive' });
    }
  });

  const [resumeText, setResumeText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bioMutation = useMutation({
    mutationFn: () => apiService.portfolio.generateBio({ resumeText }),
    onSuccess: (res) => {
      updateMutation.mutate({ sections: { ...portfolio?.sections, ...res.data.data } });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    },
    onError: (err: any) => {
      const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to generate AI bio';
      toast({ title: 'Generation Failed', description: errorMsg, variant: 'destructive' });
    }
  });

  const extractMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      return apiService.portfolio.extractText(formData);
    },
    onSuccess: (res) => {
      const text = res.data.data.extractedText;
      if (text && text.trim().length > 0) {
        setResumeText(text);
        toast({ title: 'PDF Extracted', description: 'Resume text has been extracted. Click "Generate Full Website" to build your portfolio.' });
      } else {
        toast({ title: 'Extraction Issue', description: 'Could not extract text from this PDF. Try pasting your resume text manually.', variant: 'destructive' });
      }
    },
    onError: (err: any) => {
      toast({ title: 'Upload Failed', description: err?.response?.data?.error?.message || 'Failed to extract text from file.', variant: 'destructive' });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    extractMutation.mutate(file);
    // Reset file input so the same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveSlug = () => {
    if (!slugValue.trim()) return;
    updateMutation.mutate({ slug: slugValue.trim() });
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Portfolio Builder</h1>
          <p className="text-xl font-light text-muted-foreground mt-1">Build and publish your public developer profile in one click.</p>
        </div>
        {portfolio && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2" onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isPending}>
              {downloadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {downloadMutation.isPending ? 'Downloading...' : 'Download Website'}
            </Button>
            <Button className="gap-2" asChild>
              <a href={`/u/${portfolio.slug}`} target="_blank"><ExternalLink className="h-4 w-4" /> View Live</a>
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile Settings</CardTitle><CardDescription>Customize your public portfolio</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div><Label>Portfolio URL</Label><p className="text-sm text-muted-foreground break-all">devlaunch.ai/u/{slugValue || portfolio?.slug}</p></div>
              <Switch defaultChecked={portfolio?.isPublic} onCheckedChange={(checked) => updateMutation.mutate({ isPublic: checked })} />
            </div>
            <div className="space-y-2">
              <Label>Custom Slug</Label>
              <div className="flex gap-2">
                <Input 
                  value={slugValue} 
                  onChange={(e) => setSlugValue(e.target.value)} 
                  placeholder="your-custom-slug"
                />
                <Button 
                  onClick={handleSaveSlug} 
                  disabled={updateMutation.isPending || !slugValue.trim() || slugValue === portfolio?.slug}
                  className="gap-2 shrink-0"
                >
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div><CardTitle>AI Portfolio Generator</CardTitle><CardDescription>Upload your resume PDF or paste text to generate a full website</CardDescription></div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={extractMutation.isPending || bioMutation.isPending}
                >
                  {extractMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {extractMutation.isPending ? 'Extracting...' : 'Upload PDF'}
                </Button>
                <Button size="sm" className="gap-2" onClick={() => bioMutation.mutate()} disabled={bioMutation.isPending || !resumeText.trim()}>
                  <Sparkles className="h-4 w-4" /> {bioMutation.isPending ? 'Generating...' : 'Generate Full Website'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              className="w-full min-h-[200px] rounded-md border border-input bg-transparent p-3 text-sm"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume here (Experience, Projects, Education, etc.). The AI will parse it and build your complete portfolio website!"
            />

            {showSuccess && (
              <div className="p-4 rounded-lg bg-muted border border-border">
                <p className="font-bold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Portfolio successfully generated!</p>
                <p className="text-sm text-muted-foreground mt-1">Click "View Live" to see your new website.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
