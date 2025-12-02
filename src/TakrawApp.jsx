import React, { useState } from 'react';
import { ArrowRightLeft, Undo2, Repeat } from 'lucide-react';
import PlayerNode from './components/PlayerNode';
import HalfCourt from './components/HalfCourt';
import SubstitutionModal from './components/SubstitutionModal';

const TakrawApp = () => {
  // --- 遊戲模式 ---
  const [gameMode, setGameMode] = useState(null); // 'doubles' 或 'team'
  
  // --- 遊戲狀態 ---
  const [teamA, setTeamA] = useState(null);
  const [teamB, setTeamB] = useState(null);
  const [servingTeam, setServingTeam] = useState('A');
  const [firstServerOfMatch, setFirstServerOfMatch] = useState('A');
  const [servingPlayerIndexA, setServingPlayerIndexA] = useState(0); // A隊當前發球員 (0 或 1)
  const [servingPlayerIndexB, setServingPlayerIndexB] = useState(0); // B隊當前發球員 (0 或 1)
  const [currentSet, setCurrentSet] = useState(1);
  const [gameHistory, setGameHistory] = useState([]);
  const [matchOver, setMatchOver] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subTeam, setSubTeam] = useState('A');
  const [swapMessage, setSwapMessage] = useState(null);
  const [matchStarted, setMatchStarted] = useState(false);

  // --- 開始畫面狀態 ---
  const [setupStep, setSetupStep] = useState(0); // 0 = 選擇模式, 1 = 輸入球員, 2 = 選發球權
  const [teamAInput, setTeamAInput] = useState('1, 2, 3, 4, 5, 6');
  const [teamBInput, setTeamBInput] = useState('11, 12, 13, 14, 15, 16');
  const [setupError, setSetupError] = useState(null);
  const [selectedFirstServer, setSelectedFirstServer] = useState(null);

  // --- 核心邏輯函數 ---
  const saveState = () => {
    const currentState = {
      teamA: JSON.parse(JSON.stringify(teamA)),
      teamB: JSON.parse(JSON.stringify(teamB)),
      servingTeam,
      currentSet,
      matchOver,
      isSwapped,
      servingPlayerIndexA,
      servingPlayerIndexB
    };
    setGameHistory(prev => [...prev.slice(-20), currentState]);
  };

  const [isSwapped, setIsSwapped] = useState(false);
  
  const undo = () => {
    if (gameHistory.length === 0) return;
    const lastState = gameHistory[gameHistory.length - 1];
    setTeamA(lastState.teamA);
    setTeamB(lastState.teamB);
    setServingTeam(lastState.servingTeam);
    setCurrentSet(lastState.currentSet);
    setMatchOver(lastState.matchOver);
    setIsSwapped(lastState.isSwapped);
    setServingPlayerIndexA(lastState.servingPlayerIndexA);
    setServingPlayerIndexB(lastState.servingPlayerIndexB);
    setGameHistory(prev => prev.slice(0, -1));
  };

  // 藍隊（底部）用：順時針輪轉
  const rotatePlayersClockwise = (players) => {
    const [back, left, right] = players;
    return [right, back, left];  // [0,1,2] → [2,0,1]
  };
  
  // 紅隊（頂部）用：逆時針輪轉
  const rotatePlayersCounterClockwise = (players) => {
    const [back, left, right] = players;
    return [left, right, back];  // [0,1,2] → [1,2,0]
  };
  
  const showSwapAlert = (message) => {
    setSwapMessage(message);
    setTimeout(() => setSwapMessage(null), 3000);
  };

  const parsePlayerInput = (input) => {
    return input
      .split(/[,，\s]+/)
      .map(s => s.trim())
      .filter(s => s !== '')
      .map(s => parseInt(s, 10))
      .filter(n => !isNaN(n) && n >= 0);
  };

  const validateAndProceed = () => {
    setSetupError(null);
    const teamANumbers = parsePlayerInput(teamAInput);
    const teamBNumbers = parsePlayerInput(teamBInput);
  
    const minPlayers = gameMode === 'doubles' ? 2 : 3;
    const maxPlayers = gameMode === 'doubles' ? 2 : 6;
    const modeName = gameMode === 'doubles' ? '雙打' : '團體';
  
    if (teamANumbers.length < minPlayers) {
      setSetupError(`「自己」隊伍${modeName}模式需要 ${minPlayers} 位球員`);
      return;
    }
    if (teamANumbers.length > maxPlayers) {
      setSetupError(`「自己」隊伍${modeName}模式最多 ${maxPlayers} 位球員`);
      return;
    }
    if (teamBNumbers.length < minPlayers) {
      setSetupError(`「對手」隊伍${modeName}模式需要 ${minPlayers} 位球員`);
      return;
    }
    if (teamBNumbers.length > maxPlayers) {
      setSetupError(`「對手」隊伍${modeName}模式最多 ${maxPlayers} 位球員`);
      return;
    }
    if (new Set(teamANumbers).size !== teamANumbers.length) {
      setSetupError("「自己」隊伍的球員號碼不能重複");
      return;
    }
    if (new Set(teamBNumbers).size !== teamBNumbers.length) {
      setSetupError("「對手」隊伍的球員號碼不能重複");
      return;
    }
  
    setSetupStep(2);
  };

  const startMatch = () => {
    if (!selectedFirstServer) {
      setSetupError("請選擇哪隊先發球");
      return;
    }
  
    const teamANumbers = parsePlayerInput(teamAInput);
    const teamBNumbers = parsePlayerInput(teamBInput);
  
    const playersPerTeam = gameMode === 'doubles' ? 2 : 3;
  
    const newTeamA = {
      name: "自己",
      players: teamANumbers.slice(0, playersPerTeam),
      bench: teamANumbers.slice(playersPerTeam),
      color: "bg-blue-600",
      score: 0,
      sets: 0
    };
  
    const newTeamB = {
      name: "對手",
      players: teamBNumbers.slice(0, playersPerTeam),
      bench: teamBNumbers.slice(playersPerTeam),
      color: "bg-red-600",
      score: 0,
      sets: 0
    };

    setTeamA(newTeamA);
    setTeamB(newTeamB);
    setServingTeam(selectedFirstServer);
    setFirstServerOfMatch(selectedFirstServer);
    setMatchStarted(true);
  };

    const handleScore = (winner) => {
      if (matchOver || !matchStarted) return;
      saveState();
    
      const isTeamA = winner === 'A';
      const scoringTeam = isTeamA ? teamA : teamB;
      const losingTeam = isTeamA ? teamB : teamA;
    
      const newScore = scoringTeam.score + 1;
      const enemyScore = losingTeam.score;
    
      const newScoreA = isTeamA ? newScore : teamA.score;
      const newScoreB = !isTeamA ? newScore : teamB.score;
    
      const isInDeuce = newScoreA >= 20 && newScoreB >= 20;
    
      let nextServingTeam;
      if (isInDeuce) {
        nextServingTeam = servingTeam === 'A' ? 'B' : 'A';
      } else {
        nextServingTeam = winner;
      }
    
      let updatedTeamA_Players = [...teamA.players];
      let updatedTeamB_Players = [...teamB.players];
    
      // 團體模式：失去發球權時，獲得發球權的隊伍輪轉
      if (gameMode === 'team' && nextServingTeam !== servingTeam) {
        if (nextServingTeam === 'A') {
          // A隊：底部=順時針，頂部=逆時針
          updatedTeamA_Players = isSwapped 
            ? rotatePlayersCounterClockwise(teamA.players) 
            : rotatePlayersClockwise(teamA.players);
        } else {
          // B隊：頂部=逆時針，底部=順時針
          updatedTeamB_Players = isSwapped 
            ? rotatePlayersClockwise(teamB.players) 
            : rotatePlayersCounterClockwise(teamB.players);
        }
      }
    
      // 雙打模式：隊內輪換發球員
      let newServingPlayerIndexA = servingPlayerIndexA;
      let newServingPlayerIndexB = servingPlayerIndexB;
      
      if (gameMode === 'doubles' && nextServingTeam !== servingTeam) {
        // 發球權轉換：新獲得發球權的隊伍換另一人發球
        if (nextServingTeam === 'A') {
          newServingPlayerIndexA = servingPlayerIndexA === 0 ? 1 : 0;
        } else {
          newServingPlayerIndexB = servingPlayerIndexB === 0 ? 1 : 0;
        }
      }
    
      let setWon = false;
      if (newScore >= 21 && (newScore - enemyScore) >= 2) {
        setWon = true;
      } else if (newScore === 25) {
        setWon = true;
      }
    
      if (setWon) {
        handleSetWin(winner, updatedTeamA_Players, updatedTeamB_Players, newScore, enemyScore);
      } else {
        setTeamA(prev => ({ ...prev, players: updatedTeamA_Players, score: newScoreA }));
        setTeamB(prev => ({ ...prev, players: updatedTeamB_Players, score: newScoreB }));
        setServingTeam(nextServingTeam);
        setServingPlayerIndexA(newServingPlayerIndexA);
        setServingPlayerIndexB(newServingPlayerIndexB);
      }
    };

  const handleSetWin = (winner, lastPosA, lastPosB, finalScore, finalEnemyScore) => {
    const isTeamA = winner === 'A';
    const newSetsA = teamA.sets + (isTeamA ? 1 : 0);
    const newSetsB = teamB.sets + (!isTeamA ? 1 : 0);

    const finalScoreA = isTeamA ? finalScore : finalEnemyScore;
    const finalScoreB = !isTeamA ? finalScore : finalEnemyScore;

    if (newSetsA === 2 || newSetsB === 2) {
      setTeamA(prev => ({ ...prev, score: finalScoreA, sets: newSetsA }));
      setTeamB(prev => ({ ...prev, score: finalScoreB, sets: newSetsB }));
      setMatchOver(true);
      showSwapAlert(`🏆 比賽結束！${winner === 'A' ? teamA.name : teamB.name} 獲勝！`);
      return;
    }

    const nextSet = currentSet + 1;
    setCurrentSet(nextSet);

    let nextSetServer;
    if (nextSet === 2) {
      nextSetServer = winner === 'A' ? 'B' : 'A';
    } else {
      nextSetServer = firstServerOfMatch;
    }

    setTeamA(prev => ({ ...prev, score: 0, sets: newSetsA, players: lastPosA }));
    setTeamB(prev => ({ ...prev, score: 0, sets: newSetsB, players: lastPosB }));
    setServingTeam(nextSetServer);
    setServingPlayerIndexA(0);
    setServingPlayerIndexB(0);
    setIsSwapped(false);
    showSwapAlert(`🎉 第 ${currentSet} 局結束！${winner === 'A' ? teamA.name : teamB.name} 獲勝！進入第 ${nextSet} 局！`);
  };

  const handleSubstitution = (playerOut, playerIn) => {
    saveState();
    const targetSetTeam = subTeam === 'A' ? setTeamA : setTeamB;
    
    targetSetTeam(prev => {
      const newPlayers = prev.players.map(p => p === playerOut ? playerIn : p);
      const newBench = prev.bench.filter(p => p !== playerIn);
      newBench.push(playerOut);
      
      return {
        ...prev,
        players: newPlayers,
        bench: newBench
      };
    });
    
    setShowSubModal(false);
  };

  // 手動交換對手發球順序（只用於雙打模式）
  const swapOpponentOrder = () => {
    const swappedPlayers = [teamB.players[1], teamB.players[0]];
    setTeamB({ ...teamB, players: swappedPlayers });
  };

  // --- 開始畫面 ---
  if (!matchStarted) {
    const teamANumbers = parsePlayerInput(teamAInput);
    const teamBNumbers = parsePlayerInput(teamBInput);
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4 flex items-center justify-center">
        <div className="max-w-4xl w-full bg-gray-800 bg-opacity-50 rounded-3xl p-8 backdrop-blur-sm">
          <h1 className="text-4xl font-bold text-center mb-2">⚽ 足毽計分板</h1>
          <p className="text-center text-gray-300 mb-8">
            {setupStep === 0 && '步驟 1/3：選擇比賽模式'}
            {setupStep === 1 && '步驟 2/3：輸入球員號碼'}
            {setupStep === 2 && '步驟 3/3：選擇發球權'}
          </p>
  
          {setupError && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center font-bold">
              {setupError}
            </div>
          )}
  
          {/* 步驟 0：選擇模式 */}
          {setupStep === 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-6">請選擇比賽模式</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 雙打模式 */}
                <button
                  onClick={() => {
                    setGameMode('doubles');
                    setTeamAInput('1, 2');
                    setTeamBInput('11, 12');
                    setSetupStep(1);
                  }}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 rounded-2xl p-8 transition-all transform hover:scale-105 border-4 border-purple-400/30"
                >
                  <div className="text-6xl mb-4">👥</div>
                  <div className="text-3xl font-bold mb-3">雙打 (Double)</div>
                  <div className="text-sm text-purple-200 space-y-2">
                    <div>✓ 每隊 2 人在場</div>
                    <div>✓ 無替補球員</div>
                    <div>✓ 輪流發球</div>
                  </div>
                </button>
  
                {/* 團體模式 */}
                <button
                  onClick={() => {
                    setGameMode('team');
                    setTeamAInput('1, 2, 3, 4, 5, 6');
                    setTeamBInput('11, 12, 13, 14, 15, 16');
                    setSetupStep(1);
                  }}
                  className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 rounded-2xl p-8 transition-all transform hover:scale-105 border-4 border-green-400/30"
                >
                  <div className="text-6xl mb-4">👥👥👥</div>
                  <div className="text-3xl font-bold mb-3">團體 (Team)</div>
                  <div className="text-sm text-green-200 space-y-2">
                    <div>✓ 每隊 3 人在場</div>
                    <div>✓ 最多 3 人後備</div>
                    <div>✓ 可換人</div>
                  </div>
                </button>
              </div>
            </div>
          )}
  
          {/* 步驟 1：輸入球員 */}
          {setupStep === 1 && (
            <div className="space-y-6">
              {/* 返回按鈕 */}
              <button
                onClick={() => {
                  setSetupStep(0);
                  setGameMode(null);
                  setSetupError(null);
                }}
                className="text-gray-400 hover:text-white mb-4"
              >
                ← 返回選擇模式
              </button>
  
              <div className="bg-gray-700 rounded-xl p-4 mb-4">
                <div className="text-center font-bold text-lg">
                  {gameMode === 'doubles' ? '🎾 雙打模式' : '👥 團體模式'}
                </div>
              </div>
  
              <div className="bg-blue-900 bg-opacity-30 p-6 rounded-xl">
                <h3 className="text-2xl font-bold mb-2">🔵 自己</h3>
                <p className="text-sm text-gray-300 mb-3">
                  已輸入 {teamANumbers.length} 人
                  {gameMode === 'doubles' && teamANumbers.length === 2 && ' ✓'}
                  {gameMode === 'team' && teamANumbers.length >= 3 && teamANumbers.length <= 6 && ' ✓'}
                </p>
                <textarea
                  value={teamAInput}
                  onChange={(e) => setTeamAInput(e.target.value)}
                  placeholder={gameMode === 'doubles' ? "例如：1, 2" : "例如：1, 2, 3, 4, 5, 6"}
                  className="w-full p-3 bg-gray-800 border border-blue-500/30 rounded-lg text-white text-lg focus:outline-none focus:border-blue-400"
                  rows="2"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {gameMode === 'doubles' 
                    ? '輸入 2 個號碼（左、右）' 
                    : '輸入 3-6 個號碼，前 3 位為場上球員（後中、左前、右前）'
                  }
                </p>
                
                {teamANumbers.length >= (gameMode === 'doubles' ? 2 : 3) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-300">預覽：</span>
                    {gameMode === 'doubles' ? (
                      <>
                        {teamANumbers.slice(0, 2).map((n, i) => (
                          <span key={i} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                            {n} {i === 0 ? '(左)' : '(右)'}
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        {teamANumbers.slice(0, 3).map((n, i) => (
                          <span key={i} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                            {n} {i === 0 ? '(後中)' : i === 1 ? '(左前)' : '(右前)'}
                          </span>
                        ))}
                        {teamANumbers.slice(3).map((n, i) => (
                          <span key={i + 3} className="bg-blue-600/50 px-3 py-1 rounded-full text-sm">
                            {n} (後備)
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
  
              <div className="bg-red-900 bg-opacity-30 p-6 rounded-xl">
                <h3 className="text-2xl font-bold mb-2">🔴 對手</h3>
                <p className="text-sm text-gray-300 mb-3">
                  已輸入 {teamBNumbers.length} 人
                  {gameMode === 'doubles' && teamBNumbers.length === 2 && ' ✓'}
                  {gameMode === 'team' && teamBNumbers.length >= 3 && teamBNumbers.length <= 6 && ' ✓'}
                </p>
                <textarea
                  value={teamBInput}
                  onChange={(e) => setTeamBInput(e.target.value)}
                  placeholder={gameMode === 'doubles' ? "例如：11, 12" : "例如：11, 12, 13, 14, 15, 16"}
                  className="w-full p-3 bg-gray-800 border border-red-500/30 rounded-lg text-white text-lg focus:outline-none focus:border-red-400"
                  rows="2"
                />
                <p className="text-xs text-gray-400 mt-2">
                  {gameMode === 'doubles' 
                    ? '輸入 2 個號碼' 
                    : '輸入 3-6 個號碼。如對方只有 5 人，輸入 5 個號碼即可'
                  }
                </p>
                
                {teamBNumbers.length >= (gameMode === 'doubles' ? 2 : 3) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-sm text-gray-300">預覽：</span>
                    {gameMode === 'doubles' ? (
                      <>
                        {teamBNumbers.slice(0, 2).map((n, i) => (
                          <span key={i} className="bg-red-600 px-3 py-1 rounded-full text-sm">
                            {n} {i === 0 ? '(左)' : '(右)'}
                          </span>
                        ))}
                      </>
                    ) : (
                      <>
                        {teamBNumbers.slice(0, 3).map((n, i) => (
                          <span key={i} className="bg-red-600 px-3 py-1 rounded-full text-sm">
                            {n} {i === 0 ? '(後中)' : i === 1 ? '(左前)' : '(右前)'}
                          </span>
                        ))}
                        {teamBNumbers.slice(3).map((n, i) => (
                          <span key={i + 3} className="bg-red-600/50 px-3 py-1 rounded-full text-sm">
                            {n} (後備)
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
  
              <button
                onClick={validateAndProceed}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all text-xl"
              >
                下一步：選擇發球權 →
              </button>
            </div>
          )}
  
          {/* 步驟 2：選擇發球權 */}
          {setupStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-center mb-6">請選擇哪隊先發球</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSelectedFirstServer('A')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    selectedFirstServer === 'A'
                      ? 'bg-blue-600 border-yellow-400 scale-105'
                      : 'bg-blue-600/30 border-blue-600/50 hover:bg-blue-600/50'
                  }`}
                >
                  <div className="text-3xl mb-2">🔵</div>
                  <div className="font-bold text-xl">自己</div>
                  <div className="text-sm mt-1">先發球</div>
                  {selectedFirstServer === 'A' && (
                    <div className="mt-2 text-2xl">✓</div>
                  )}
                </button>
  
                <button
                  onClick={() => setSelectedFirstServer('B')}
                  className={`p-6 rounded-xl border-4 transition-all ${
                    selectedFirstServer === 'B'
                      ? 'bg-red-600 border-yellow-400 scale-105'
                      : 'bg-red-600/30 border-red-600/50 hover:bg-red-600/50'
                  }`}
                >
                  <div className="text-3xl mb-2">🔴</div>
                  <div className="font-bold text-xl">對手</div>
                  <div className="text-sm mt-1">先發球</div>
                  {selectedFirstServer === 'B' && (
                    <div className="mt-2 text-2xl">✓</div>
                  )}
                </button>
              </div>
  
              <div className="bg-gray-700 rounded-xl p-4 mb-6">
                <h4 className="font-bold mb-3">球員名單確認</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-blue-400 font-bold">自己：</span>
                    <div>
                      場上：{parsePlayerInput(teamAInput).slice(0, gameMode === 'doubles' ? 2 : 3).join(', ')}
                    </div>
                    {gameMode === 'team' && parsePlayerInput(teamAInput).length > 3 && (
                      <div className="text-gray-400">後備：{parsePlayerInput(teamAInput).slice(3).join(', ')}</div>
                    )}
                  </div>
                  <div>
                    <span className="text-red-400 font-bold">對手：</span>
                    <div>
                      場上：{parsePlayerInput(teamBInput).slice(0, gameMode === 'doubles' ? 2 : 3).join(', ')}
                    </div>
                    {gameMode === 'team' && parsePlayerInput(teamBInput).length > 3 && (
                      <div className="text-gray-400">後備：{parsePlayerInput(teamBInput).slice(3).join(', ')}</div>
                    )}
                  </div>
                </div>
              </div>
  
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSetupStep(1);
                    setSetupError(null);
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all"
                >
                  ← 返回修改
                </button>
                <button
                  onClick={startMatch}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-all"
                >
                  開始比賽 🎾
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 比賽畫面 ---
  const topTeam = isSwapped ? teamA : teamB;
  const bottomTeam = isSwapped ? teamB : teamA;
  const topTeamKey = isSwapped ? 'A' : 'B';
  const bottomTeamKey = isSwapped ? 'B' : 'A';
  const isTopServing = servingTeam === topTeamKey;
  const isBottomServing = servingTeam === bottomTeamKey;
  const isDeuce = teamA.score >= 20 && teamB.score >= 20;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white flex flex-col">
      {/* 頂部資訊列（含復原按鈕） */}
      <div className="bg-gray-900 bg-opacity-80 p-3 flex justify-between items-center">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-white">Set {currentSet}</div>
          {isDeuce && <div className="text-yellow-400 font-bold text-xs">DEUCE!</div>}
        </div>
        <h1 className="text-xl font-bold flex-1 text-center">⚽ 足毽計分板</h1>
        <div className="flex-1 flex justify-end gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg text-gray-300 hover:text-white"
            title="返回主頁"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </button>
          <button
            onClick={undo}
            disabled={gameHistory.length === 0}
            className={`p-2 rounded-lg ${
              gameHistory.length === 0
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-orange-400 hover:text-orange-300'
            }`}
            title={`復原上一步 ${gameHistory.length > 0 ? `(${gameHistory.length})` : ''}`}
          >
            <Undo2 size={24} />
          </button>
        </div>
      </div>

      {isDeuce && (
        <div className="bg-yellow-600 text-black text-center py-2 font-bold text-sm">
          ⚡ DEUCE 模式：輪流發球直至分出勝負！
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {/* 分數板 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleScore('A')}
            className={`flex-1 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${teamA.color} bg-opacity-90 hover:bg-opacity-100 border-4 ${
              servingTeam === 'A' ? 'border-yellow-400' : 'border-transparent'
            }`}
          >
            <div className="text-sm font-bold">{teamA.name}</div>
            <div className="text-xs">局數: {teamA.sets}</div>
            <div className="text-6xl font-bold mt-2">{teamA.score}</div>
          </button>

          <button
            onClick={() => handleScore('B')}
            className={`flex-1 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${teamB.color} bg-opacity-90 hover:bg-opacity-100 border-4 ${
              servingTeam === 'B' ? 'border-yellow-400' : 'border-transparent'
            }`}
          >
            <div className="text-sm font-bold">{teamB.name}</div>
            <div className="text-xs">局數: {teamB.sets}</div>
            <div className="text-6xl font-bold mt-2">{teamB.score}</div>
          </button>
        </div>

        {/* 功能按鈕 */}
        <div className={gameMode === 'doubles' ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}>
          {gameMode === 'team' && (
            <>
              <button
                onClick={() => {
                  setSubTeam('A');
                  setShowSubModal(true);
                }}
                className="flex items-center justify-center gap-2 bg-blue-900 text-blue-200 py-3 rounded-lg hover:bg-blue-800"
              >
                <ArrowRightLeft size={16} />
                <span className="text-sm">自己換人</span>
              </button>
        
              <button
                onClick={() => {
                  setSubTeam('B');
                  setShowSubModal(true);
                }}
                className="flex items-center justify-center gap-2 bg-red-900 text-red-200 py-3 rounded-lg hover:bg-red-800"
              >
                <ArrowRightLeft size={16} />
                <span className="text-sm">對手換人</span>
              </button>
            </>
          )}
          
          {gameMode === 'doubles' && (
            <button
              onClick={swapOpponentOrder}
              className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
            >
              <Repeat size={16} />
              <span className="text-sm">對調對手開球順序</span>
            </button>
          )}
        </div>

        {/* 球場顯示 */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <HalfCourt
            team={topTeam}
            isTop={true}
            isServingTeam={isTopServing}
            isSwapped={isSwapped}
            gameMode={gameMode}
            servingPlayerIndex={topTeamKey === 'A' ? servingPlayerIndexA : servingPlayerIndexB}
          />

          <div className="bg-yellow-600 text-black text-center py-2 font-bold rounded-lg">
            NET (網)
          </div>

          <HalfCourt
            team={bottomTeam}
            isTop={false}
            isServingTeam={isBottomServing}
            isSwapped={isSwapped}
            gameMode={gameMode}
            servingPlayerIndex={bottomTeamKey === 'A' ? servingPlayerIndexA : servingPlayerIndexB}
          />
        </div>
      </div>

      {/* 提示訊息 */}
      {swapMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-50 animate-bounce">
          {swapMessage}
        </div>
      )}

      {/* 比賽結束畫面 */}
      {matchOver && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-10 text-center max-w-md">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold text-black mb-4">比賽結束!</h2>
            <p className="text-2xl text-black mb-6">
              獲勝者: {teamA.sets > teamB.sets ? teamA.name : teamB.name}
            </p>
            <div className="text-xl text-black mb-6">
              <div>比分: {teamA.sets} - {teamB.sets}</div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
              開始新比賽
            </button>
          </div>
        </div>
      )}

      {/* 替補選單 */}
      <SubstitutionModal
        showSubModal={showSubModal}
        setShowSubModal={setShowSubModal}
        subTeam={subTeam}
        teamA={teamA}
        teamB={teamB}
        handleSubstitution={handleSubstitution}
      />
    </div>
  );
};

export default TakrawApp;
