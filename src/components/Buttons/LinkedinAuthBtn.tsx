import { FaLinkedinIn } from "react-icons/fa";

const LinkedinAuthBtn = () => {
    return (
        <main className="flex flex-col items-center justify-center gap-1">

            <button
                className={`border theme-border shadow-lg p-3 cursor-pointer dark:bg-indigo-200/10 rounded-full`}>
                <FaLinkedinIn size={20} className='text-indigo-500' />
            </button>
        </main>)
}

export default LinkedinAuthBtn