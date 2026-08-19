'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Send, CheckCircle2, ArrowLeft, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

const domains = ['DSA', 'Frontend', 'Backend', 'System Design', 'Full Stack'];

export default function InterviewPage() {
  const [stage, setStage] = useState<'select' | 'session'>('select');
  const [type, setType] = useState('TECHNICAL');
  const [domain, setDomain] = useState('DSA');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [totalQ, setTotalQ] = useState(3);
  const [currentQuestionText, setCurrentQuestionText] = useState('');
  const [answer, setAnswer] = useState('');
  const [history, setHistory] = useState<{ q: string; a: string; feedback: any }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { toast } = useToast();

  let recognition: any = null;
  if (typeof window !== 'undefined') {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setAnswer(prev => {
          // simple logic to append or replace, for now we just append if it's final, or just replace for simplicity
          return currentTranscript;
        });
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }

  const toggleListen = () => {
    if (!recognition) {
      toast({ title: 'Not Supported', description: 'Voice recognition is not supported in this browser.', variant: 'destructive' });
      return;
    }
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setAnswer('');
      recognition.start();
      setIsListening(true);
    }
  };

  const speakText = (text: string) => {
    if (!isVoiceMode || typeof window === 'undefined') return;
    window.speechSynthesis.cancel(); // Stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a good voice
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
    if (goodVoice) utterance.voice = goodVoice;
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const startMutation = useMutation({
    mutationFn: () => apiService.interview.start({ type, domain }),
    onSuccess: (res) => {
      const data = res.data.data;
      setSessionId(data.sessionId);
      setCurrentQIndex(0);
      setTotalQ(data.totalQuestions);
      setCurrentQuestionText(data.currentQuestion.question);
      setHistory([]);
      setIsComplete(false);
      setAnswer('');
      setStage('session');
      if (isVoiceMode) {
        speakText(`Welcome to your ${type} interview for ${domain}. I am your AI interviewer. Let's begin. ${data.currentQuestion.question}`);
      }
    },
    onError: (err: any) => {
      let description = 'Something went wrong';
      const rawMessage = err?.response?.data?.error?.message || err.message;
      if (rawMessage?.includes('429') || rawMessage?.includes('Quota exceeded')) {
        description = 'Google AI Rate Limit Exceeded. Please wait 60 seconds and try again.';
      } else {
        description = rawMessage;
      }
      toast({
        title: 'Error starting interview',
        description,
        variant: 'destructive',
      });
    },
  });

  const submitMutation = useMutation({
    mutationFn: (answerText: string) => apiService.interview.submitAnswer(sessionId!, { questionIndex: currentQIndex, answer: answerText }),
    onSuccess: (res) => {
      const data = res.data.data;
      setHistory(prev => [...prev, { q: currentQuestionText, a: answer, feedback: data.feedback }]);
      setAnswer('');
      if (data.isComplete) {
        setIsComplete(true);
        setOverallScore(data.overallScore);
        if (isVoiceMode) {
          speakText(`Interview complete. Your overall score is ${(data.overallScore / 10).toFixed(1)} out of 10. You can review your detailed feedback below.`);
        }
      } else {
        setCurrentQuestionText(data.nextQuestion.question);
        setCurrentQIndex(data.nextQuestion.index);
        
        // Play the spoken feedback and the next question!
        if (isVoiceMode && data.feedback?.spokenFeedback) {
          speakText(`${data.feedback.spokenFeedback} ${data.nextQuestion.question}`);
        } else if (isVoiceMode) {
          speakText(`Okay, next question. ${data.nextQuestion.question}`);
        }
      }
    },
    onError: (err: any) => {
      let description = 'Failed to evaluate answer. Try again.';
      const rawMessage = err?.response?.data?.error?.message || err.message;
      if (rawMessage?.includes('429') || rawMessage?.includes('Quota exceeded')) {
        description = 'Google AI Rate Limit Exceeded. Please wait 60 seconds and try again.';
      } else {
        description = rawMessage;
      }
      toast({
        title: 'Error submitting answer',
        description,
        variant: 'destructive',
      });
    },
  });

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleSubmit = () => {
    if (!answer.trim()) return;
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    submitMutation.mutate(answer);
  };

  if (stage === 'session') {
    const progress = (currentQIndex / totalQ) * 100;

    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <div className="flex flex-col gap-4 border-b border-border pb-4">
          <Button variant="ghost" onClick={() => { setStage('select'); window.speechSynthesis.cancel(); }} className="w-fit text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" /> Exit Session
          </Button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Interview in Progress</h1>
            <Button variant="outline" size="sm" onClick={() => { setIsVoiceMode(!isVoiceMode); if (isVoiceMode) window.speechSynthesis.cancel(); }}>
              {isVoiceMode ? <><Volume2 className="h-4 w-4 mr-2 text-primary" /> Voice Mode ON</> : <><VolumeX className="h-4 w-4 mr-2" /> Voice Mode OFF</>}
            </Button>
          </div>
          <Progress value={isComplete ? 100 : progress} className="h-2" />

          {/* AI ORB / Avatar */}
          <div className="flex justify-center h-32 items-center relative">
            <div className={`absolute inset-0 bg-primary/20 blur-3xl rounded-full transition-all duration-1000 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
            <motion.div 
              animate={{ 
                scale: isSpeaking ? [1, 1.1, 1] : 1,
                boxShadow: isSpeaking ? ['0px 0px 0px rgba(0,0,0,0)', '0px 0px 40px rgba(var(--primary), 0.5)', '0px 0px 0px rgba(0,0,0,0)'] : 'none'
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-2xl"
            >
              <Brain className="h-10 w-10 text-white" />
            </motion.div>
          </div>
          <span className="text-sm text-center font-bold">{isComplete ? totalQ : currentQIndex + 1}/{totalQ}</span>
        </div>

        {isComplete ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Card className="border-2 border-foreground bg-background">
              <CardHeader className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-foreground mx-auto mb-6" />
                <CardTitle className="text-4xl font-black">Evaluation Complete</CardTitle>
                <CardDescription className="text-lg mt-2">Overall Score: <span className="font-bold text-foreground">{overallScore !== null ? (overallScore / 10).toFixed(1) : '-'} / 10</span></CardDescription>
              </CardHeader>
            </Card>
            
            <h3 className="text-2xl font-black tracking-tight mt-12 mb-6">Detailed Feedback</h3>
            <div className="space-y-8">
              {history.map((item, i) => (
                <Card key={i} className="bg-muted/30 border-border">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Badge className="mb-3 bg-foreground text-background">Question {i + 1}</Badge>
                      <p className="font-bold text-lg">{item.q}</p>
                    </div>
                    <div className="bg-background border border-border p-4 rounded-md">
                      <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Your Answer</p>
                      <p className="text-sm">{item.a}</p>
                    </div>
                    {item.feedback && (
                      <div className="bg-secondary/50 p-4 rounded-md border border-border">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">AI Evaluation</p>
                          <Badge variant="outline" className="font-bold">Score: {item.feedback.score}/10</Badge>
                        </div>
                        {item.feedback.strengths && (
                          <div className="mb-3">
                            <p className="text-xs font-bold mb-1">Strengths:</p>
                            <ul className="list-disc pl-4 text-sm text-muted-foreground">
                              {item.feedback.strengths.map((s: string, j: number) => <li key={j}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                        {item.feedback.areasForImprovement && (
                          <div>
                            <p className="text-xs font-bold mb-1">Areas for Improvement:</p>
                            <ul className="list-disc pl-4 text-sm text-muted-foreground">
                              {item.feedback.areasForImprovement.map((s: string, j: number) => <li key={j}>{s}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="w-full h-14 text-lg font-bold bg-foreground text-background" onClick={() => setStage('select')}>
              Start Another Session
            </Button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={currentQIndex}>
            <Card className="border-2 border-foreground shadow-lg">
              <CardHeader className="bg-foreground text-background rounded-t-xl py-8">
                <Badge className="w-fit bg-background text-foreground hover:bg-background/90 mb-4">{type} · {domain}</Badge>
                <CardTitle className="text-2xl font-black leading-tight">{currentQuestionText}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="mt-4 border-t pt-4">
                  <label className="text-sm font-semibold mb-2 block">Your Answer</label>
                  <div className="relative">
                    <textarea
                      className="w-full min-h-[250px] p-3 rounded-md bg-secondary/50 border focus:border-primary outline-none transition-colors resize-none pr-12"
                      placeholder={isListening ? "Listening..." : "Type your answer or use the microphone..."}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                    />
                    <Button 
                      size="icon" 
                      variant={isListening ? "destructive" : "secondary"} 
                      className={`absolute bottom-3 right-3 rounded-full ${isListening ? 'animate-pulse' : ''}`}
                      onClick={toggleListen}
                    >
                      {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-primary" />}
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full h-14 text-base font-bold gap-2 bg-foreground text-background hover:bg-foreground/90" 
                  onClick={handleSubmit} 
                  disabled={!answer.trim() || submitMutation.isPending}
                >
                  {submitMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} 
                  {submitMutation.isPending ? 'Evaluating with AI...' : 'Submit Answer'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter mb-2">AI Mock Interview</h1>
        <p className="text-xl text-muted-foreground font-light">Simulate high-pressure technical interviews with real-time AI evaluation.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border border-border hover:border-foreground transition-colors overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="text-2xl font-bold flex items-center gap-2"><Brain className="h-6 w-6" /> Technical Evaluation</CardTitle>
            <CardDescription className="text-base">Deep-dive technical questions graded on correctness and clarity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Select Domain</p>
              <div className="flex flex-wrap gap-2">
                {domains.map(d => (
                  <Badge 
                    key={d} 
                    variant={domain === d ? 'default' : 'outline'} 
                    className={`cursor-pointer px-4 py-2 text-sm ${domain === d ? 'bg-foreground text-background hover:bg-foreground/90' : 'hover:border-foreground'}`} 
                    onClick={() => setDomain(d)}
                  >
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
            <Button 
              className="w-full h-14 text-base font-bold bg-foreground text-background hover:bg-foreground/90" 
              onClick={() => { setType('TECHNICAL'); handleStart(); }}
              disabled={startMutation.isPending && type === 'TECHNICAL'}
            >
              {startMutation.isPending && type === 'TECHNICAL' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Initialize Technical Session
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border hover:border-foreground transition-colors overflow-hidden">
          <CardHeader className="bg-muted/30 pb-8">
            <CardTitle className="text-2xl font-bold">Behavioral & HR</CardTitle>
            <CardDescription className="text-base">Practice leadership principles and situational questions.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col justify-between h-[calc(100%-8rem)]">
            <p className="text-muted-foreground mb-8">
              The AI will evaluate your communication skills, empathy, and ability to structure answers using the STAR method.
            </p>
            <Button 
              variant="outline" 
              className="w-full h-14 text-base font-bold border-2 border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors" 
              onClick={() => { setType('BEHAVIORAL'); setDomain('GENERAL'); handleStart(); }}
              disabled={startMutation.isPending && type === 'BEHAVIORAL'}
            >
              {startMutation.isPending && type === 'BEHAVIORAL' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Initialize Behavioral Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
