import { Goal, History, LayoutDashboard, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const BottomBar = () => {



    const links = [
    {
      name: "Dashboard",
      link: "/app/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "History", link: "/app/transactions", icon: <History size={20} /> },
    {
      name: "Goals",
      link: "/app/goals",
      icon: <Goal size={20} />,
    },
    { name: "Profile", link: "/app/profile", icon: <User size={20} /> },
  ];
  return (
    <div className="fixed bottom-0 w-full sm:hidden z-10 bg-white shadow border-t border-neutral-300">
       <div className="flex w-full p-2 mx-auto gap-1">
           {
            links.map((link)=>{
                return <NavLink
                    key={link.link}
                    to={link.link}
                    className={({isActive})=>
                        `flex-1 flex justify-center flex-col items-center gap-0.5 p-1 rounded-md ${isActive ? "text-blue-600 bg-blue-100" : "text-gray-500"}`
                    }
                >
                    {link.icon}
                    <span className="text-xs">
                        {link.name}
                    </span>
                </NavLink>
            })

               }
       </div>
    </div>
  )
}

export default BottomBar


