import React from 'react';
import { Users } from 'lucide-react';

const SubstitutionModal = ({ 
  showSubModal, 
  setShowSubModal, 
  subTeam, 
  teamA, 
  teamB, 
  handleSubstitution 
}) => {
  if (!showSubModal) return null;
  
  const targetTeam = subTeam === 'A' ? teamA : teamB;
  
  if (targetTeam.bench.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Users /> {targetTeam.name} 換人
            </h3>
            <button 
              onClick={() => setShowSubModal(false)}
              className="text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>
          </div>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🚫</div>
            <p className="text-xl mb-2">沒有後備球員可換</p>
            <p className="text-gray-400">該隊只有 3 位球員</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full border-2 border-gray-700 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Users /> {targetTeam.name} 換人
          </h3>
          <button 
            onClick={() => setShowSubModal(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-300 mb-4">選擇後備球員換下場上球員：</p>
        <div className="space-y-3">
          {targetTeam.bench.map((benchPlayer, idx) => (
            <div key={idx} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-600 text-white font-bold px-4 py-2 rounded-lg text-xl">
                  {benchPlayer}
                </div>
                <span className="text-2xl">→</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {targetTeam.players.map((activePlayer, i) => (
                  <button
                    key={i}
                    onClick={() => handleSubstitution(activePlayer, benchPlayer)}
                    className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 py-2 px-3 rounded-lg transition-colors font-medium"
                  >
                    換 {activePlayer}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubstitutionModal;
