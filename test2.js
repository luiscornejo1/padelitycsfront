                    pendingBenchDecision ? (
                      // --- MANUAL BENCH SELECTION UI ---
                      <div className="bg-slate-900/60 border border-emerald-500/30 p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 left-0 w-1 bg-emerald-500 h-full"></div>
                        
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white mb-1">Rotación Manual</h4>
                            {pendingBenchDecision.winnersMustSplit ? (
                              <p className="text-xs text-slate-400 leading-relaxed">
                                La pareja ganadora ya jugó 2 veces junta y <strong className="text-emerald-400">debe separarse</strong>. Elige quién irá a la banca.
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 leading-relaxed">
                                Elige quién del equipo perdedor irá a la banca.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Selecciona quién descansa en el siguiente partido:
                          </span>
                          <div className="grid grid-cols-2 gap-3">
                            {(pendingBenchDecision.winnersMustSplit ? pendingBenchDecision.winners : pendingBenchDecision.losers).map(playerId => {
                              const player = activeTournament.players.find(p => p.id === playerId);
                              return (
                                <button
                                  key={playerId}
                                  onClick={() => {
                                    let finalResting = [playerId];
                                    if (pendingBenchDecision.count === 6) {
                                      if (pendingBenchDecision.winnersMustSplit) {
                                        // Include a loser randomly if winner is picked for 6 players
                                        finalResting.push(pendingBenchDecision.losers[Math.floor(Math.random() * 2)]);
                                      } else {
                                        finalResting = [...pendingBenchDecision.losers];
                                      }
                                    }
                                    executeNextMatch(finalResting);
                                  }}
                                  className="bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all p-4 rounded-xl flex flex-col items-center gap-2 group"
                                >
                                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:border-amber-500/40">
                                    <User className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
                                  </div>
                                  <span className="text-sm font-bold text-white group-hover:text-amber-400">
                                    {player?.name}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                          {pendingBenchDecision.count === 6 && !pendingBenchDecision.winnersMustSplit && (
                            <div className="mt-2 text-center text-[10px] text-slate-500 italic">
                              En formato de 6 jugadores, ambos perdedores irán a la banca. Haz clic en cualquiera para continuar.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // --- NORMAL MATCH SCORE INPUT ---
                      <div className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                        
                        {/* Visual Arena representation */}
                        <div className="flex flex-col gap-4 relative z-10">
                          
                          {/* Team 1 Card */}
                          <div className="bg-slate-900/85 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Pareja A</span>
                              <div className="text-md font-bold text-white">
                                {activeTournament.players.find(p => p.id === currentMatch.team1[0])?.name}
                              </div>
                              <div className="text-md font-bold text-white">
                                {activeTournament.players.find(p => p.id === currentMatch.team1[1])?.name}
                              </div>
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={scoreT1}
                              onChange={(e) => setScoreT1(e.target.value)}
                              placeholder="0"
                              className="w-16 h-16 bg-slate-950/80 border border-slate-700/60 rounded-xl text-center text-3xl font-black text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all placeholder:text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>

                          {/* VS Indicator */}
                          <div className="flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black text-slate-400 tracking-wider">
                              VS
                            </div>
                          </div>

                          {/* Team 2 Card */}
                          <div className="bg-slate-900/85 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-500/20 transition-all">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Pareja B</span>
                              <div className="text-md font-bold text-white">
                                {activeTournament.players.find(p => p.id === currentMatch.team2[0])?.name}
                              </div>
                              <div className="text-md font-bold text-white">
                                {activeTournament.players.find(p => p.id === currentMatch.team2[1])?.name}
                              </div>
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={scoreT2}
                              onChange={(e) => setScoreT2(e.target.value)}
                              placeholder="0"
                              className="w-16 h-16 bg-slate-950/80 border border-slate-700/60 rounded-xl text-center text-3xl font-black text-white focus:outline-none focus:border-emerald-500 focus:bg-slate-950 transition-all placeholder:text-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>

                        </div>

                        {/* Validation Error Alert */}
                        {validationError && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                            <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-red-400 font-medium">{validationError}</span>
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={handleRegisterScore}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        >
                          <CheckCircle className="w-4.5 h-4.5" />
                          Registrar Partido y Rotar
                        </button>
                      </div>
                    )
