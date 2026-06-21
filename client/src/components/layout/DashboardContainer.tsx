import SideBar from "./SideBar";
// import AnimatedOutlet from "../animated/AnimatedOutlet";
import BottomBar from "./BottomBar";
import Header from "./Header";
import { Outlet, useNavigation } from "react-router-dom";
import DashboardHeader from "@/features/dashboard/components/DashboardHeader";
import { TransactionFormDialogProvider } from "@/features/transactions/TransactionFormDialogProvider";
import Spinner from "../animated/Spinner";

const DashboardContainer = () => {
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";
  return (
    <TransactionFormDialogProvider>
      <div className="flex sm:flex-row flex-col h-screen w-full max-w-500 mx-auto sm:overflow-y-hidden">
        <Header />

        <div className="max-sm:hidden p-4 px-2 overflow-hidden">
          <SideBar />
        </div>

        <div>
          <BottomBar />
        </div>

        <div className="flex-1 min-w-0 pb-28 sm:p-4 sm:px-2">
          <div className="bg-white rounded-2xl shadow h-full overflow-y-auto no-scrollbar">
            <DashboardHeader />
            {isNavigating ? <div className="w-full h-full flex justify-center items-center">
              <Spinner />
            </div> : <Outlet />}
          </div>
        </div>
      </div>
    </TransactionFormDialogProvider>
  );
};

export default DashboardContainer;
