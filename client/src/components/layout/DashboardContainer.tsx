import SideBar from "./SideBar";
import AnimatedOutlet from "../animated/AnimatedOutlet";

const DashboardContainer = () => {

  return (
    <div className="flex min-h-screen bg-[#F8F9FF] overflow-hidden">
      <div className="flex-1 max-w-64">
        <SideBar />
      </div>

      <div className="flex-1 relative overflow-hidden ">
       <AnimatedOutlet />
      </div>
    </div>
  );
};

export default DashboardContainer;

// import SideBar from './SideBar'
// import { Outlet } from 'react-router-dom'

// const DashboardContainer = () => {
//   return (
//     <div className='flex min-h-screen bg-[#F8F9FF]'>
//        <div className='flex-1 max-w-64'>
//            <SideBar />
//        </div>
//        <div className='flex-1'>
//            <Outlet />
//        </div>
//     </div>
//   )
// }

// export default DashboardContainer
