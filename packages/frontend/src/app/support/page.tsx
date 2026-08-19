import Link from 'next/link';
import { ArrowLeft, LifeBuoy, Mail, MessageSquare, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12 text-center md:text-left">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:opacity-70 transition-opacity flex items-center gap-2 mb-6 mx-auto md:mx-0">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 justify-center md:justify-start">
            <div className="h-12 w-12 bg-foreground rounded-xl flex items-center justify-center">
              <LifeBuoy className="h-6 w-6 text-background" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Support Center</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto md:mx-0">
            Need help configuring your Neural Twin or debugging your AI Resume? We're here to help you get back to shipping.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-background border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="font-bold mb-2">Community Discord</h3>
            <p className="text-sm text-muted-foreground mb-4">Join 5,000+ developers in our community server for peer-to-peer help.</p>
            <Button variant="outline" className="w-full mt-auto rounded-xl">Join Discord</Button>
          </div>
          <div className="bg-background border border-border/50 p-6 rounded-2xl flex flex-col items-center text-center">
            <div className="h-10 w-10 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="font-bold mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">Direct email access to our engineering support team (24h SLA).</p>
            <a href="mailto:support@devlaunch.ai" className="w-full mt-auto">
              <Button variant="outline" className="w-full rounded-xl">support@devlaunch.ai</Button>
            </a>
          </div>
          <div className="bg-foreground text-background border border-foreground p-6 rounded-2xl flex flex-col items-center text-center shadow-lg">
            <div className="h-10 w-10 bg-background/20 rounded-full flex items-center justify-center mb-4">
              <Ticket className="h-5 w-5 text-background" />
            </div>
            <h3 className="font-bold mb-2">Pro Support</h3>
            <p className="text-sm text-background/80 mb-4">Priority ticketing and 1-on-1 zoom debugging for Elite tier members.</p>
            <Button className="w-full mt-auto rounded-xl bg-background text-foreground hover:bg-background/90">Open Ticket</Button>
          </div>
        </div>

        <div className="bg-secondary/10 border border-border/50 rounded-3xl p-8 md:p-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight mb-8 text-center">Send us a message</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Jane Doe" className="bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="jane@example.com" className="bg-background" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type</label>
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>Account & Billing</option>
                <option>AI Resume Engine Bug</option>
                <option>Mock Interview Audio Issue</option>
                <option>Feature Request</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea placeholder="Describe the issue you're facing..." className="min-h-[150px] bg-background" />
            </div>
            <Button className="w-full rounded-xl h-12 font-bold text-lg bg-foreground text-background hover:bg-foreground/90 transition-all shadow-lg">
              Submit Request
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
