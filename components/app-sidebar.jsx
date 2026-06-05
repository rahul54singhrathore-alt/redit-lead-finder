"use client";

import Link from "next/link";
import { BellIcon, HomeIcon, SearchIcon, SettingsIcon, TargetIcon, TrendingUpIcon } from "lucide-react";

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

export function AppSidebar({ user, onSignOut, leadCount = 0, alertCount = 0, ...props }) {
  const navItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: HomeIcon,
    },
    {
      title: "Keywords",
      url: "/dashboard/keywords",
      icon: SearchIcon,
    },
    {
      title: "Leads",
      url: "/dashboard/leads",
      icon: TrendingUpIcon,
      badge: leadCount ? String(leadCount) : undefined,
    },
    {
      title: "Alerts",
      url: "/dashboard/alerts",
      icon: BellIcon,
      badge: alertCount ? String(alertCount) : undefined,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    },
  ];

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <img className="size-8 rounded-lg" src="/logo.svg" alt="" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Lead Finder</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    Reddit monitoring
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <div className="mx-2 mt-auto hidden rounded-lg border border-green-200 bg-green-50 p-3 text-green-900 group-data-[collapsible=icon]:hidden md:block">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-green-500 shadow-[0_0_0_5px_rgba(34,197,94,0.14)]" />
            <p className="m-0 text-sm font-semibold">Monitoring active</p>
          </div>
          <p className="m-0 mt-1 text-xs text-green-800">Subreddits watched</p>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} onSignOut={onSignOut} />
      </SidebarFooter>
    </Sidebar>
  );
}
