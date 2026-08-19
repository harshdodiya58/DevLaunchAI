'use client';

import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, CheckCircle2, Loader2, Upload, Wand2, Download, Copy, RotateCcw, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function ATSPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<any>(null);
  const [enhancedResume, setEnhancedResume] = useState('');
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null);

  const historyQuery = useQuery({
    queryKey: ['atsHistory'],
    queryFn: () => apiService.ats.getHistory().then(res => res.data.data)
  });

  useEffect(() => {
    const savedResume = localStorage.getItem('ats_resumeText');
    const savedJob = localStorage.getItem('ats_jobDescription');
    const savedResult = localStorage.getItem('ats_result');
    const savedEnhanced = localStorage.getItem('ats_enhancedResume');

    if (savedResume) setResumeText(savedResume);
    if (savedJob) setJobDescription(savedJob);
    if (savedResult) setResult(JSON.parse(savedResult));
    if (savedEnhanced) setEnhancedResume(savedEnhanced);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('ats_resumeText', resumeText);
  }, [resumeText, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('ats_jobDescription', jobDescription);
  }, [jobDescription, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (result) localStorage.setItem('ats_result', JSON.stringify(result));
      else localStorage.removeItem('ats_result');
    }
  }, [result, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem('ats_enhancedResume', enhancedResume);
  }, [enhancedResume, isLoaded]);

  const [isAutoTailoring, setIsAutoTailoring] = useState(false);

  const analyzeMutation = useMutation({
    mutationFn: (data: { resumeText: string; jobDescription?: string }) =>
      apiService.ats.analyze(data),
    onSuccess: (res) => {
      setResult(res.data.data);
      setHistoryId(res.data.data.historyId || null);
      historyQuery.refetch();
        toast({ title: 'Analysis Complete', description: 'Your resume has been successfully scored.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Analysis Failed',
        description: err?.response?.data?.error?.message || 'Failed to analyze resume text.',
        variant: 'destructive'
      });
    }
  });

  const handleAnalyze = () => {
    if (!resumeText.trim()) return;
    setEnhancedResume(''); // reset enhancement
    analyzeMutation.mutate({ resumeText, jobDescription: jobDescription.trim() || undefined });
  };

  const enhanceMutation = useMutation({
    mutationFn: () => apiService.ats.enhance({ resumeText, jobDescription: jobDescription.trim() || undefined, atsIssues: result?.issues, historyId }),
    onSuccess: (res) => {
      setEnhancedResume(res.data.data.enhancedResume);
      historyQuery.refetch();
      toast({ title: 'Resume Enhanced', description: 'AI has completely rewritten your resume!' });
    },
    onError: (err: any) => {
      toast({
        title: 'Enhancement Failed',
        description: err?.response?.data?.error?.message || 'Failed to enhance resume.',
        variant: 'destructive'
      });
    }
  });

  const handleDownloadPDF = () => {
    // We use native print dialog instead of html2pdf so the resulting PDF contains actual text,
    // which allows the ATS checker (and real-world ATS systems) to parse it correctly.
    // The CSS @media print rules already hide everything except the raw text resume.
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleReset = () => {
    setResumeText('');
    setJobDescription('');
    setResult(null);
    setEnhancedResume('');
    setHistoryId(null);
    localStorage.removeItem('ats_resumeText');
    localStorage.removeItem('ats_jobDescription');
    localStorage.removeItem('ats_result');
    localStorage.removeItem('ats_enhancedResume');
    toast({ title: 'Reset Successful', description: 'Ready for a new resume analysis.' });
  };

  const loadHistoryItem = (item: any) => {
    setResumeText(item.resumeText || '');
    setJobDescription(item.jobDescription || '');
    setResult({
      score: item.score,
      sectionScores: item.metrics,
      issues: item.issues,
      strengths: item.strengths,
      missingKeywords: item.missingKeywords,
    });
    setEnhancedResume(item.enhancedResume || '');
    setHistoryId(item.id);
    setHistoryOpen(false);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription.trim());
      }
      return apiService.ats.upload(formData);
    },
    onSuccess: (res) => {
      setResult(res.data.data);
      if (res.data.data.extractedText) {
        setResumeText(res.data.data.extractedText);
      }
      toast({ title: 'Analysis Complete', description: 'Your uploaded resume has been analyzed.' });
    },
    onError: (err: any) => {
      toast({
        title: 'Upload Failed',
        description: err?.response?.data?.error?.message || 'Failed to analyze uploaded file.',
        variant: 'destructive'
      });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: "\n        @media print {\n          body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; }\n          @page { size: letter portrait; margin: 0; }\n        }\n      " }} />

      {/* Main UI - Hidden during print */}
      <div className="space-y-8 max-w-7xl mx-auto py-8 print:hidden">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">ATS Analyzer</h1>
            <p className="text-xl font-light text-muted-foreground mt-1">Audit your resume against enterprise Applicant Tracking Systems.</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 shrink-0">
                  <History className="h-4 w-4" /> History
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Past ATS Scans</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {historyQuery.isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading history...</p>
                  ) : historyQuery.isError ? (
                    <div className="text-center py-4 text-destructive">
                      <p className="font-bold">Failed to load history</p>
                      <p className="text-sm">Please make sure you restarted your backend server.</p>
                    </div>
                  ) : !historyQuery.data || historyQuery.data.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No past scans found.</p>
                  ) : (
                    historyQuery.data.map((item: any) => (
                      <div key={item.id} className="border-2 border-border rounded-lg p-4 flex justify-between items-center hover:border-foreground transition-colors cursor-pointer" onClick={() => loadHistoryItem(item)}>
                        <div>
                          <p className="font-bold text-lg">Score: {item.score}</p>
                          <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <Badge variant={item.enhancedResume ? 'default' : 'secondary'}>{item.enhancedResume ? 'Enhanced' : 'Scanned'}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
            {(resumeText || result) && (
              <Button variant="default" onClick={handleReset} className="gap-2 shrink-0 bg-foreground text-background">
                <RotateCcw className="h-4 w-4" /> New Analysis
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-2 border-border shadow-sm h-full">
              <CardHeader className="bg-muted/20 border-b border-border pb-6">
                <CardTitle className="text-2xl font-bold">Input Data</CardTitle>
                <CardDescription className="text-base">Paste your raw resume text and the target job description.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold uppercase tracking-wider">Resume Text</p>
                    <div>
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
                        className="h-8 text-xs font-bold gap-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadMutation.isPending || analyzeMutation.isPending}
                      >
                        {uploadMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload PDF'}
                      </Button>
                    </div>
                  </div>
                  <textarea
                    className="w-full min-h-[300px] rounded-lg border-2 border-input bg-background p-4 text-sm font-mono focus-visible:ring-foreground focus-visible:border-foreground resize-none"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume content here or upload a PDF/DOCX file..."
                    disabled={analyzeMutation.isPending || uploadMutation.isPending}
                  />
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold uppercase tracking-wider">Job Description <span className="text-muted-foreground font-normal lowercase">(optional)</span></p>
                  <textarea
                    className="w-full min-h-[150px] rounded-lg border-2 border-input bg-background p-4 text-sm focus-visible:ring-foreground focus-visible:border-foreground resize-none"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste target job description for precise keyword matching..."
                    disabled={analyzeMutation.isPending || uploadMutation.isPending}
                  />
                </div>
                <Button
                  className="w-full h-14 text-base font-bold gap-2 bg-foreground text-background hover:bg-foreground/90 mt-4"
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || isAutoTailoring || !resumeText.trim()}
                >
                  {(analyzeMutation.isPending || isAutoTailoring) ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                  {isAutoTailoring ? 'Generating Perfect Resume...' : analyzeMutation.isPending ? 'Running Deep Analysis...' : jobDescription.trim() ? 'Analyze & Auto-Tailor' : 'Analyze Resume'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="border-2 border-foreground shadow-lg h-full bg-muted/5 relative overflow-hidden">
              <CardHeader className="bg-foreground text-background rounded-t-lg pb-6">
                <CardTitle className="text-2xl font-black">Audit Results</CardTitle>
                <CardDescription className="text-background/80 text-base">Mathematical breakdown of your ATS compatibility.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                {analyzeMutation.isPending || uploadMutation.isPending || enhanceMutation.isPending ? (
                  <div className="space-y-8 py-12 flex flex-col items-center justify-center opacity-50">
                    <Loader2 className="h-16 w-16 animate-spin text-foreground" />
                    <p className="font-bold text-lg animate-pulse">
                      {enhanceMutation.isPending ? 'AI is completely rewriting your resume...' : 'Scanning keywords and formatting...'}
                    </p>
                  </div>
                ) : result ? (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                      <div className="text-center">
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Overall Score</p>
                        <div className="text-8xl font-black tracking-tighter mb-4 leading-none">{result.score || 0}<span className="text-3xl text-muted-foreground font-light">/100</span></div>
                        <Badge variant="outline" className={`px-6 py-2 text-base font-bold border-2 ${result.score >= 80 ? 'border-foreground bg-foreground text-background' : 'border-border'}`}>
                          {result.score >= 80 ? 'Exceptional Match' : result.score >= 50 ? 'Requires Revision' : 'Critical Issues Detected'}
                        </Badge>
                      </div>

                      <div className="space-y-6 bg-background border-2 border-border p-6 rounded-xl">
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Detailed Metrics</p>
                        {(result.sectionScores || result.metrics) ? Object.entries(result.sectionScores || result.metrics).map(([key, val]: any) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between text-sm font-bold"><span className="capitalize">{key}</span><span>{val}/100</span></div>
                            <Progress value={val} className="h-2" />
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">Detailed metrics unavailable.</p>
                        )}
                      </div>

                      <div className="grid gap-6">
                        {result.strengths?.length > 0 && (
                          <div className="bg-background border-2 border-border rounded-xl p-6">
                            <p className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> Positive Indicators</p>
                            <ul className="space-y-3">
                              {result.strengths.map((s: string, i: number) => (
                                <li key={i} className="text-sm font-medium pl-6 relative before:content-[''] before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:bg-foreground before:rounded-full">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.issues?.length > 0 && (
                          <div className="bg-background border-2 border-border rounded-xl p-6">
                            <p className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Critical Issues</p>
                            <div className="space-y-4">
                              {result.issues.map((issue: any, i: number) => (
                                <div key={i} className="pl-4 border-l-4 border-foreground">
                                  <p className="text-sm font-bold capitalize mb-1">{issue.section}</p>
                                  <p className="text-sm text-muted-foreground mb-2">{issue.issue}</p>
                                  <div className="bg-muted p-3 rounded-md">
                                    <p className="text-xs font-bold uppercase tracking-wider mb-1">Recommendation</p>
                                    <p className="text-sm font-medium">{issue.suggestion}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {result.missingKeywords?.length > 0 && (
                          <div className="bg-background border-2 border-border rounded-xl p-6">
                            <p className="text-sm font-bold uppercase tracking-widest mb-4">Missing Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {result.missingKeywords.map((k: string) => (
                                <Badge key={k} variant="outline" className="border-2 border-dashed font-medium py-1.5 px-3">
                                  {k}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {!enhancedResume ? (
                          <Button
                            onClick={() => enhanceMutation.mutate()}
                            disabled={enhanceMutation.isPending}
                            className="w-full h-14 text-base font-bold gap-2 bg-foreground text-background hover:bg-foreground/90 mt-8"
                          >
                            <Wand2 className="h-5 w-5" />
                            Auto-Enhance Resume
                          </Button>
                        ) : (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-background border-2 border-border rounded-xl p-6 mt-8">
                            <div className="flex flex-col gap-4 mb-4">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><Wand2 className="h-5 w-5" /> AI Enhanced Resume</p>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(enhancedResume); toast({ title: 'Copied to clipboard' }) }}><Copy className="h-4 w-4 mr-2" /> Copy</Button>
                                  <Button variant="default" size="sm" className="bg-foreground hover:bg-foreground/90 text-background" onClick={handleDownloadPDF}><Download className="h-4 w-4 mr-2" /> Export PDF</Button>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">You can edit the raw markdown below before exporting. Click Export PDF to preview the formatted document.</p>
                            </div>
                            <textarea
                              className="w-full min-h-[400px] rounded-lg border-2 border-input bg-background p-4 text-sm font-mono focus-visible:ring-foreground focus-visible:border-foreground resize-y"
                              value={enhancedResume}
                              onChange={(e) => setEnhancedResume(e.target.value)}
                            />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/20 min-h-[300px] rounded-b-lg">
                    <div className="h-24 w-24 border-4 border-dashed border-foreground/20 rounded-full flex items-center justify-center mb-6">
                      <FileText className="h-10 w-10 text-foreground/40" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Awaiting Data</h3>
                    <p className="text-muted-foreground max-w-sm">Provide your resume and job description to generate a comprehensive ATS compatibility report.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div id="ats-resume-print" className="hidden print:block bg-white text-black font-sans text-[11pt] leading-[1.3] mx-auto w-full">
        <style dangerouslySetInnerHTML={{ __html: "\n          .print-resume h1 { text-align: center; }\n          .print-resume h1 + p { text-align: center; margin-bottom: 1rem; }\n        " }} />
        <ReactMarkdown
          className="print-resume"
          components={{
            h1: ({ node, ...props }) => <h1 className="text-[24pt] font-black uppercase tracking-tight mb-1" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-[12pt] font-bold border-b-[1.5px] border-black uppercase tracking-wider pb-2 mb-2 mt-4 break-after-avoid" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-[11pt] font-bold mt-3 mb-1 uppercase break-after-avoid" {...props} />,
            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-0.5 break-inside-avoid" {...props} />,
            p: ({ node, ...props }) => <p className="mb-2 break-inside-avoid whitespace-pre-wrap" {...props} />,
            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
          }}
        >
          {enhancedResume}
        </ReactMarkdown>
      </div>
    </>
  );
}
