// frontend/components/layout/sidebar.tsx
// Sidebar Component with mobile-first responsive design

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Package,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { getUserById } from "@/lib/supabase-db";

// Report types for the flyout menu
const reportTypes = [
  { title: "Asset Inventory", href: "/reports?report=Asset Inventory" },
  {
    title: "Lifecycle Management",
    href: "/reports?report=Lifecycle Management",
  },
  { title: "Financial", href: "/reports?report=Financial" },
  { title: "Compliance", href: "/reports?report=Compliance" },
  { title: "Utilization", href: "/reports?report=Utilization" },
  { title: "Maintenance", href: "/reports?report=Maintenance" },
  { title: "Software License", href: "/reports?report=Software License" },
  { title: "Security", href: "/reports?report=Security" },
  { title: "End-of-Life", href: "/reports?report=End-of-Life" },
  { title: "Audit", href: "/reports?report=Audit" },
];

// Navigation items with icons and labels
const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Package,
    badge: null,
  },
  {
    title: "Assets",
    href: "/assets",
    icon: Package,
    badge: null,
  },
  {
    title: "Locations",
    href: "/locations",
    icon: Package,
    badge: null,
  },
  {
    title: "Users",
    href: "/users",
    icon: Package,
    badge: null,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
    badge: null,
    hasSubmenu: true,
  },
  {
    title: "Imports",
    href: "/imports",
    icon: Package,
    badge: null,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Package,
    badge: null,
  },
];

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

export function Sidebar({
  isMobileMenuOpen = false,
  onMobileMenuClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false); // Only used for mobile
  // --- App user state for role-based sidebar entries ---
  const { user } = useAuth();
  const [appUser, setAppUser] = useState<{ role: string } | null>(null);
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setRoleLoading(true);
      getUserById(user.id)
        .then((result) => setAppUser(result.data))
        .catch(() => setAppUser(null))
        .finally(() => setRoleLoading(false));
    } else {
      setAppUser(null);
    }
  }, [user]);

  // Filter nav items: Only show Imports for Admins
  const filteredNavItems = navItems.filter((item) => {
    if (item.title === "Imports") {
      // Only show for admins
      return appUser?.role?.toLowerCase() === "admin";
    }
    return true;
  });

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex flex-col bg-card border-r transition-all duration-300 h-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between p-4 border-b">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">AssetMS</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(isCollapsed && "mx-auto")}
          >
            {isCollapsed ? (
              <Menu className="h-4 w-4" />
            ) : (
              <X className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Only render nav items after role is loaded, to avoid flicker */}
          {roleLoading ? (
            <div className="text-center text-xs text-muted-foreground py-4">
              Loading menu...
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const isActive = pathname === item.href;

              // Handle reports submenu
              if (item.hasSubmenu) {
                // When collapsed, just show the icon
                if (isCollapsed) {
                  return (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg px-2 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive &&
                            "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                    </Link>
                  );
                }

                // When expanded, show the fly-out submenu
                return (
                  <div key={item.href} className="relative group">
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive &&
                            "bg-accent text-accent-foreground font-medium"
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>

                    {/* Fly-out Reports Submenu */}
                    <div className="absolute left-full top-0 ml-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {/* Arrow pointing to parent */}
                      <div className="absolute -left-1 top-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45"></div>
                      <div className="py-2">
                        {reportTypes.map((report) => (
                          <Link key={report.href} href={report.href}>
                            <div className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                              <span>{report.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Regular navigation items
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive &&
                        "bg-accent text-accent-foreground font-medium",
                      isCollapsed && "justify-center px-2"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </nav>

        {/* Sticky Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t mt-auto">
            <div className="text-xs text-muted-foreground text-center">
              Asset Management System v1.0
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r z-50 transform transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            <span className="font-semibold text-lg">AssetMS</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {roleLoading ? (
            <div className="text-center text-xs text-muted-foreground py-4">
              Loading menu...
            </div>
          ) : (
            filteredNavItems.map((item) => {
              const isActive = pathname === item.href;

              // Handle reports submenu for mobile (keep as accordion since no hover on mobile)
              if (item.hasSubmenu) {
                return (
                  <div key={item.href}>
                    <button
                      onClick={() => setReportsOpen(!reportsOpen)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-lg px-4 py-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive &&
                          "bg-accent text-accent-foreground font-medium"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      {reportsOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </button>

                    {/* Mobile Reports Submenu */}
                    {reportsOpen && (
                      <div className="ml-6 mt-2 space-y-1">
                        {reportTypes.map((report) => (
                          <Link
                            key={report.href}
                            href={report.href}
                            onClick={onMobileMenuClose}
                          >
                            <div className="flex items-center rounded-lg px-4 py-2 text-base transition-colors hover:bg-accent hover:text-accent-foreground">
                              <span>{report.title}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Regular navigation items
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileMenuClose}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between rounded-lg px-4 py-3 text-base transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </nav>

        {/* Mobile Footer */}
        <div className="p-4 border-t mt-auto">
          <div className="text-sm text-muted-foreground text-center">
            Asset Management System v1.0
          </div>
        </div>
      </div>
    </>
  );
}
