'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sparkles, Send, Trash2, Bot, User, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// ─── Helper: parse the AI response, detect off-topic JSON ─────────────────────
function parseAIReply(content: string): { offTopic: boolean; message: string } {
  if (!content) return { offTopic: false, message: '' };
  const trimmed = content.trim();

  // Try to detect JSON block (could be wrapped in code fences)
  const jsonMatch = trimmed.match(/```json\s*([\s\S]*?)```/) || trimmed.match(/({[\s\S]*})/);
  const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.offTopic === true && parsed.message) {
      return { offTopic: true, message: parsed.message };
    }
  } catch {
    // Not JSON — normal markdown reply
  }

  return { offTopic: false, message: content };
}

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: history } = useQuery({
    queryKey: ['chat-history'],
    queryFn: () => apiService.chat.history().then(r => r.data.data),
  });

  useEffect(() => {
    if (history) setLocalMessages(history);
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  const sendMutation = useMutation({
    mutationFn: (msg: string) => apiService.chat.send(msg),
    onSuccess: (res) => {
      const rawReply = res.data.data.reply || '';
      setLocalMessages(prev => [
        ...prev.filter(m => m.id !== 'temp-loading'),
        { role: 'assistant', content: rawReply, createdAt: new Date().toISOString() },
      ]);
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
    onError: (err: any) => {
      setLocalMessages(prev => prev.filter(m => m.id !== 'temp-loading'));
      toast({
        title: 'Failed to send message',
        description: err?.response?.data?.error?.message || 'The AI is currently unavailable.',
        variant: 'destructive',
      });
    }
  });

  const clearMutation = useMutation({
    mutationFn: () => apiService.chat.clear(),
    onSuccess: () => { 
      // Reset the cache to an empty array so no re-fetch restores old messages
      queryClient.setQueryData(['chat-history'], []);
      toast({ title: 'Chat cleared ✅', description: 'Your conversation history has been erased.' });
    },
    onError: () => {
      // Restore messages from cache on failure
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
      toast({ title: 'Failed to clear chat', description: 'Please try again.', variant: 'destructive' });
    }
  });

  const handleClear = () => {
    // Optimistically clear UI immediately
    setLocalMessages([]);
    clearMutation.mutate();
  };

  const handleSend = () => {
    if (!message.trim() || sendMutation.isPending) return;
    const msg = message;
    setMessage('');
    setLocalMessages(prev => [
      ...prev,
      { role: 'user', content: msg, createdAt: new Date().toISOString() },
      { id: 'temp-loading', role: 'assistant', content: '', createdAt: new Date().toISOString() }
    ]);
    sendMutation.mutate(msg);
  };

  const SUGGESTED = [
    'How do I prepare for a FAANG system design interview?',
    'Review my resume for a senior React developer role',
    'What skills do I need to become an Engineering Manager?',
    'How do I negotiate a higher salary offer?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-black tracking-tighter">Career AI</h1>
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Online
            </div>
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            Your personal 24/7 tech career advisor — specialized in resumes, interviews, and career growth.
          </p>
        </div>
        <Button 
          variant="outline" 
          className="gap-2 font-bold border-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors h-11 rounded-xl" 
          onClick={handleClear}
          disabled={localMessages.length === 0 || clearMutation.isPending}
        >
          <Trash2 className="h-4 w-4" /> Clear Context
        </Button>
      </div>

      {/* Scope badge */}
      <div className="flex items-center gap-2 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs font-semibold text-amber-700">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
        <span>DevLaunch AI is specialized for <strong>tech careers only</strong> — resumes, ATS, interviews, coding, job search, and developer career growth.</span>
      </div>

      {/* Messages */}
      <Card className="flex-1 overflow-y-auto p-6 space-y-6 mb-4 border border-border/50 shadow-sm rounded-2xl bg-muted/10 relative custom-scrollbar">
        {localMessages.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="h-20 w-20 bg-foreground text-background rounded-2xl flex items-center justify-center mb-6 shadow-xl">
              <Bot className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black mb-3">How can I help your career today?</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 text-sm font-medium">
              Ask me anything about resumes, ATS optimization, interview prep, job searching, salary negotiation, or tech career growth.
            </p>
            <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
              {SUGGESTED.map((q) => (
                <Button 
                  key={q} 
                  variant="outline" 
                  className="rounded-xl px-4 py-2 border border-border/60 text-sm font-semibold hover:border-foreground hover:bg-foreground hover:text-background transition-all" 
                  onClick={() => { setMessage(q); setTimeout(() => handleSend(), 50); }}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {localMessages.map((msg, i) => {
            const parsed = msg.role === 'assistant' && msg.content ? parseAIReply(msg.content) : null;
            const isOffTopic = parsed?.offTopic;

            return (
              <motion.div 
                key={msg.id || i} 
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <Avatar className={`h-9 w-9 border-2 shadow-sm shrink-0 mt-1 ${isOffTopic ? 'border-amber-400' : 'border-foreground'}`}>
                    <AvatarFallback className={`${isOffTopic ? 'bg-amber-100 text-amber-700' : 'bg-foreground text-background'}`}>
                      {isOffTopic ? <ShieldAlert className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] rounded-2xl p-5 ${
                  msg.role === 'user' 
                    ? 'bg-foreground text-background rounded-tr-sm shadow-md' 
                    : isOffTopic
                      ? 'bg-amber-50 border border-amber-200 rounded-tl-sm shadow-sm'
                      : 'bg-white border border-border/50 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.id === 'temp-loading' ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> 
                      <span className="text-sm font-medium">Thinking...</span>
                    </div>
                  ) : isOffTopic ? (
                    /* ─── Off-topic Redirect Card ─── */
                    <div>
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        Outside My Scope
                      </div>
                      <div className="text-sm text-amber-800 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-strong:text-amber-900 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{parsed?.message || ''}</ReactMarkdown>
                      </div>
                    </div>
                  ) : msg.role === 'assistant' ? (
                    /* ─── Normal AI Markdown Reply ─── */
                    <>
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:font-bold prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <p className="text-xs mt-3 text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  ) : (
                    /* ─── User Message ─── */
                    <>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs mt-2 text-background/60">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </>
                  )}
                </div>

                {msg.role === 'user' && (
                  <Avatar className="h-9 w-9 border-2 border-border shrink-0 mt-1">
                    <AvatarFallback className="bg-muted"><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Card>

      {/* Input */}
      <div className="relative">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask about resumes, interviews, career growth..."
          className="w-full h-14 pl-6 pr-16 text-base rounded-2xl border border-border/60 focus-visible:ring-foreground focus-visible:border-foreground shadow-sm"
          disabled={sendMutation.isPending}
        />
        <Button 
          className="absolute right-2 top-2 bottom-2 rounded-xl h-10 w-10 p-0 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all" 
          onClick={handleSend} 
          disabled={!message.trim() || sendMutation.isPending}
        >
          {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-2 font-medium">
        DevLaunch AI · Specialized in tech careers · Not for general use
      </p>
    </div>
  );
}
