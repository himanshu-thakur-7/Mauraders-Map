interface MapToggleProps {
  isActive: boolean;
  setIsActive: (isActive: boolean) => void;
}

const MapToggle = ({ isActive, setIsActive }: MapToggleProps) => {
  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <button 
      onClick={handleToggle}
      className="toggle-map border-2 bg-transparent font-['Lobster_Two'] text-2xl px-6 py-1.5 cursor-pointer relative text-white hover:before:w-full hover:before:h-full hover:before:transition-all hover:before:duration-300 hover:before:left-[-2px] hover:before:top-[-2px] before:content-[''] before:absolute before:w-[calc(100%-8px)] before:h-[51px] before:right-0.5 before:top-0.5 before:border-2"
    >
      {isActive ? 'Mischief Managed' : 'I solemnly swear'}
    </button>
  );
};

export default MapToggle;