import { Link } from "react-router-dom";
import { SiGoogledocs } from "react-icons/si";
import { ROUTES } from "../../constants/routes";
import { Button } from "../ui/button";
import ThemeToggle from "./ThemeToggle";

function PublicNavbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to={ROUTES.HOME} className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <SiGoogledocs className="h-5 w-5" />
          </div>
          <span className="text-sm font-semibold tracking-wide">DOCZZ</span>
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link to={ROUTES.LOGIN}>Login</Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.REGISTER}>Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

export default PublicNavbar;
