import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { analytics } from "@/lib/mock-data";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowUpRight, Heart, MessageCircle, Share2 } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({
  component: Analytics,
});

const tooltipStyle = { backgroundColor: "oklch(0.21 0.045 265)", border: "1px solid oklch(0.78 0.13 85 / 0.3)", borderRadius: 8, color: "oklch(0.955 0.018 85)", fontSize: 12 };

function Analytics() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total reach", value: "65.6k", delta: "+12.4%" },
          { label: "Engagement rate", value: "6.1%", delta: "+0.8pt" },
          { label: "Posts published", value: "13", delta: "vs 11 last week" },
        ].map((s) => (
          <Card key={s.label} className="border-border/60 bg-card/60 p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-serif text-3xl">{s.value}</p>
            <p className="mt-1 text-xs text-primary">{s.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 p-5 lg:col-span-2">
          <h3 className="font-serif text-lg">Engagement over time</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.weekly}>
                <XAxis dataKey="week" tick={{ fill: "oklch(0.75 0.03 85)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.75 0.03 85)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="engagement" stroke="oklch(0.78 0.13 85)" strokeWidth={2.5} dot={{ fill: "oklch(0.78 0.13 85)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-primary/40 bg-gradient-to-br from-primary/10 to-transparent p-5">
          <p className="text-xs uppercase tracking-widest text-primary">Top post</p>
          <div className="mt-4 aspect-square w-full rounded-lg bg-gradient-to-br from-amber-200/30 to-amber-500/20" />
          <p className="mt-3 text-sm text-foreground/90">{analytics.topPost.caption}</p>
          <p className="mt-1 text-xs text-muted-foreground">{analytics.topPost.platform} · {analytics.topPost.posted}</p>
          <div className="mt-3 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><Heart className="size-3 text-primary" /> {analytics.topPost.likes.toLocaleString()}</span>
            <span className="flex items-center gap-1"><MessageCircle className="size-3 text-primary" /> {analytics.topPost.comments}</span>
            <span className="flex items-center gap-1"><Share2 className="size-3 text-primary" /> {analytics.topPost.shares}</span>
          </div>
          <button className="mt-4 inline-flex items-center gap-1 text-xs text-primary hover:underline">Duplicate & schedule <ArrowUpRight className="size-3" /></button>
        </Card>
      </div>

      <Card className="border-border/60 bg-card/60 p-5">
        <h3 className="font-serif text-lg">Engagement by platform</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.perPlatform}>
              <XAxis dataKey="platform" tick={{ fill: "oklch(0.75 0.03 85)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.75 0.03 85)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "oklch(0.78 0.13 85 / 0.08)" }} />
              <Bar dataKey="engagement" fill="oklch(0.78 0.13 85)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}