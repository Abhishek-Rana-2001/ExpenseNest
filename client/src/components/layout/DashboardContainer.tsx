import SideBar from "./SideBar";
// import AnimatedOutlet from "../animated/AnimatedOutlet";
import BottomBar from "./BottomBar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";

const DashboardContainer = () => {
  return (
    <div className="flex sm:flex-row flex-col h-screen overflow-y-hidden">
      <Header />

      <div className="max-sm:hidden p-4 px-2 overflow-hidden">
        <SideBar />
      </div>

      <div>
        <BottomBar />
      </div>

      <div className="flex-1 min-w-0 pb-20 sm:p-4 sm:px-2">
        <div className="bg-white rounded-2xl shadow h-full overflow-y-auto no-scrollbar">
          <DashboardHeader />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardContainer;
