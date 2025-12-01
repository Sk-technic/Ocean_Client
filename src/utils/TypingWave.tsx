const TypingIndicator = () => {
  return (
    <div className="flex items-end gap-1 p-2">
      <span className="w-1 h-1 bg-white rounded-full dot" style={{ animationDelay: "0s" }}></span>
      <span className="w-1 h-1 bg-white rounded-full dot" style={{ animationDelay: "0.2s" }}></span>
      <span className="w-1 h-1 bg-white rounded-full dot" style={{ animationDelay: "0.4s" }}></span>
    </div>
  );
};

export default TypingIndicator;
