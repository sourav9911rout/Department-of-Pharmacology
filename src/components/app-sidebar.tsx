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
             <div className="p-2 bg-primary/20 rounded-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 100 100"
                  className="h-6 w-6 text-primary"
                  fill="currentColor"
                >
                  <path d="M50,10A40,40,0,1,0,90,50,40,40,0,0,0,50,10Zm0,75A35,35,0,1,1,85,50,35,35,0,0,1,50,85Z" />
                  <path d="M50,25a5,5,0,0,0-5,5V45H35a5,5,0,0,0,0,10H45V70a5,5,0,0,0,10,0V55H65a5,5,0,0,0,0-10H55V30A5,5,0,0,0,50,25Z" />
                  <path d="M35,35a5,5,0,1,0,5,5A5,5,0,0,0,35,35Z" />
                  <path d="M60,35a5,5,0,1,0,5,5A5,5,0,0,0,60,35Z" />
                  <path d="M35,60a5,5,0,1,0,5,5A5,5,0,0,0,35,60Z" />
                  <path d="M60,60a5,5,0,1,0,5,5A5,5,0,0,0,60,60Z" />
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
