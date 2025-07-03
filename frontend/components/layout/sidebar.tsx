// frontend/components/layout/sidebar.tsx
// Sidebar Component with mobile-first responsive design

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

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
    icon: Package,
    badge: null,
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
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground font-medium",
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
          })}
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
          {navItems.map((item) => {
            const isActive = pathname === item.href;

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
          })}
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
