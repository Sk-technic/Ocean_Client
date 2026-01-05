import React from 'react'
import SettingNavigation from './SettingNavigation'
import { Outlet } from 'react-router-dom'
import './settings.css'

const SettingsLayout: React.FC = () => {


  return (
    <div className='w-full  h-full flex items-center justify-between'>
      <main className='bg-transparent backdrop-blur-md w-full h-full flex items-center justify-between p-3 gap-2'>
        <section className='h-full'>
          <SettingNavigation />
        </section>

        <section className='relative h-full w-full'>
          <Outlet />
        </section>
      </main>
    </div>
  )
}

export default SettingsLayout
