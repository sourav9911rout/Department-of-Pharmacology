
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Recycle,
  Users,
  LogOut,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/items", label: "Procured Items", icon: Package },
  { href: "/requirements", label: "Requirement List", icon: ClipboardList },
  { href: "/schedule", label: "Classes & Meetings", icon: Calendar },
  { href: "/sops", label: "SOPs", icon: BookOpen },
];

const adminNavItems = [
    { href: "/user-management", label: "User Management", icon: Users },
    { href: "/recycle-bin", label: "Recycle Bin", icon: Recycle },
]

export default function AppSidebar() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAdminAuth();
  const { toggleSidebar, state } = useSidebar();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return null; // Don't render sidebar if not logged in
  }

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
              )
            )}
            {isAdmin && adminNavItems.map((item) => (
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
        <SidebarFooter className="p-2 border-t flex-col gap-2">
            <div className="text-center text-xs p-2 text-muted-foreground">
                <p className="font-semibold">{user.email}</p>
                <p>{isAdmin ? 'Administrator' : 'User'}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

