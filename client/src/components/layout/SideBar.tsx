import { useNavigation } from "@/context/NavigationContext";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import {
  ChartNoAxesCombined,
  Goal,
  History,
  LayoutDashboard,
} from "lucide-react";

const SideBar = () => {
  const location = useLocation();
  const { setDirection } = useNavigation();

  const links = [
    {
      name: "Dashboard",
      link: "/app/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { name: "History", link: "/app/history", icon: <History size={18} /> },
    {
      name: "Analytics",
      link: "/app/analytics",
      icon: <ChartNoAxesCombined size={18} />,
    },
    { name: "Goals", link: "/app/goals", icon: <Goal size={18} /> },
  ];

  const currentIndex = links.findIndex((l) => l.link === location.pathname);

  return (
    <aside className="px-4 py-8 h-full flex flex-col gap-12">
      <div className="px-4">
        <h2 className="m-0 text-[#1d4ed8] text-2xl font-bold leading-none">
          ExpenseNest
        </h2>
        <span className="block text-[10px] text-gray-400 tracking-wider leading-5">
          FINANCIAL SANCTUARY
        </span>
      </div>
      <nav className="flex-1">
        <ul className="flex flex-col gap-1 relative">
          {links.map((link, index) => {
            const isActive = location.pathname === link.link;

            return (
              <li key={link.name} className="relative">
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-[#EFF6FF] rounded-md border-r-4 border-[#1D4ED8]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <NavLink
                  to={link.link}
                  onClick={() => {
                    const dir = index > currentIndex ? 1 : -1;
                    setDirection(dir);
                  }}
                  className={`relative z-10 flex items-center gap-3 px-4 py-3 text-sm ${
                    isActive
                      ? "text-[#1D4ED8]"
                      : "hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;

// import { useAuth } from "@/context/AuthContext";
// import {
//   ChartNoAxesCombined,
//   Goal,
//   History,
//   LayoutDashboard,
// } from "lucide-react";
// import { motion } from "motion/react";
// import { useLocation, NavLink } from "react-router-dom";

// const SideBar = () => {
//   const location = useLocation();

//   const links = [
//     {
//       name: "Dashboard",
//       link: "/app/dashboard",
//       icon: <LayoutDashboard size={18} />,
//     },
//     {
//       name: "History",
//       link: "/app/history",
//       icon: <History size={18} />,
//     },
//     {
//       name: "Analytics",
//       link: "/app/analytics",
//       icon: <ChartNoAxesCombined size={18} />,
//     },
//     {
//       name: "Goals",
//       link: "/app/goals",
//       icon: <Goal size={18} />,
//     },
//   ];

//   return (
//     <aside className="px-4 py-8 h-full flex flex-col gap-12">
//       {/* Logo */}
//       <div className="px-4">
//         <h2 className="m-0 text-[#1d4ed8] text-2xl font-bold leading-none">
//           ExpenseNest
//         </h2>
//         <span className="block text-[10px] text-gray-400 tracking-wider leading-5">
//           FINANCIAL SANCTUARY
//         </span>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1">
//         <ul className="flex flex-col gap-1 relative">
//           {links.map((link) => {
//             const isActive = location.pathname === link.link;

//             return (
//               <li key={link.name} className="relative">
//                 {isActive && (
//                   <motion.div
//                     layoutId="active-pill"
//                     className="absolute inset-0 bg-[#EFF6FF] rounded-md border-r-4 border-[#1D4ED8]"
//                     transition={{
//                       type: "spring",
//                       stiffness: 500,
//                       damping: 30,
//                     }}
//                   />
//                 )}

//                 <NavLink
//                   to={link.link}
//                   className={`relative z-10 flex items-center gap-3 px-4 py-3 text-sm ${
//                     isActive
//                       ? "text-[#1D4ED8]"
//                       : "hover:bg-gray-200 text-gray-700"
//                   }`}
//                 >
//                   {link.icon}
//                   {link.name}
//                 </NavLink>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       {/* Profile */}
//       {/* <ProfileSection /> */}
//     </aside>
//   );
// };

// export default SideBar;

// const ProfileSection = ()=>{
//     const {user} = useAuth();
//     return (
//         <div className="flex items-center gap-3 px-4 py-3 mt-auto rounded-md hover:bg-gray-200 bg-[#F8F9FF">
//             <img className=" size-10 rounded-full" src={user?.picture ? user?.picture : "/default-profile.png"} alt={user?.name} />
//             <div>
//                 <p className="text-xs font-bold">{user?.name}</p>
//                 <p className="text-[10px] leading-5 text-gray-500">{user?.email}</p>
//             </div>
//         </div>
//     )

// }
