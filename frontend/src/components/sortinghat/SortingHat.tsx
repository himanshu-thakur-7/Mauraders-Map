interface SortingHatProps {
  isAnimating: boolean;
  selectedHouse: string;
}

const SortingHat = ({ isAnimating, selectedHouse }: SortingHatProps) => {
  return (
    <div className={`sorting-hat ${isAnimating ? 'animate' : ''}`}>
      <div className="sorting-hat__answer">
        {selectedHouse && `${selectedHouse}!`}
      </div>
      <div className="sorting-hat__top" />
      <div className="sorting-hat__eye left" />
      <div className="sorting-hat__eye right" />
      <div className="sorting-hat__mouth" />
      <div className="sorting-hat__base" />
    </div>
  );
};

export default SortingHat;