import React from "react";
import { Loader as LucideLoader } from "lucide-react";
interface LoaderProps {
  size?: number; // optional size for spinner
  message?: string; // optional text under the spinner
  fullScreen?: boolean; // if true, center on whole screen
}

const Loader: React.FC<LoaderProps> = ({ size, message, fullScreen = false }) => {
  const loaderContent = (
<div className="flex items-center justify-center space-x-3">
  {message && (
    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {message}
    </p>
  )}
<div
  className="text-zinc-200 animate-[spin_3s_linear_infinite]"
>
  <LucideLoader size={size} />
</div>

</div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};

export default Loader;
