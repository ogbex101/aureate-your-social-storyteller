import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mic, Plus, X, Square } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useConnections, useProfile } from "@/lib/queries";
import { parseVoiceCommand } from "@/lib/ai";
import { toast } from "sonner";

type SpeechRecognitionAlternativeLike = { transcript: string };
type SpeechRecognitionResultLike = ArrayLike<SpeechRecognitionAlternativeLike> & { isFinal: boolean };
type SpeechRecognitionEventLike = { results: ArrayLike<SpeechRecognitionResultLike> };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

type Status = "idle" | "listening" | "thinking" | "unsupported" | "denied";

export function FloatingActions() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: connections } = useConnections();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [finalText, setFinalText] = useState("");
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
  };

  const openMic = () => {
    const Recognition = getSpeechRecognition();
    setFinalText("");
    setInterimText("");
    setOpen(true);

    if (!Recognition) {
      setStatus("unsupported");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let final = "";
    recognition.onresult = (e) => {
      let interim = "";
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        const alt = result[0];
        if (!alt) continue;
        if (result.isFinal) final += alt.transcript + " ";
        else interim += alt.transcript;
      }
      setFinalText(final);
      setInterimText(interim);
    };
    recognition.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setStatus("denied");
      else if (e.error !== "no-speech" && e.error !== "aborted") toast.error(`Voice input error: ${e.error}`);
    };
    recognition.onend = () => {
      setStatus((s) => (s === "listening" ? "thinking" : s));
    };

    recognitionRef.current = recognition;
    setStatus("listening");
    recognition.start();
  };

  useEffect(() => {
    if (status !== "thinking") return;
    const transcript = (finalText + interimText).trim();
    if (!transcript) {
      setOpen(false);
      setStatus("idle");
      return;
    }
    const connectedPlatforms = (connections ?? []).filter((c) => c.status === "connected").map((c) => c.platform);
    parseVoiceCommand({
      data: {
        transcript,
        brandName: profile?.brand_name ?? "",
        toneWords: profile?.tone_words ?? [],
        writingSample: profile?.writing_sample ?? "",
        connectedPlatforms,
      },
    })
      .then((result) => {
        setOpen(false);
        setStatus("idle");
        navigate({
          to: "/new-post",
          search: {
            draftCaption: result.caption,
            draftContext: result.context || undefined,
            draftPlatforms: result.platforms.length > 0 ? result.platforms.join(",") : undefined,
          },
        });
        toast.success("Draft ready for review");
      })
      .catch((e) => {
        toast.error(e instanceof Error ? e.message : "Couldn't turn that into a draft.");
        setOpen(false);
        setStatus("idle");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const close = () => {
    recognitionRef.current?.stop();
    setOpen(false);
    setStatus("idle");
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

      <Dialog open={open} onOpenChange={(o) => !o && close()}>
        <DialogContent className="border-primary/30 bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {status === "listening" && "Listening…"}
              {status === "thinking" && "Drafting…"}
              {status === "unsupported" && "Voice input isn't available here"}
              {status === "denied" && "Microphone access denied"}
            </DialogTitle>
            <DialogDescription>
              {status === "listening" && "Speak naturally, then stop when you're done."}
              {status === "thinking" && "Turning that into a caption in your brand voice."}
              {status === "unsupported" && "Your browser doesn't support speech recognition. Try Chrome or Edge."}
              {status === "denied" && "Allow microphone access in your browser settings and try again."}
            </DialogDescription>
          </DialogHeader>

          {(status === "listening" || status === "thinking") && (
            <>
              <div className="flex items-center justify-center gap-1.5 py-6">
                {status === "listening" ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="size-2.5 animate-pulse rounded-full bg-primary" style={{ animationDelay: `${i * 150}ms` }} />
                  ))
                ) : (
                  <div className="size-6 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                )}
              </div>
              <div className="min-h-[100px] space-y-2 rounded-lg border border-border/60 bg-background/60 p-4 text-sm">
                {finalText || interimText ? (
                  <p className="text-foreground">
                    {finalText}
                    <span className="text-muted-foreground">{interimText}</span>
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">…</p>
                )}
              </div>
              {status === "listening" && (
                <button
                  onClick={stopListening}
                  className="mx-auto flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Square className="size-3.5" /> Stop & draft
                </button>
              )}
            </>
          )}

          <button onClick={close} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
