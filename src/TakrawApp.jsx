mport React, { useState } from 'react'; import { RotateCcw, Users, Trophy, ArrowRightLeft, Undo2, Play, ChevronRight } from 'lucide-react'; // --- 獨立元件 (移至外部以避免重新渲染問題) --- const PlayerNode = ({ number, position, teamColor, isServing }) => { const posLabel = ["後中", "左前", "右前"]; return (
{number} {posLabel[position]} {isServing && ( 發球 )}
); }; const TakrawApp = () => { // --- 遊戲狀態 --- const [teamA, setTeamA] = useState(null); const [teamB, setTeamB] = useState(null); const [servingTeam, setServingTeam] = useState('A'); const [firstServerOfMatch, setFirstServerOfMatch] = useState('A'); const [currentSet, setCurrentSet] = useState(1); const [gameHistory, setGameHistory] = useState([]); const [matchOver, setMatchOver] = useState(false); const [isSwapped, setIsSwapped] = useState(false); const [showSubModal, setShowSubModal] = useState(false); const [subTeam, setSubTeam] = useState('A'); const [swapMessage, setSwapMessage] = useState(null); const [matchStarted, setMatchStarted] = useState(false); // --- 開始畫面狀態 --- const [setupStep, setSetupStep] = useState(1); const [teamAInput, setTeamAInput] = useState('1, 2, 3, 4, 5, 6'); const [teamBInput, setTeamBInput] = useState('11, 12, 13, 14, 15, 16'); const [setupError, setSetupError] = useState(null); const [selectedFirstServer, setSelectedFirstServer] = useState(null); // --- 核心邏輯 --- const saveState = () => { const currentState = { teamA: JSON.parse(JSON.stringify(teamA)), teamB: JSON.parse(JSON.stringify(teamB)), servingTeam, currentSet, matchOver, isSwapped }; setGameHistory(prev => [...prev.slice(-20), currentState]); }; const undo = () => { if (gameHistory.length === 0) return; const lastState = gameHistory[gameHistory.length - 1]; setTeamA(lastState.teamA); setTeamB(lastState.teamB); setServingTeam(lastState.servingTeam); setCurrentSet(lastState.currentSet); setMatchOver(lastState.matchOver); setIsSwapped(lastState.isSwapped); setGameHistory(prev => prev.slice(0, -1)); }; const rotatePlayers = (players) => { const back = players[0]; const left = players[1]; const right = players[2]; return [right, back, left]; }; const showSwapAlert = (message) => { setSwapMessage(message); setTimeout(() => setSwapMessage(null), 3000); }; const parsePlayerInput = (input) => { return input .split(/[,，\s]+/) .map(s => s.trim()) .filter(s => s !== '') .map(s => parseInt(s, 10)) .filter(n => !isNaN(n) && n >= 0); }; const validateAndProceed = () => { setSetupError(null); const teamANumbers = parsePlayerInput(teamAInput); const teamBNumbers = parsePlayerInput(teamBInput); if (teamANumbers.length < 3) { setSetupError("「自己」隊伍至少需要 3 位球員"); return; } if (teamANumbers.length > 6) { setSetupError("「自己」隊伍最多 6 位球員"); return; } if (teamBNumbers.length < 3) { setSetupError("「對手」隊伍至少需要 3 位球員"); return; } if (teamBNumbers.length > 6) { setSetupError("「對手」隊伍最多 6 位球員"); return; } if (new Set(teamANumbers).size !== teamANumbers.length) { setSetupError("「自己」隊伍的球員號碼不能重複"); return; } if (new Set(teamBNumbers).size !== teamBNumbers.length) { setSetupError("「對手」隊伍的球員號碼不能重複"); return; } setSetupStep(2); }; const startMatch = () => { if (!selectedFirstServer) { setSetupError("請選擇哪隊先發球"); return; } const teamANumbers = parsePlayerInput(teamAInput); const teamBNumbers = parsePlayerInput(teamBInput); const newTeamA = { name: "自己", players: teamANumbers.slice(0, 3), bench: teamANumbers.slice(3), color: "bg-blue-600", score: 0, sets: 0 }; const newTeamB = { name: "對手", players: teamBNumbers.slice(0, 3), bench: teamBNumbers.slice(3), color: "bg-red-600", score: 0, sets: 0 }; setTeamA(newTeamA); setTeamB(newTeamB); setServingTeam(selectedFirstServer); setFirstServerOfMatch(selectedFirstServer); setMatchStarted(true); }; const handleScore = (winner) => { if (matchOver || !matchStarted) return; saveState(); const isTeamA = winner === 'A'; const scoringTeam = isTeamA ? teamA : teamB; const losingTeam = isTeamA ? teamB : teamA; const newScore = scoringTeam.score + 1; const enemyScore = losingTeam.score; const newScoreA = isTeamA ? newScore : teamA.score; const newScoreB = !isTeamA ? newScore : teamB.score; const isInDeuce = newScoreA >= 20 && newScoreB >= 20; let nextServingTeam; if (isInDeuce) { nextServingTeam = servingTeam === 'A' ? 'B' : 'A'; } else { nextServingTeam = winner; } let updatedTeamA_Players = [...teamA.players]; let updatedTeamB_Players = [...teamB.players]; if (nextServingTeam !== servingTeam) { if (nextServingTeam === 'A') { updatedTeamA_Players = rotatePlayers(teamA.players); } else { updatedTeamB_Players = rotatePlayers(teamB.players); } } // Check for Set Win: >= 21 and (Diff >= 2) OR (Score = 25) let setWon = false; if (newScore >= 21 && (newScore - enemyScore) >= 2) { setWon = true; } else if (newScore === 25) { setWon = true; // Set max score is 25 } if (setWon) { handleSetWin(winner, updatedTeamA_Players, updatedTeamB_Players, newScore, enemyScore); } else { setTeamA(prev => ({ ...prev, players: updatedTeamA_Players, score: newScoreA })); setTeamB(prev => ({ ...prev, players: updatedTeamB_Players, score: newScoreB })); setServingTeam(nextServingTeam); if (currentSet === 3 && !isSwapped && (newScoreA === 10 || newScoreB === 10)) { setIsSwapped(true); showSwapAlert("🔄 第三局達 10 分！自動交換場地！"); } } }; const handleSetWin = (winner, lastPosA, lastPosB, finalScore, finalEnemyScore) => { const isTeamA = winner === 'A'; const newSetsA = teamA.sets + (isTeamA ? 1 : 0); const newSetsB = teamB.sets + (!isTeamA ? 1 : 0); // Update final score for the set const finalScoreA = isTeamA ? finalScore : finalEnemyScore; const finalScoreB = !isTeamA ? finalScore : finalEnemyScore; if (newSetsA === 2 || newSetsB === 2) { setTeamA(prev => ({ ...prev, score: finalScoreA, sets: newSetsA })); setTeamB(prev => ({ ...prev, score: finalScoreB, sets: newSetsB })); setMatchOver(true); showSwapAlert(`🏆 比賽結束！${winner === 'A' ? teamA.name : teamB.name} 獲勝！`); return; } const nextSet = currentSet + 1; setCurrentSet(nextSet); // Determine next set server (Set 2: loser of Set 1. Set 3: winner of coin toss) let nextSetServer; if (nextSet === 2) { // Set 2: Server is the loser of Set 1 nextSetServer = winner === 'A' ? 'B' : 'A'; } else { // Set 3: Server is the winner of the coin toss (first server of match) nextSetServer = firstServerOfMatch; } setTeamA(prev => ({ ...prev, score: 0, sets: newSetsA, players: lastPosA })); setTeamB(prev => ({ ...prev, score: 0, sets: newSetsB, players: lastPosB })); setServingTeam(nextSetServer); setIsSwapped(false); showSwapAlert(`🎉 第 ${currentSet} 局結束！${winner === 'A' ? teamA.name : teamB.name} 獲勝！進入第 ${nextSet} 局！`); }; const handleSubstitution = (playerOut, playerIn) => { saveState(); const targetSetTeam = subTeam === 'A' ? setTeamA : setTeamB; targetSetTeam(prev => { // Replace playerOut with playerIn in the 'players' array const newPlayers = prev.players.map(p => p === playerOut ? playerIn : p); // Move playerOut to the bench, remove playerIn from the bench const newBench = prev.bench.filter(p => p !== playerIn); newBench.push(playerOut); return { ...prev, players: newPlayers, bench: newBench }; }); setShowSubModal(false); }; const handleManualSwap = () => { saveState(); setIsSwapped(prev => !prev); showSwapAlert("🔄 已手動交換場地！"); }; // --- UI 子元件 (保持在內部以使用 Closure 變數，但 StartScreen 已改為直接渲染) --- const HalfCourt = ({ team, isTop, isServingTeam }) => { const p = team.players; // 站位順序: [0] = 後中, [1] = 左前, [2] = 右前 // Top Court: Back (0) is furthest away, Left/Right (1, 2) are closest to net. // Bottom Court: Back (0) is closest, Left/Right (1, 2) are furthest. // We swap the positions in the array (1 and 2) to maintain Left/Right visual symmetry // for the user, regardless of which side they are on. // But the rotation logic is based on: [0, 1, 2] -> [2, 0, 1] (Right, Back, Left) return (
{isTop ? ( // Top Team (遠離自己) <>
) : ( // Bottom Team (靠近自己) <>
)}
{team.name} {isServingTeam && "🎾"} {isSwapped && (已換場)}
); }; const SubstitutionModal = () => { if (!showSubModal) return null; const targetTeam = subTeam === 'A' ? teamA : teamB; if (targetTeam.bench.length === 0) { return (
{targetTeam.name} 換人
setShowSubModal(false)} className="text-gray-400 hover:text-white text-2xl">✕
🚫
沒有後備球員可換

該隊只有 3 位球員

); } return (
{targetTeam.name} 換人
setShowSubModal(false)} className="text-gray-400 hover:text-white text-2xl">✕
選擇後備球員換下場上球員：

{targetTeam.bench.map((benchPlayer, idx) => (
{benchPlayer}
→
{targetTeam.players.map((activePlayer, i) => ( handleSubstitution(activePlayer, benchPlayer)} className="bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-800 py-2 px-3 rounded-lg transition-colors font-medium" > 換 {activePlayer} ))}
))}
); }; // --- 主要渲染邏輯 --- if (!matchStarted) { // [修復] 將 StartScreen 邏輯直接寫在這裡，而不是作為子元件 // 這樣可以避免輸入時因為元件重新掛載而導致失去焦點 (Focus) const teamANumbers = parsePlayerInput(teamAInput); const teamBNumbers = parsePlayerInput(teamBInput); return (
足毽計分板
{setupStep === 1 ? '步驟 1/2：輸入球員號碼' : '步驟 2/2：選擇發球權'}

{setupError && (
{setupError}
)} {setupStep === 1 ? (
自己
已輸入 {teamANumbers.length} 人
{teamAInput}
 setTeamAInput(e.target.value)} placeholder="例如：1, 2, 3, 4, 5, 6" className="w-full p-3 bg-gray-800 border border-blue-500/30 rounded-lg text-white text-lg focus:outline-none focus:border-blue-400" />
輸入 3-6 個號碼，用逗號或空格分隔。前 3 位為場上球員（後中、左前、右前）

{teamANumbers.length >= 3 && (
預覽： {teamANumbers.slice(0, 3).map((n, i) => ( {n} {i === 0 ? '(後中)' : i === 1 ? '(左前)' : '(右前)'} ))} {teamANumbers.slice(3).map((n, i) => ( {n} (後備) ))}
)}
對手
已輸入 {teamBNumbers.length} 人
{teamBInput}
 setTeamBInput(e.target.value)} placeholder="例如：11, 12, 13, 14, 15, 16" className="w-full p-3 bg-gray-800 border border-red-500/30 rounded-lg text-white text-lg focus:outline-none focus:border-red-400" />
輸入 3-6 個號碼。如對方只有 5 人，輸入 5 個號碼即可

{teamBNumbers.length >= 3 && (
預覽： {teamBNumbers.slice(0, 3).map((n, i) => ( {n} {i === 0 ? '(後中)' : i === 1 ? '(左前)' : '(右前)'} ))} {teamBNumbers.slice(3).map((n, i) => ( {n} (後備) ))}
)}
下一步：選擇發球權
) : (
請選擇哪隊先發球
setSelectedFirstServer('A')} className={`p-6 rounded-xl border-4 transition-all ${ selectedFirstServer === 'A' ? 'bg-blue-600 border-yellow-400 scale-105' : 'bg-blue-600/30 border-blue-600/50 hover:bg-blue-600/50' }`} >
自己
先發球
{selectedFirstServer === 'A' && (
✓
)} setSelectedFirstServer('B')} className={`p-6 rounded-xl border-4 transition-all ${ selectedFirstServer === 'B' ? 'bg-red-600 border-yellow-400 scale-105' : 'bg-red-600/30 border-red-600/50 hover:bg-red-600/50' }`} >
對手
先發球
{selectedFirstServer === 'B' && (
✓
)}
球員名單確認
自己
場上：{parsePlayerInput(teamAInput).slice(0, 3).join(', ')}
{parsePlayerInput(teamAInput).length > 3 && (
後備：{parsePlayerInput(teamAInput).slice(3).join(', ')}
)}
對手
場上：{parsePlayerInput(teamBInput).slice(0, 3).join(', ')}
{parsePlayerInput(teamBInput).length > 3 && (
後備：{parsePlayerInput(teamBInput).slice(3).join(', ')}
)}
{ setSetupStep(1); setSetupError(null); }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl transition-all" > 返回修改 開始比賽
)}
); } // --- 比賽畫面 --- const topTeam = isSwapped ? teamA : teamB; const bottomTeam = isSwapped ? teamB : teamA; const topTeamKey = isSwapped ? 'A' : 'B'; const bottomTeamKey = isSwapped ? 'B' : 'A'; const isTopServing = servingTeam === topTeamKey; const isBottomServing = servingTeam === bottomTeamKey; const isDeuce = teamA.score >= 20 && teamB.score >= 20; return (
Set {currentSet} {isDeuce && DEUCE!}
足毽計分板

{isDeuce && (
⚡ DEUCE 模式：輪流發球直至分出勝負！
)}
handleScore('A')} className={`flex-1 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${teamA.color} bg-opacity-90 hover:bg-opacity-100 border-4 ${servingTeam === 'A' ? 'border-yellow-400' : 'border-transparent'}`} >
{teamA.name}
局數: {teamA.sets}
{teamA.score}
handleScore('B')} className={`flex-1 rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 ${teamB.color} bg-opacity-90 hover:bg-opacity-100 border-4 ${servingTeam === 'B' ? 'border-yellow-400' : 'border-transparent'}`} >
{teamB.name}
局數: {teamB.sets}
{teamB.score}
{ setSubTeam('A'); setShowSubModal(true); }} className="flex items-center justify-center gap-2 bg-blue-900 text-blue-200 py-3 rounded-lg hover:bg-blue-800" > 自己換人 { setSubTeam('B'); setShowSubModal(true); }} className="flex items-center justify-center gap-2 bg-red-900 text-red-200 py-3 rounded-lg hover:bg-red-800" > 對手換人 {isSwapped ? '🔄 已換場 - 點擊換回' : '手動交換場地'}
{/* 核心變更：在行動裝置上的球場視圖加入 overflow-y-auto */}
{swapMessage && (
{swapMessage}
)} {matchOver && (
比賽結束!
獲勝者: {teamA.sets > teamB.sets ? teamA.name : teamB.name}

window.location.reload()} className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors" > 開始新比賽
)}
NET (網)
); }; export default TakrawApp;
