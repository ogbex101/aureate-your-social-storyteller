import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Sparkles, MessageSquare, Share2, Zap, Check, ArrowRight } from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { HeroMockup } from "@/components/HeroMockup";
import type { Platform } from "@/lib/store";

export const Route = createFileRoute("/")({
  component: Index,
});

const steps = [
  { n: "01", title: "Upload or generate content", body: "Drop in a photo, video, or a napkin sketch of an idea — or ask Aureate to generate the whole thing." },
  { n: "02", title: "AI writes your caption", body: "In your brand voice, with platform-native length and hashtags. Every draft sounds like you wrote it." },
  { n: "03", title: "Preview and approve — or auto-post", body: "See it exactly as it'll render on each platform. Approve from web, or from WhatsApp on your walk." },
  { n: "04", title: "Track what actually worked", body: "Engagement, reach, and top posts by platform. No vanity dashboards — just the numbers that inform the next post." },
];

const features = [
  { icon: Share2, title: "Multi-platform posting", body: "Instagram, LinkedIn, TikTok, X, Pinterest, YouTube, Threads, Facebook. One draft, eight surfaces." },
  { icon: Sparkles, title: "AI content generation", body: "Captions, hooks, hashtags, and image concepts tuned to your voice and content pillars." },
  { icon: Mic, title: "Voice commands", body: "\"Draft a Yirgacheffe post for Saturday morning.\" Aureate does the rest." },
  { icon: MessageSquare, title: "WhatsApp & Telegram", body: "Approve, reject, or edit posts from chat — from anywhere, with no login." },
  { icon: Zap, title: "Brand-voice captions", body: "Feed us three samples. Get captions that sound consistently, unmistakably you." },
];

const platforms: Platform[] = ["instagram", "linkedin", "x", "tiktok", "youtube", "pinterest", "facebook", "threads"];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-serif font-bold">A</div>
          <span className="font-serif text-xl font-semibold tracking-tight">Aureate</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-foreground/80 md:flex">
          <a href="#how" className="hover:text-primary">How it works</a>
          <a href="#features" className="hover:text-primary">Features</a>
          <a href="#pricing" className="hover:text-primary">Pricing</a>
        </div>
        <Link to="/onboarding" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Get started</Link>
      </nav>

      <header className="grain relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 right-0 size-[400px] rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-24 text-center md:pt-28 md:pb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" /> Now with voice
          </span>
          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-cream md:text-7xl">
            Your social,<br />
            <span className="italic text-primary">on autopilot.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-foreground/80 md:text-xl">
            Aureate writes, schedules, and publishes to every platform in your brand voice — approved from wherever you happen to be.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/onboarding" className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground shadow-[0_20px_60px_-15px_oklch(0.78_0.13_85/0.6)] hover:bg-primary/90">
              Get started
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link to="/dashboard" className="rounded-full border border-primary/30 px-6 py-3 font-medium text-foreground hover:border-primary hover:text-primary">
              See a live demo
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-primary/70">
            {platforms.map((p) => (
              <div key={p} className="opacity-80 transition hover:scale-110 hover:opacity-100">
                <PlatformIcon platform={p} className="size-5" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative px-6 pb-20 md:pb-28">
          <HeroMockup />
        </div>
      </header>

      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Four steps from thought to post.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 transition hover:border-primary/40">
              <div className="font-serif text-5xl italic text-primary/40 group-hover:text-primary/70">{s.n}</div>
              <h3 className="mt-4 font-serif text-xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-border/40 bg-card/30 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Built for the way you actually post</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Everything, in one quiet interface.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border/60 bg-background/40 p-6">
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-5 font-serif text-xl">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6 py-24">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Pricing</p>
          <h2 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">Start free. Scale when it earns it.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { name: "Free", price: "$0", tag: "For solo creators finding their voice.", features: ["2 connected platforms", "20 AI-written posts / month", "Weekly analytics summary", "Web-only approvals"] },
            { name: "Pro", price: "TBD", tag: "For teams that post like it matters.", features: ["Unlimited platforms & posts", "Voice commands & WhatsApp/Telegram", "Team roles & approval routing", "Real-time analytics & top-post insights", "Priority support"], highlight: true },
          ].map((tier) => (
            <div key={tier.name} className={`relative rounded-2xl border p-8 ${tier.highlight ? "border-primary bg-gradient-to-b from-primary/10 to-transparent" : "border-border/60 bg-card/40"}`}>
              {tier.highlight && <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-primary-foreground">Popular</span>}
              <h3 className="font-serif text-2xl">{tier.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tier.tag}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-5xl font-semibold text-cream">{tier.price}</span>
                {tier.price !== "TBD" && <span className="text-muted-foreground">/mo</span>}
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 text-primary" /> <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/onboarding" className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-medium ${tier.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-primary/40 text-foreground hover:border-primary hover:text-primary"}`}>
                {tier.name === "Free" ? "Start free" : "Join the waitlist"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-serif font-bold">A</div>
              <span className="font-serif text-xl">Aureate</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Social media, in your brand voice.</p>
          </div>
          {[
            { title: "Product", links: ["How it works", "Features", "Pricing", "Changelog"] },
            { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
            { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{col.title}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="hover:text-primary">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border/40 px-6 py-6 text-center text-xs text-muted-foreground">© 2026 Aureate. Made for people who'd rather be doing anything else.</div>
      </footer>
    </div>
  );
}