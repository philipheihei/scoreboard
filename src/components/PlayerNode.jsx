import React from 'react';

const PlayerNode = ({ number, position, teamColor, isServing }) => {
  const posLabel = ["後中", "左前", "右前"];
  
  return (
    <div className={`${teamColor} bg-opacity-90 rounded-lg p-3 flex flex-col items-center justify-center min-w-[70px] shadow-lg relative`}>
      <div className="text-2xl font-bold">{number}</div>
      <div className="text-xs mt-1 opacity-90">{posLabel[position]}</div>
      {isServing && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          發球
        </div>
      )}
    </div>
  );
};

export default PlayerNode;
