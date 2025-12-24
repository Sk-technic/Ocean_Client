const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-2 p-2">
      <span className="w-[5px] h-[5px] bg-white rounded-full dot" style={{ animationDelay: "0s" }}></span>
      <span className="w-[5px] h-[5px] bg-white rounded-full dot" style={{ animationDelay: "0.2s" }}></span>
      <span className="w-[5px] h-[5px] bg-white rounded-full dot" style={{ animationDelay: "0.4s" }}></span>
    </div>
  );
};

export default TypingIndicator;
