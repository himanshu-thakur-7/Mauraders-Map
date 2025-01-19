interface AvatarProps {
  isAnimating: boolean;
  hairStyle: 'short' | 'long';
}

const Avatar = ({ isAnimating, hairStyle }: AvatarProps) => {
  return (
    <div className="avatar">
      <div className={`avatar__hair ${hairStyle === 'long' ? 'female' : ''}`} />
      <div className="avatar__head">
        <div className="avatar__eyes left" />
        <div className="avatar__eyes right" />
        <div className={`avatar__mouth ${isAnimating ? 'animate' : ''}`} />
      </div>
      <div className="avatar__ears left" />
      <div className="avatar__ears right" />
      <div className="avatar__coat">
        <div className="avatar__shirt">
          <div className="avatar__tie" />
        </div>
      </div>
    </div>
  );
};

export default Avatar;