import React from 'react';
import PlayerNode from './PlayerNode';

const HalfCourt = ({ team, isTop, isServingTeam, isSwapped, gameMode }) => {
  const p = team.players;
  
  // 雙打模式：2 人並排，位置固定不輪轉
  if (gameMode === 'doubles') {
    return (
      <div className="flex-1 bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-center relative">
        <div className="flex justify-around gap-4 items-center">
          <PlayerNode 
            number={p[0]} 
            position={0} 
            teamColor={team.color} 
            isServing={isServingTeam}
            gameMode={gameMode}
          />
          <PlayerNode 
            number={p[1]} 
            position={1} 
            teamColor={team.color} 
            isServing={false}
            gameMode={gameMode}
          />
        </div>
        <div className="text-center mt-3 font-bold text-lg">
          {team.name} {isServingTeam && "🎾"}
          {isSwapped && <span className="text-xs ml-2 text-yellow-400">(已換場)</span>}
        </div>
      </div>
    );
  }
  
  // 團體模式：3 人（後中在後，左前右前在前）
  // p[0] = 後中 (Tekong)
  // p[1] = 左前 (Left Inside) 
  // p[2] = 右前 (Right Inside)
  
  return (
    <div className="flex-1 bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between relative">
      {isTop ? (
        // Top Team (對手視角) - 後中在上方遠離網，左前右前在下方靠近網
        <>
          <div className="flex justify-center mb-4">
            <PlayerNode 
              number={p[0]} 
              position={0} 
              teamColor={team.color} 
              isServing={isServingTeam}
              gameMode={gameMode}
            />
          </div>
          <div className="flex justify-around gap-2 mt-auto">
            <PlayerNode 
              number={p[1]} 
              position={1} 
              teamColor={team.color} 
              isServing={false}
              gameMode={gameMode}
            />
            <PlayerNode 
              number={p[2]} 
              position={2} 
              teamColor={team.color} 
              isServing={false}
              gameMode={gameMode}
            />
          </div>
        </>
      ) : (
        // Bottom Team (自己視角) - 左前右前在上方靠近網，後中在下方遠離網
        <>
          <div className="flex justify-around gap-2 mb-4">
            <PlayerNode 
              number={p[1]} 
              position={1} 
              teamColor={team.color} 
              isServing={false}
              gameMode={gameMode}
            />
            <PlayerNode 
              number={p[2]} 
              position={2} 
              teamColor={team.color} 
              isServing={false}
              gameMode={gameMode}
            />
          </div>
          <div className="flex justify-center mt-auto">
            <PlayerNode 
              number={p[0]} 
              position={0} 
              teamColor={team.color} 
              isServing={isServingTeam}
              gameMode={gameMode}
            />
          </div>
        </>
      )}
      <div className="text-center mt-2 font-bold text-lg">
        {team.name} {isServingTeam && "🎾"}
        {isSwapped && <span className="text-xs ml-2 text-yellow-400">(已換場)</span>}
      </div>
    </div>
  );
};

export default HalfCourt;
