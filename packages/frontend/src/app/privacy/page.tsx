import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="pl-0 hover:bg-transparent hover:opacity-70 transition-opacity flex items-center gap-2 mb-6">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 bg-foreground rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-background" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground">Last updated: July 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              At DevLaunch AI ("we", "our", or "us"), we respect your privacy and are committed to protecting your personal data. This privacy policy informs you about how we look after your personal data when you visit our website (regardless of where you visit it from) and tells you about your privacy rights and how the law protects you. DevLaunch AI provides career advancement tools, including AI-driven resume generation, mock interviews, and code evaluation (the "Services").
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">2. Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Identity Data</strong> includes first name, last name, username, and GitHub profile data (when linked).</li>
              <li><strong>Contact Data</strong> includes email address.</li>
              <li><strong>Professional Data</strong> includes employment history, education, skills, code repositories, algorithmic solutions, and audio recordings from AI mock interviews.</li>
              <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, and operating system.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">3. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide our core Services (Resume generation, Code Arena, and Mock Interviews).</li>
              <li>To train our internal proprietary AI models to better evaluate technical skills (only aggregated and anonymized data is used for this purpose unless explicitly opted-in).</li>
              <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">4. Third-Party Integrations</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevLaunch AI integrates heavily with external APIs such as GitHub and Google's Gemini LLMs. When you connect these services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>GitHub:</strong> We only request read-only access to your public repositories to construct your engineering profile. We do not store your source code natively.</li>
              <li><strong>AI Providers:</strong> Your resume data and interview transcripts are temporarily processed by third-party LLM providers (e.g., Google Vertex AI/Gemini) to generate insights. These providers are bound by strict data processing agreements and are not permitted to use your data to train their base models.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">5. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. All databases are encrypted at rest using AES-256 and in transit using TLS 1.3.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">6. Your Legal Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or restriction of your personal data. If you wish to exercise any of these rights, please contact us via our Support page.
            </p>
          </section>

          <div className="pt-12 pb-24 border-t border-border mt-12">
            <p className="text-sm text-muted-foreground">
              If you have any questions about this privacy policy or our privacy practices, please contact us at support@devlaunch.ai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
