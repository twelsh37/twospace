// frontend/components/layout/header.tsx
// Header Component with user info and global actions - Mobile-first responsive design

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, User, Settings, LogOut, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  SearchResultsModal,
  type SearchResults,
} from "@/components/search/search-results-modal";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, userRole, signOut } = useAuth();

  // Get user display info
  const userDisplay = user
    ? {
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: userRole || "User",
        avatar: user.user_metadata?.avatar_url || "",
      }
    : {
        name: "Guest",
        email: "",
        role: "Guest",
        avatar: "",
      };

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.data);
        setIsModalOpen(true);
      } else {
        console.error("Search failed");
        setResults(null);
      }
    } catch (error) {
      console.error("An error occurred during search:", error);
      setResults(null);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  return (
    <header
      role="banner"
      className="bg-white text-slate-800 border-b border-gray-200"
    >
      <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-4">
        {/* Left Side - Mobile Menu Button and Search */}
        <div className="flex items-center gap-2 md:gap-4 flex-1">
          {/* Mobile Menu Button - Only visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2"
            aria-label="Open mobile menu"
            title="Open mobile menu"
            onClick={onMobileMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar - Responsive width */}
          <div className="relative flex-1 max-w-xs md:max-w-md lg:max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search assets, users, or locations..."
              className="pl-9 h-9 md:h-10 text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Right Side - Actions and User */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications - Mobile friendly size */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 md:p-2.5"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          {/* User Menu - Mobile friendly */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 md:h-9 md:w-9 rounded-full p-0"
                aria-label="User menu"
                title="User menu"
              >
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                  <AvatarImage
                    src={userDisplay.avatar}
                    alt={userDisplay.name}
                  />
                  <AvatarFallback className="text-xs md:text-sm">
                    {userDisplay.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-56 md:w-64"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm md:text-base font-medium leading-none">
                    {userDisplay.name}
                  </p>
                  <p className="text-xs md:text-sm leading-none text-muted-foreground">
                    {userDisplay.email}
                  </p>
                  <Badge variant="secondary" className="w-fit mt-1 text-xs">
                    {userDisplay.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild className="text-sm md:text-base">
                <Link href="/profile" className="flex items-center w-full">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild className="text-sm md:text-base">
                <Link href="/settings" className="flex items-center w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-destructive text-sm md:text-base"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <SearchResultsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        results={results}
        isLoading={isSearching}
        query={searchQuery}
      />
    </header>
  );
}
