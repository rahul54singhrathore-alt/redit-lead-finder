"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({ items, label = "Workspace", badge }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="sidebar-group-label">
        <span>{label}</span>
        {badge ? <span className="sidebar-group-badge">{badge}</span> : null}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.locked
            ? false
            : item.url === "/dashboard"
              ? pathname === item.url
              : pathname.startsWith(item.url.split("#")[0]);

          // Locked premium items route to pricing and show a lock instead of a badge.
          const href = item.locked ? "/pricing" : item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.locked ? `${item.title} — upgrade to unlock` : item.title}
                isActive={isActive}
                className={item.locked ? "sidebar-item-locked" : undefined}
              >
                <Link href={href}>
                  {Icon ? <Icon /> : null}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.locked ? (
                <SidebarMenuBadge>
                  <LockIcon className="sidebar-lock-icon" />
                </SidebarMenuBadge>
              ) : item.badge ? (
                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
              ) : null}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
