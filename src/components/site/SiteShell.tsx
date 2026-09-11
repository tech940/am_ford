import { type ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { MobileStickyCTA } from "./MobileStickyCTA";
import { ChatWidget } from "@/components/convert/ChatWidget";
import { ExitIntentOffer } from "@/components/convert/ExitIntentOffer";

export function SiteShell({
  children,
  hideStickyCTA = false,
  mainClassName,
}: {
  children: ReactNode;
  hideStickyCTA?: boolean;
  mainClassName?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <SiteNav />
      <main className={mainClassName ?? "pt-20 sm:pt-24"}>{children}</main>
      <SiteFooter />
      {/* Spacer so the fixed MobileStickyCTA never covers the footer's last rows */}
      {!hideStickyCTA && (
        <div
          aria-hidden
          className="h-24 sm:hidden"
          style={{ height: "calc(6rem + env(safe-area-inset-bottom))" }}
        />
      )}
      {!hideStickyCTA && <MobileStickyCTA />}
      <ChatWidget />
      <ExitIntentOffer />
    </div>
  );
}
