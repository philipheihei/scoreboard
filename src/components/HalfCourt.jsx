import React from 'react';
import PlayerNode from './PlayerNode';

const HalfCourt = ({ team, isTop, isServingTeam, isSwapped }) => {
  const p = team.players;
  
  return (
    <div className="flex-1 bg-gray-800 bg-opacity-50 rounded-xl p-4 flex flex-col justify-between relative">
      {isTop ? (
        <>
          <div className="flex justify-around gap-2 mb-auto">
            <PlayerNode 
              number={p[1]} 
              position={1} 
              teamColor={team.color} 
              isServing={isServingTeam}
            />
            <PlayerNode 
              number={p[2]} 
              position={2} 
              teamColor={team.color} 
              isServing={false}
            />
          </div>
          <div className="flex justify-center mt-4">
            <PlayerNode 
              number={p[0]} 
              position={0} 
              teamColor={team.color} 
              isServing={false}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            <PlayerNode 
              number={p[0]} 
              position={0} 
              teamColor={team.color} 
              isServing={isServingTeam}
            />
          </div>
          <div className="flex justify-around gap-2 mt-auto">
            <PlayerNode 
              number={p[1]} 
              position={1} 
              teamColor={team.color} 
              isServing={false}
            />
            <PlayerNode 
              number={p[2]} 
              position={2} 
              teamColor={team.color} 
              isServing={false}
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
