interface InstructionsProps {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
}

const Instructions = ({ isActive, setIsActive }: InstructionsProps) => {
  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="text-center text-white">
      <button 
        onClick={handleToggle}
        className="toggle-map border-2 mt-8 bg-transparent font-['Lobster_Two'] text-[34px] px-8 py-2 cursor-pointer relative text-white hover:before:w-full hover:before:h-full hover:before:transition-all hover:before:duration-300 hover:before:left-[-2px] hover:before:top-[-2px] before:content-[''] before:absolute before:w-[calc(100%-8px)] before:h-[51px] before:left-0.5 before:top-0.5 before:border-2"
      >
         {isActive ? 'Mischief Managed' : 'I solemnly swear'}
      </button>
    </div>
  );
};

export default Instructions;