import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MenuIcon, BellIcon, MessageSquareText, CalendarCheck2, Users } from "lucide-react"; // Added more icons
import CommunitySwitcher from "./CommunitySwitcher";

// Placeholder for authentication status - replace with actual hook from MYA-2 later
const useAuth = () => ({ isAuthenticated: true, user: { displayName: "Sky", photoURL: null } }); // Set to true to see authenticated state

export default function AppNavbar() {
  const { isAuthenticated, user } = useAuth(); // Placeholder
  const navigate = useNavigate();

  const placeholderNotifications = [
    { id: "1", icon: MessageSquareText, text: "New post in 'Tech Innovators Hub'", time: "5m ago", link: "/community/tech-innovators-hub/feed" },
    { id: "2", icon: CalendarCheck2, text: "Your booking with 'Creator X' is confirmed for Tomorrow", time: "1h ago", link: "/calendar" },
    { id: "3", icon: Users, text: "You have 3 new followers", time: "3h ago", link: "/profile/followers" },
  ];

    return (
    <nav className="bg-slate-900/80 backdrop-blur-lg shadow-lg sticky top-0 z-50 border-b border-purple-500/50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side: Logo and Community Switcher */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 hover:opacity-95 transition-opacity duration-300 ease-in-out hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]">
              LearnSphere
            </Link>
            {isAuthenticated && (
              <div className="hidden md:block">
                {/* CommunitySwitcher might need its own theme adjustments if it has explicit light backgrounds */}
                <CommunitySwitcher /> 
              </div>
            )}
          </div>

          {/* Right side: Notifications and User/Auth Links */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-purple-200 focus:text-purple-200 hover:bg-purple-600/50 focus:bg-purple-600/60 relative rounded-full transition-all duration-150 ease-in-out hover:shadow-[0_0_18px_4px_rgba(192,132,252,0.35)] focus:shadow-[0_0_18px_4px_rgba(192,132,252,0.45)]">
                      <BellIcon className="h-5 w-5" />
                      {placeholderNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-slate-900" />
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 md:w-96 bg-slate-800/95 backdrop-blur-xl border border-purple-500/70 text-slate-200 shadow-2xl rounded-lg mt-2">
                    <DropdownMenuLabel className="px-3 py-2 font-semibold text-md text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-purple-500/40" />
                    {placeholderNotifications.length > 0 ? (
                      placeholderNotifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} onClick={() => navigate(notification.link)} className="p-0 cursor-pointer focus:bg-purple-600/60 focus:text-white data-[highlighted]:bg-purple-600/50 data-[highlighted]:text-white rounded-md transition-colors duration-100">
                          <div className="flex items-start p-3 hover:bg-purple-600/30 w-full transition-colors duration-100">
                            <notification.icon className="h-5 w-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <p className="text-sm text-slate-200 leading-snug">{notification.text}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{notification.time}</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-sm text-slate-400 text-center">No new notifications</p>
                    )}
                    <DropdownMenuSeparator className="bg-purple-500/40" />
                    <DropdownMenuItem onClick={() => navigate("/notifications")} className="justify-center p-2.5 cursor-pointer text-sm text-purple-300 hover:!text-purple-200 focus:bg-purple-600/60 focus:!text-purple-100 data-[highlighted]:bg-purple-600/50 data-[highlighted]:!text-purple-100 font-medium rounded-b-lg transition-colors duration-100">
                      View All Notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Profile Avatar and Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-purple-400/80 transition-all duration-200 ease-in-out hover:shadow-[0_0_12px_2px_rgba(192,132,252,0.5)]">
                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white font-semibold">{user?.displayName?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-slate-800/95 backdrop-blur-xl border border-purple-500/70 text-slate-200 shadow-2xl rounded-lg mt-2">
                    <DropdownMenuLabel className="px-3 py-2 font-semibold text-md text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700"/>
                    <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer focus:bg-purple-600/60 focus:text-white data-[highlighted]:bg-purple-600/50 data-[highlighted]:text-white rounded-md transition-colors duration-100 px-3 py-1.5">
                       Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer focus:bg-purple-600/60 focus:text-white data-[highlighted]:bg-purple-600/50 data-[highlighted]:text-white rounded-md transition-colors duration-100 px-3 py-1.5">
                       Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-700"/>
                    <DropdownMenuItem onClick={() => navigate("/logout")} className="cursor-pointer text-pink-400 hover:!text-pink-200 focus:bg-purple-600/60 focus:!text-pink-200 data-[highlighted]:bg-purple-600/50 data-[highlighted]:!text-pink-200 rounded-md transition-colors duration-100 px-3 py-1.5">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                  <Link to="/login">Login</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out border border-transparent hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transform hover:scale-105 active:scale-95"
                >
                  <Link to="/register-page">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger - Notification bell also needs DropdownMenu here */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-purple-200 focus:text-purple-200 hover:bg-purple-600/50 focus:bg-purple-600/60 mr-2 relative rounded-full transition-all duration-150 ease-in-out hover:shadow-[0_0_18px_4px_rgba(192,132,252,0.35)] focus:shadow-[0_0_18px_4px_rgba(192,132,252,0.45)]">
                    <BellIcon className="h-5 w-5" />
                    {placeholderNotifications.length > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-slate-900" />
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 bg-slate-800/95 backdrop-blur-xl border border-purple-500/70 text-slate-200 shadow-2xl rounded-lg mt-2">
                  <DropdownMenuLabel className="px-3 py-2 font-semibold text-md text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  {placeholderNotifications.length > 0 ? (
                      placeholderNotifications.map((notification) => (
                        <DropdownMenuItem key={notification.id} onClick={() => navigate(notification.link)} className="p-0 cursor-pointer focus:bg-purple-600/60 focus:text-white data-[highlighted]:bg-purple-600/50 data-[highlighted]:text-white rounded-md transition-colors duration-100">
                          <div className="flex items-start p-3 hover:bg-purple-600/30 w-full transition-colors duration-100">
                            <notification.icon className="h-5 w-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0" />
                            <div className="flex-grow">
                              <p className="text-sm text-slate-200 leading-snug">{notification.text}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{notification.time}</p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <p className="px-3 py-4 text-sm text-slate-400 text-center">No new notifications</p>
                    )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem onClick={() => navigate("/notifications")} className="justify-center p-2.5 cursor-pointer text-sm text-purple-300 hover:!text-purple-200 focus:bg-purple-600/60 focus:!text-purple-100 data-[highlighted]:bg-purple-600/50 data-[highlighted]:!text-purple-100 font-medium rounded-b-lg transition-colors duration-100">
                    View All Notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-purple-200 focus:text-purple-200 hover:bg-purple-600/50 focus:bg-purple-600/60 rounded-lg transition-all duration-150 ease-in-out hover:shadow-[0_0_18px_4px_rgba(192,132,252,0.35)] focus:shadow-[0_0_18px_4px_rgba(192,132,252,0.45)]">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-slate-900/95 backdrop-blur-xl border-l border-purple-500/70 text-slate-200">
                <div className="py-4">
                  {isAuthenticated ? (
                    <>
                       <div className="mb-4 px-3">
                         <CommunitySwitcher /> {/* Assuming CommunitySwitcher adapts or is themed separately */}
                       </div>
                      <Link to="/profile" className="block py-2.5 px-4 rounded-md hover:bg-purple-600/50 text-slate-100 font-medium transition-colors duration-150 ease-in-out">
                        My Profile
                      </Link>
                       <Link to="/settings" className="block py-2 px-3 rounded-md hover:bg-slate-700/50 text-slate-200 font-medium">
                        Settings
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-6 bg-pink-600/20 border-pink-500/70 text-pink-300 hover:bg-pink-500/30 hover:text-pink-200 hover:border-pink-400 transition-all duration-150"
                        onClick={() => navigate("/logout")}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block py-2 px-3 rounded-md hover:bg-slate-700/50 text-slate-200 font-medium">
                        Login
                      </Link>
                      <Link to="/register-page" className="block py-2 px-3 rounded-md hover:bg-slate-700/50 text-slate-200 font-medium">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
    );
}
