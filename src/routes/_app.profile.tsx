import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile, useUpsertProfile } from "@/lib/queries";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile")({
  component: Profile,
});

function Profile() {
  const { data: profile, isLoading } = useProfile();
  const upsertProfile = useUpsertProfile();
  const seeded = useRef(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  useEffect(() => {
    if (seeded.current || isLoading) return;
    seeded.current = true;
    if (profile) {
      setPhoneNumber(profile.phone_number ?? "");
      setTelegramUsername(profile.telegram_username ?? "");
    }
  }, [profile, isLoading]);

  const save = () => {
    const cleanTelegram = telegramUsername.trim().replace(/^@/, "");
    upsertProfile.mutate(
      { phone_number: phoneNumber.trim() || null, telegram_username: cleanTelegram || null },
      {
        onError: (e) => toast.error(e.message),
        onSuccess: () => toast.success("Contact details saved"),
      },
    );
  };

  if (isLoading) {
    return <Skeleton className="h-72 max-w-xl" />;
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h2 className="font-serif text-2xl">Your contact details.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Used to reach you for approvals and updates once messaging-bot integration is connected.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60 p-6">
        <div className="space-y-4">
          <div>
            <Label className="flex items-center gap-1.5"><MessageCircle className="size-3.5 text-emerald-300" /> Phone number</Label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
              type="tel"
              className="mt-1.5 border-border/60 bg-background/40"
            />
            <p className="mt-1 text-xs text-muted-foreground">Include your country code.</p>
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Send className="size-3.5 text-sky-300" /> Telegram username</Label>
            <Input
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="yourusername"
              className="mt-1.5 border-border/60 bg-background/40"
            />
            <p className="mt-1 text-xs text-muted-foreground">Without the @ — Aureate will add it.</p>
          </div>
        </div>
      </Card>

      <Button onClick={save} disabled={upsertProfile.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {upsertProfile.isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
