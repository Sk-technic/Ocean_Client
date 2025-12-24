import React, { useEffect } from 'react'
import SettingNavigation from './SettingNavigation'
import { Outlet } from 'react-router-dom'
import './settings.css'
import { useGetMuteUsers } from '../../hooks/follow/followHook'
import { useGetBlockedUsers } from '../../hooks/user/userHook'

const SettingsLayout: React.FC = () => {
  const { loadInitial, } = useGetMuteUsers()
const {initialfetch} = useGetBlockedUsers()
  useEffect(() => {
    loadInitial()
    initialfetch()
  }, [])

  return (
    <div className='w-full  h-full flex items-center justify-between md:pl-[110px]'>
      <main className='bg-transparent backdrop-blur-md w-full border-l-2 theme-border h-full flex items-center justify-between p-3 gap-2'>
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
