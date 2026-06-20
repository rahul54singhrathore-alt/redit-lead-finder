"use client";

import Link from "next/link";
import {
  BellIcon,
  BrainIcon,
  GaugeIcon,
  LightbulbIcon,
  MessageSquareIcon,
  MicroscopeIcon,
  SettingsIcon,
  SignalIcon,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
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
  subscriptionTier = "free",
  ...props
}) {
  const navItems = [
    { title: "Overview", url: "/dashboard", icon: GaugeIcon },
    { title: "Visibility", url: "/dashboard/visibility", icon: SignalIcon },
    { title: "Reddit Engine", url: "/dashboard/reddit", icon: MessageSquareIcon },
    { title: "Competitors", url: "/dashboard/competitors", icon: UsersIcon },
    { title: "Recommendations", url: "/dashboard/recommendations", icon: LightbulbIcon },
    { title: "AI Brand Audit", url: "/dashboard/brand-audit", icon: MicroscopeIcon },
    { title: "Brand Memory", url: "/dashboard/memory", icon: BrainIcon },
    { title: "Alerts", url: "/dashboard/alerts", icon: BellIcon },
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
                    Online Reputation & AI Search
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
