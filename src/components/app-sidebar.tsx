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
  FolderOpen,
  Lock,
  Unlock,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import AdminPinDialog from "./admin-pin-dialog";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/items", label: "Procured Items", icon: Package },
  { href: "/requirements", label: "Requirement List", icon: ClipboardList },
  { href: "/schedule", label: "Classes & Meetings", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FolderOpen },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAdminAuth();
  const { toggleSidebar, state } = useSidebar();

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
          <div className="flex items-center gap-3">
             <div className="p-1 bg-blue-800 rounded-lg">
                <svg
                  role="img"
                  aria-labelledby="capfims-logo-title-sidebar"
                  viewBox="0 0 100 100"
                  className="h-8 w-8 text-primary"
                  fill="currentColor"
                >
                  <title id="capfims-logo-title-sidebar">AIIMS CAPFIMS Logo</title>
                  <g transform="translate(50, 50) scale(0.8)">
                    <path
                      d="M-2, -45 L-2, 25 L2, 25 L2, -45 Z"
                      fill="white"
                      stroke="white"
                      strokeWidth="1"
                    />
                    <path
                      d="M2, -45 C20, -35 20, -15 2, -5 C-16, -15 -16, -35 -2, -45"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                    />
                    <path
                      d="M-2, 5 C25, 15 25, 35 -2, 45 C-29, 35 -29, 15 -2, 5"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                    />
                     <path
                      d="M-4, 25h8v20h-8z"
                      fill="white"
                    />
                    <path
                      d="M-30, 20 A30,30 0 0,1 30,20"
                      stroke="white"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                     <path
                      d="M-25, 10 A25,25 0 0,1 25,10"
                      stroke="white"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>
             </div>
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
        <SidebarFooter className="p-2">
          <AdminPinDialog>
            <Button variant="ghost" className="w-full justify-start gap-2">
              {isAdmin ? (
                <Unlock className="size-4 text-accent" />
              ) : (
                <Lock className="size-4" />
              )}
              <span>{isAdmin ? "Admin Access" : "Admin Login"}</span>
            </Button>
          </AdminPinDialog>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
