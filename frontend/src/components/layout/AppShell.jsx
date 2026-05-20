import { Link, NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, LayoutDashboard, LogOut, Menu, Plus, Search, Settings } from "lucide-react";
import { SiGoogledocs } from "react-icons/si";
import { useState } from "react";
import { ROUTES } from "../../constants/routes";
import { clearCurrentUser, getCurrentUser } from "../../utils/storage";
import { disconnectSocket } from "../../socket/socketClient";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Sidebar, SidebarLink, SidebarSection } from "../ui/sidebar";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { label: "Dashboard", to: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "New document", to: ROUTES.NEW_DOCUMENT, icon: Plus },
];

const AppSidebar = ({ onLogout, onNavigate }) => {
  return (
    <Sidebar>
      <SidebarSection className="border-b border-white/10 p-4">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <SiGoogledocs className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">DOCZZ</p>
            <p className="text-xs text-white/55">Workspace</p>
          </div>
        </Link>
      </SidebarSection>

      <SidebarSection className="space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} onClick={onNavigate}>
            {({ isActive }) => (
              <SidebarLink active={isActive}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </SidebarLink>
            )}
          </NavLink>
        ))}
      </SidebarSection>

      <SidebarSection className="mt-auto border-t border-white/10">
        <div className="rounded-lg bg-white/8 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-white/75">
            <FileText className="h-3.5 w-3.5" />
            Ready for next
          </div>
          <p className="text-xs leading-5 text-white/55">
            Editor, comments, chat, and version history can plug into this shell later.
          </p>
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </SidebarSection>
    </Sidebar>
  );
};

const AppShell = ({ children, title = "Dashboard", subtitle = "Manage your shared documents." }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();
  const initials = (user?.name || user?.email || "U").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    disconnectSocket();
    clearCurrentUser();
    setIsMobileOpen(false);
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 hidden w-72 lg:block">
        <AppSidebar onLogout={handleLogout} />
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute inset-0 bg-slate-950/60"
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              className="relative h-full w-72"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
            >
              <AppSidebar onLogout={handleLogout} onNavigate={() => setIsMobileOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button className="lg:hidden" variant="ghost" size="icon" type="button" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
              <p className="hidden text-sm text-muted-foreground sm:block">{subtitle}</p>
            </div>
            <div className="hidden w-72 items-center gap-2 rounded-md border border-border bg-card px-3 shadow-sm md:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input className="h-9 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" placeholder="Search documents" />
            </div>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm md:inline">{user?.name || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
