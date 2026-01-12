
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
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  Recycle,
  Users,
  LogOut,
  LogIn,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "./ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

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

function UserStatus() {
    const { isAdmin, isApproved } = useAdminAuth();
    const auth = useAuth();
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
        return (
            <div className="flex items-center gap-2 p-2">
                <div className="h-7 w-7 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
            </div>
        )
    }
    
     if (user && isApproved) {
        return (
             <div className="flex flex-col gap-2 p-2 w-full text-left">
                <div className="text-sm font-medium truncate">{user.email}</div>
                <div className="text-xs text-green-500 font-semibold">
                    {isAdmin ? 'Admin' : 'Approved'}
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-start mt-2" onClick={async () => { await signOut(auth); router.push('/login');}}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        )
    }

    return (
        <Link href="/login" className="p-2 w-full">
            <Button variant="ghost" className="w-full justify-start">
                <LogIn className="mr-2 h-4 w-4" />
                Request Access / Login
            </Button>
        </Link>
    )
}


export default function AppSidebar() {
  const pathname = usePathname();
  const { isAdmin, isApproved } = useAdminAuth();
  const { toggleSidebar, state } = useSidebar();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const canSeeAllTabs = isClient && isApproved;

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
            {navItems.map((item) => {
              if (item.href !== '/' && !canSeeAllTabs) return null;
              return (
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
            })}
            {isAdmin && canSeeAllTabs && adminNavItems.map((item) => (
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
        <SidebarFooter className="p-2 border-t">
          <UserStatus />
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
