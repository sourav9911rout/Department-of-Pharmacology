
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  Package,
  ClipboardList,
  Calendar,
  Pill,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  LogIn,
  Trash2,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/items", label: "Procured Items", icon: Package },
  { href: "/requirements", label: "Requirement List", icon: ClipboardList },
  { href: "/schedule", label: "Classes & Meetings", icon: Calendar },
  { href: "/sops", label: "SOPs", icon: BookOpen },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { toggleSidebar, state } = useSidebar();
  const { isAdmin, logout, setShowPinDialog } = useAdminAuth();

  return (
    <>
      <div className="md:hidden flex items-center p-2 border-b">
        <SidebarTrigger />
        <h1 className="text-lg font.headline font-semibold ml-4">Dept. of Pharmacology</h1>
      </div>
       <div
        className={cn(
          "fixed top-3 left-3 z-20 md:block hidden",
          state === "expanded" && "hidden"
        )}
      >
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <PanelLeftOpen />
        </Button>
      </div>
      <Sidebar collapsible="offcanvas" variant="sidebar">
        <SidebarHeader className="p-4 flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <h2 className="text-lg font.headline font-semibold">Dept. of Pharmacology</h2>
              <p className="text-xs text-muted-foreground">AIIMS CAPFIMS</p>
            </div>
          </div>
           <Button variant="ghost" size="icon" className="h-8 w-8 hidden md:flex" onClick={() => toggleSidebar()}>
              <PanelLeftClose className="w-5 h-5" />
            </Button>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    className="w-full justify-start"
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
             {isAdmin && (
              <SidebarMenuItem>
                <Link href="/recycle-bin">
                  <SidebarMenuButton
                    isActive={pathname === '/recycle-bin'}
                    className="w-full justify-start"
                  >
                    <Trash2 className="size-4" />
                    <span>Recycle Bin</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <a
                href="https://pharmacology.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SidebarMenuButton className="w-full justify-start">
                  <Pill className="size-4" />
                  <span>Daily Drug Highlight</span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t">
            {isAdmin ? (
                 <SidebarMenuButton className="w-full justify-start" onClick={logout}>
                    <LogOut className="size-4" />
                    <span>Logout</span>
                </SidebarMenuButton>
            ) : (
                <SidebarMenuButton className="w-full justify-start" onClick={() => setShowPinDialog(true)}>
                    <LogIn className="size-4" />
                    <span>Admin Login</span>
                </SidebarMenuButton>
            )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
