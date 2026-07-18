import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Mic, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const transcript = [
  "Draft a post about the new Ethiopia Yirgacheffe…",
  "Schedule it for Saturday morning across Instagram and Threads.",
  "Route approval to Ana.",
];

export function FloatingActions() {
  const [micOpen, setMicOpen] = useState(false);
  const [step, setStep] = useState(0);

  const openMic = () => {
    setMicOpen(true);
    setStep(0);
    const iv = setInterval(() => {
      setStep((s) => {
        if (s >= transcript.length) {
          clearInterval(iv);
          return s;
        }
        return s + 1;
      });
    }, 900);
  };

  return (
    <>
      <Link
        to="/new-post"
        className="fixed bottom-6 right-6 z-40 flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-primary-foreground shadow-[0_10px_40px_-10px_oklch(0.78_0.13_85/0.7)] transition-transform hover:scale-[1.03]"
      >
        <Plus className="size-5" />
        <span className="font-medium">New post</span>
      </Link>
      <button
        onClick={openMic}
        className="fixed bottom-6 left-6 z-40 flex size-14 items-center justify-center rounded-full border border-primary/40 bg-card/90 text-primary backdrop-blur transition hover:border-primary hover:bg-card"
        aria-label="Voice command"
      >
        <Mic className="size-5" />
        <span className="absolute -top-1 -right-1 flex size-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-primary" />
        </span>
      </button>

      <Dialog open={micOpen} onOpenChange={setMicOpen}>
        <DialogContent className="border-primary/30 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Listening…</DialogTitle>
            <DialogDescription>Speak naturally. Aureate handles captions, timing, and approvals.</DialogDescription>
          </DialogHeader>
          <div className="flex items-end justify-center gap-1 py-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="w-1 rounded-full bg-primary/70" style={{ height: `${10 + Math.abs(Math.sin(i + step)) * 40}px` }} />
            ))}
          </div>
          <div className="space-y-2 rounded-lg border border-border/60 bg-background/60 p-4 text-sm min-h-[120px]">
            {transcript.slice(0, step).map((t, i) => (
              <p key={i} className="text-foreground animate-in fade-in slide-in-from-bottom-1">{t}</p>
            ))}
            {step < transcript.length && <p className="text-muted-foreground italic">…</p>}
            {step >= transcript.length && <p className="text-primary font-medium pt-2">✓ Draft ready for review</p>}
          </div>
          <button onClick={() => setMicOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}