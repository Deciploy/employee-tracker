import React from 'react';

interface AvatarProps {
  photoUrl?: string;
  fullName?: string;
  size?: number;
  onClick?: () => void;
}

const AvatarBase: React.FC<AvatarProps> = ({
  photoUrl,
  fullName,
  size = 8,
  onClick,
}) => {
  const color = React.useMemo(() => {
    if (!fullName) {
      return;
    }

    return Math.floor(
      Math.abs(
        Math.sin(
          fullName
            .split('')
            .map((char) => char.charCodeAt(0))
            .reduce((curr, prev) => prev + curr, 0),
        ) * 16777215,
      ) % 16777215,
    ).toString(16);
  }, [fullName]);

  if (photoUrl) {
    return (
      <button
        onClick={onClick}
        className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
      >
        <img
          className={`w-${size} h-${size} rounded-full`}
          src={photoUrl}
          alt="user"
        />
      </button>
    );
  }

  if (fullName) {
    return (
      <div
        className={`flex items-center justify-center w-${size} h-${size} rounded-full focus:ring-4 focus:ring-gray-300 cursor-pointer`}
        style={{ backgroundColor: `#${color}` }}
        onClick={onClick}
      >
        <span className="text-white text-sm font-medium">
          {fullName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <button
      className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
      onClick={onClick}
    >
      <img
        className={`w-${size} h-${size} rounded-full`}
        src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
        alt="user"
      />
    </button>
  );
};

export const Avatar = React.memo(AvatarBase);
