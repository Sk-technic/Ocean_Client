import React from 'react'
import { FaLinkedinIn } from "react-icons/fa";
import { useTheme } from '../../hooks/theme/usetheme';

const LinkedinAuthBtn = () => {
    const {theme} = useTheme()
    return (
        <main className="flex flex-col items-center justify-center gap-1">

            <button
                className={`border theme-border shadow-lg p-3 hover:cursor-pointer dark:bg-indigo-200/10 rounded-full`}>
                <FaLinkedinIn size={20} className='text-indigo-500' />
            </button>
        </main>)
}

export default LinkedinAuthBtn