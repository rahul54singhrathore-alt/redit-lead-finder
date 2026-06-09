"use client";

import Link from "next/link";
import {
  BarChart3Icon,
  BrainIcon,
  CreditCardIcon,
  CrownIcon,
  GaugeIcon,
  InboxIcon,
  LightbulbIcon,
  ListChecksIcon,
  MessageSquareIcon,
  PlusIcon,
  QuoteIcon,
  RadarIcon,
  SettingsIcon,
  SignalIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { getTier, hasFeature, nextTier } from "@/lib/subscription";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({
  user,
  onSignOut,
  leadCount = 0,
  alertCount = 0,
  subscriptionTier = "free",
  ...props
}) {
  const tier = getTier(subscriptionTier);
  const isPaid = subscriptionTier !== "free";
  const upgrade = nextTier(subscriptionTier);

  const overviewItems = [
    { title: "GEO Score", url: "/dashboard", icon: GaugeIcon },
    { title: "Visibility", url: "/dashboard/visibility", icon: SignalIcon },
    { title: "Opportunities", url: "/dashboard/opportunities", icon: RadarIcon },
  ];

  const researchItems = [
    { title: "Prompt Explorer", url: "/dashboard/prompts", icon: ListChecksIcon },
    { title: "Sources", url: "/dashboard/citations", icon: QuoteIcon },
    { title: "Reddit Engine", url: "/dashboard/reddit", icon: MessageSquareIcon },
    {
      title: "Competitors",
      url: "/dashboard/competitors",
      icon: BarChart3Icon,
      locked: !hasFeature(subscriptionTier, "competitorTracker"),
    },
  ];

  const optimizationItems = [
    { title: "Recommendations", url: "/dashboard/recommendations", icon: LightbulbIcon },
    {
      title: "Audits",
      url: "/dashboard/alerts",
      icon: InboxIcon,
      badge: alertCount ? String(alertCount) : undefined,
    },
    { title: "Brand Memory", url: "/dashboard/memory", icon: BrainIcon },
  ];

  const accountItems = [
    { title: "Billing", url: "/pricing", icon: CreditCardIcon },
    { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <span className="sidebar-brand-logo">
                  <img src="/logo.png" alt="" />
                </span>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Oras</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    GEO and AEO tools
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className={`sidebar-plan-chip group-data-[collapsible=icon]:hidden${isPaid ? " sidebar-plan-chip-paid" : ""}`}>
          <CrownIcon className="sidebar-plan-icon" />
          <span className="sidebar-plan-name">{tier.name}</span>
          <span className="sidebar-plan-tag">{isPaid ? "Member" : "Free"}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Link href="/dashboard/keywords" className="sidebar-quick-action group-data-[collapsible=icon]:hidden">
          <PlusIcon />
          <span>New brand</span>
          <kbd>B</kbd>
        </Link>

        <NavMain items={overviewItems} label="Overview" />
        <NavMain items={researchItems} label="Research" />
        <NavMain items={optimizationItems} label="Optimization" />
        <NavMain items={accountItems} label="Account" />

        {upgrade ? (
          <Link href="/pricing" className="sidebar-upgrade-card group-data-[collapsible=icon]:hidden">
            <div className="sidebar-upgrade-top">
              <CrownIcon />
              <strong>Upgrade to {upgrade.name}</strong>
            </div>
            <p>Unlock more brands, all AI engines, and premium pages.</p>
            <span className="sidebar-upgrade-cta">View plans →</span>
          </Link>
        ) : (
          <div className="mx-2 mt-auto hidden rounded-lg border border-green-200 bg-green-50 p-3 text-green-900 group-data-[collapsible=icon]:hidden md:block">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-green-500 shadow-[0_0_0_5px_rgba(34,197,94,0.14)]" />
              <p className="m-0 text-sm font-semibold">Agency member</p>
            </div>
            <p className="m-0 mt-1 text-xs text-green-800">All features unlocked</p>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
