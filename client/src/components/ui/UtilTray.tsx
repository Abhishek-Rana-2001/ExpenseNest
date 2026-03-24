import { Bell, Settings } from 'lucide-react'


const UtilTray = ({}) => {
  return (
    <div className="flex items-center gap-4">
          <button className='p-2 rounded-full bg-white group cursor-pointer'>
            <Bell size={20} className='group-hover:animate-vibrate duration-300 transition-all ' />
          </button>
          <button  className='p-2 rounded-full bg-white group cursor-pointer'>
            <Settings size={20} className='group-hover:rotate-180 duration-300 transition-all' />
          </button>
        </div>
  )
}

export default UtilTray
