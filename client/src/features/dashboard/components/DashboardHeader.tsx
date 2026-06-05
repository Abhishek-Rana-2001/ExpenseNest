import Avatar from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { formatDateLocale, getGreeting } from "@/lib/helpers";
import { Bell, ChevronsUpDown, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(() => navigate("/login", { replace: true }));
  };

  return (
    <header className="flex justify-between divide-x max-sm:hidden divide-neutral-200 border-b border-neutral-200 p-2">
      <div className="flex-1 flex justify-between items-center px-2">
        <div>
          <h1 className="text-lg  font-semibold">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-xs text-stone-500">{formatDateLocale(new Date())}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="rounded-full group cursor-pointer size-10 group"
            variant={"ghost"}
          >
            <Bell className="lg:size-5 size-4 group-hover:animate-vibrate duration-300 transition-all " />
          </Button>
        </div>
      </div>
      <div className="px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="flex h-full w-full items-center gap-2 py-0 hover:bg-gray-200"
              variant={"ghost"}
            >
              <Avatar />
              <div className="flex flex-col items-start">
                <p className="text-sm">{user?.name}</p>
                <p className="text-xs text-stone-500">{user?.email}</p>
              </div>
              <ChevronsUpDown />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width)"
          >
             <DropdownMenuItem
              onSelect={handleLogout}
              className="cursor-pointer focus:bg-red-500 focus:text-white data-highlighted:bg-red-500 data-highlighted:text-white"
            >
              <User className="data-highlighted:text-white" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={handleLogout}
              className="cursor-pointer focus:bg-red-500 focus:text-white data-highlighted:bg-red-500 data-highlighted:text-white"
            >
              <LogOut className="data-highlighted:text-white" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
