import { FaMeta } from "react-icons/fa6";

const MetaButoon = () => {
  return (
      <main className="flex flex-col items-center justify-center gap-1">

          <button
              className={`border theme-border shadow-lg p-3 cursor-pointer dark:bg-blue-300/10 rounded-full`}>
              <FaMeta size={20} className='text-blue-500' />
          </button>
      </main>
  )
}

export default MetaButoon