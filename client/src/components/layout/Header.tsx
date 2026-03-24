import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import {
  EllipsisVertical,
  LayoutDashboard,
  List,
  LogOut,
  MenuIcon,
} from "lucide-react";
import { useState } from "react";

const navLinkBase =
  "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors";

const Header = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  console.log(menuOpen);

  const handleLogout = () => {
    logout(() => {
      setMenuOpen(false);
    });
  };
  return (
    <header className="bg-background backdrop-blur shadow-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <NavLink to="/" className="text-lg font-semibold tracking-tight">
          ExpenseNest
        </NavLink>
        <nav className="flex items-center gap-2 text-xs text-zinc-300">
          {user ? (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild className="text-base cursor-pointer">
                <Button variant="ghost" className="select-none">
                  <EllipsisVertical className="text-foreground md:hidden" />
                  <MenuIcon className="text-foreground hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-none">
                <DropdownMenuItem className="cursor-pointer hover:bg-neutral-200">
                  <NavLink to={"/"} className="flex items-center gap-2">
                    {" "}
                    <LayoutDashboard />
                    Dashboard
                  </NavLink>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-neutral-200">
                  <NavLink
                    to={"/transactions"}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    {" "}
                    <List />
                    Transactions
                  </NavLink>
                </DropdownMenuItem>
                <Button
                  className="w-full flex items-center gap-2 justify-start hover:bg-red-200"
                  variant="ghost"
                  onClick={handleLogout}
                >
                  {" "}
                  <LogOut /> Logout
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  [
                    navLinkBase,
                    isActive
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-900 bg-zinc-100",
                  ].join(" ")
                }
              >
                Log in
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
