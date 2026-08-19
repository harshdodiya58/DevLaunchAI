import Link from 'next/link';
import { ArrowLeft, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
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
              <Scale className="h-6 w-6 text-background" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground">Last updated: July 2026</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and DevLaunch AI ("we," "us" or "our"), concerning your access to and use of the devlaunch.ai website as well as any other media form, related channel, or mobile application related, linked, or otherwise connected thereto.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">2. User Representations</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using DevLaunch AI, you represent and warrant that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>All registration information you submit will be true, accurate, current, and complete.</li>
              <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
              <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
              <li>You are not a minor in the jurisdiction in which you reside.</li>
              <li>You will not access the site through automated or non-human means, whether through a bot, script, or otherwise, without our express written permission.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">3. Acceptable Use of AI Features</h2>
            <p className="text-muted-foreground leading-relaxed">
              DevLaunch AI provides tools such as the "AI Resume Engine" and "Neural Twin Mock Interviews". You agree that:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>You will not use the AI features to generate misleading, fraudulent, or entirely fictitious resumes. The AI is intended to optimize and format your actual experience.</li>
              <li>You will not attempt to jailbreak, reverse engineer, or maliciously prompt inject the LLMs utilized in the Code Arena or Interview environments.</li>
              <li>We make no guarantees regarding job placement, interview success rates, or absolute ATS compliance. The generated documents are suggestions and you remain solely responsible for the content you submit to employers.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein are owned or controlled by us. The resumes you generate using our formatting tools are your property, though we retain the rights to the underlying templates and generation models.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">5. Subscription & Payment</h2>
            <p className="text-muted-foreground leading-relaxed">
              Certain features of the Site may require a paid subscription ("Pro" or "Elite"). By selecting a paid tier, you agree to provide current, complete, and accurate purchase and account information. We bill you through an online billing account for purchases made at the Site. You agree to pay all charges at the prices then in effect for your purchases, and you authorize us to charge your chosen payment provider for any such amounts upon placing your order.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">6. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the site, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <div className="pt-12 pb-24 border-t border-border mt-12">
            <p className="text-sm text-muted-foreground">
              By continuing to access or use our Service, you agree to be bound by these terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
