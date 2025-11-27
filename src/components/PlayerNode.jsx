import React from 'react';

const PlayerNode = ({ number, position, teamColor, isServing, gameMode }) => {
  // 團體模式：後中、左前、右前
  // 雙打模式：左、右
  const posLabel = gameMode === 'doubles' 
    ? ["左", "右"]
    : ["後中", "左前", "右前"];
  
  return (
    <div className={`${teamColor} bg-opacity-90 rounded-lg p-4 flex flex-col items-center justify-center min-w-[90px] shadow-lg relative`}>
      <div className="text-4xl font-bold">{number}</div>
      <div className="text-sm mt-1 opacity-90">{posLabel[position]}</div>
      {isServing && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
          發球
        </div>
      )}
    </div>
  );
};

export default PlayerNode;
