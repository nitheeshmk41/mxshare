"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

function usePreferredTheme() {
  const [theme, setTheme] = React.useState<string>(() => {
    if (typeof window === "undefined") return "dark"; // SSR default
    const stored = localStorage.getItem("theme");
    if (stored) return stored;
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    return prefersDark ? "dark" : "light";
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("theme");
    if (!stored) {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
}
export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = usePreferredTheme();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const domain = (session as any)?.user?.email?.split("@")[1];
  const isExternal = domain && domain !== (process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || "psgtech.ac.in");

  // Fetch notifications
  useEffect(() => {
    if (session) {
      const fetchNotifs = async () => {
        try {
          const res = await fetch("/api/notifications");
          if (res.ok) {
            const data = await res.json();
            setNotifications(data.notifications);
            
            // Check for unread
            const lastRead = localStorage.getItem("mx_last_read_notif");
            const lastReadTime = lastRead ? parseInt(lastRead) : 0;
            
            const hasNew = data.notifications.some((n: any) => 
              new Date(n.createdAt).getTime() > lastReadTime
            );
            setHasUnread(hasNew);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchNotifs();
      // Poll every 60s
      const interval = setInterval(fetchNotifs, 60000);
      return () => clearInterval(interval);
    }
  }, [session]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotifs = () => {
    if (!showNotifs) {
      // Mark as read locally when opening
      localStorage.setItem("mx_last_read_notif", Date.now().toString());
      setHasUnread(false);
    }
    setShowNotifs(!showNotifs);
  };

  const markRead = async (id: string, type: string) => {
    if (type === "new_file") return; 
    try {
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    if (isExternal) document.documentElement.classList.add("pretty-mode");
    else document.documentElement.classList.remove("pretty-mode");
  }, [isExternal]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getThemeIcon = () => {
    return theme === "light" ? "☀️" : "🌙";
  };

  return (
    <nav 
      className="sticky top-0 z-50 border-b backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/60"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <a href="/" className="font-bold text-xl md:text-2xl tracking-tight">MXShare</a>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-accent transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-6">
            {!session ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-accent transition text-lg"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {getThemeIcon()}
                </button>
                <a
                  href="/login"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-medium shadow-sm"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Login
                </a>
              </div>
            ) : (
              <>
                <a href="/dashboard" className="text-sm font-medium hover:text-primary transition">Dashboard</a>
                {(session as any)?.user?.role === "admin" && (
                  <a href="/admin" className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition">👑 Admin</a>
                )}
                
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={handleOpenNotifs}
                    className="p-2 rounded-full hover:bg-accent transition relative"
                  >
                    <Bell className="w-5 h-5" />
                    {hasUnread && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-background animate-pulse"></span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5">
                      <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        <span className="text-xs text-muted-foreground">{notifications.length} New</span>
                      </div>
                      
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center flex flex-col items-center text-muted-foreground">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No new notifications</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {notifications.map((n, i) => (
                              <div 
                                key={i} 
                                className={`p-4 hover:bg-muted/40 transition flex gap-3 ${n.type === 'warning' ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}
                              >
                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'warning' ? 'bg-red-500' : 'bg-blue-500'}`} />
                                
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm leading-snug text-foreground/90">
                                    {n.link ? (
                                      <a href={n.link} className="hover:text-primary font-medium transition-colors block">
                                        {n.message}
                                      </a>
                                    ) : (
                                      <span>{n.message}</span>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground">
                                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>

                                {n.type !== 'new_file' && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markRead(n._id, n.type);
                                    }}
                                    className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded transition self-start"
                                    title="Dismiss"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-accent transition text-lg"
                    title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                  >
                    {getThemeIcon()}
                  </button>
                  
                  {isExternal && (
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                      Pretty Mode
                    </span>
                  )}
                  
                  <div className="relative group pl-4 border-l" style={{ borderColor: "var(--border)" }}>
                    <button className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition py-2">
                      <span>{(session.user?.name || "User").split(" ")[0]}</span>
                      <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    <div 
                      className="absolute right-0 mt-0 w-48 bg-card border rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50"
                      style={{ background: "var(--card)", borderColor: "var(--border)" }}
                    >
                      <a 
                        href="/my-files" 
                        className="block px-4 py-2 text-sm hover:bg-accent transition"
                        style={{ color: "var(--card-foreground)" }}
                      >
                        My Files
                      </a>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-accent transition"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background" style={{ borderColor: "var(--border)" }}>
          <div className="px-4 py-6 space-y-4">
            {!session ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-accent transition flex items-center gap-2"
                  >
                    {getThemeIcon()} <span className="capitalize">{theme}</span>
                  </button>
                </div>
                <a
                  href="/login"
                  className="w-full block text-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-medium"
                  style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
                >
                  Login
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <a href="/dashboard" className="block text-sm font-medium hover:text-primary">Dashboard</a>
                {(session as any)?.user?.role === "admin" && (
                  <a href="/admin" className="block text-sm font-medium text-amber-600 dark:text-amber-400">👑 Admin</a>
                )}
                <a href="/my-files" className="block text-sm font-medium hover:text-primary">My Files</a>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-md hover:bg-accent transition flex items-center gap-2"
                  >
                    {getThemeIcon()} <span className="capitalize">{theme}</span>
                  </button>
                </div>

                {isExternal && (
                  <div className="text-xs font-medium text-purple-600 dark:text-purple-400">Pretty Mode Active</div>
                )}
                
                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{(session.user?.name || "User").split(" ")[0]}</span>
                  </div>
                  <button 
                    className="text-sm font-medium text-red-500 hover:text-red-600"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
