import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRightLeft,
  ChartNoAxesCombined,
  Goal,
  LayoutDashboard,
  Settings,
  Wallet,
} from "lucide-react";

const SideBar = () => {
  const location = useLocation();

  const links = [
    {
      name: "Dashboard",
      link: "/app/dashboard",
      icon: <LayoutDashboard  size={18}/>,
    },
    {
      name: "Transactions",
      link: "/app/transactions",
      icon: <ArrowRightLeft size={18} />,
    },
    {
      name: "Budgets",
      link: "/app/budgets",
      icon: <Wallet size={18} />,
    },
    {
      name: "Analytics",
      link: "/app/analytics",
      icon: <ChartNoAxesCombined size={18} />,
    },
    { name: "Goals", link: "/app/goals", icon: <Goal size={18} /> },

    
  ];

  return (
    <aside className="p-2 h-full flex flex-col gap-6 w-64 bg-white rounded-2xl shadow">
      <div className="px-4">
        <h2 className="m-0 text-[#1d4ed8] text-xl font-bold">ExpenseNest</h2>
        <span className="block text-xs text-gray-400 tracking-wider leading-5">
          Financial Sanctuary
        </span>
      </div>
      <nav className="flex-1">
        <ul className="flex flex-col gap-1 relative">
          {links.map((link) => {
            const isActive = location.pathname === link.link;

            return (
              <li key={link.name} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[#EFF6FF] rounded-md border-r-4 border-[#1D4ED8]"
                    transition={{ type: "spring", stiffness: 600, damping: 60 }}
                  />
                )}

                <NavLink
                  to={link.link}
                  className={`relative z-10 flex items-center gap-1 px-2 py-1 text-sm ${
                    isActive
                      ? "text-[#1D4ED8]"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <div className="size-8 flex items-center justify-center">
                    {link.icon}
                  </div>
                  {link.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        <NavLink
          to="/app/settings"
          className={`relative z-10 flex items-center gap-1 px-2 py-2 text-sm `}
        >
          <div className="size-8 flex items-center justify-center">
            {<Settings />}
          </div>
          Settings
        </NavLink>
      </div>
    </aside>
  );
};

export default SideBar;
