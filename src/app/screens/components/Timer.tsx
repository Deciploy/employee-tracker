import React from 'react';

interface TimerProps {
  seconds: number;
}

export const Timer: React.FC<TimerProps> = React.memo(({ seconds }) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  const timeToString = (n: number) => (n < 10 ? `0${n}` : n);

  return (
    <>
      {timeToString(h)}:{timeToString(m)}:{timeToString(s)}
    </>
  );
});
