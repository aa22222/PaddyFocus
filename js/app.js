const { useState, useEffect, useRef, useCallback, useMemo } = React;

function pickRandom(arr, excludeIndex) {
  if (arr.length <= 1) return { item: arr[0], index: 0 };
  let idx;
  do { idx = Math.floor(Math.random() * arr.length); } while (idx === excludeIndex);
  return { item: arr[idx], index: idx };
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function computeGrid(totalMinutes) {
  const cols = Math.min(14, Math.max(8, Math.round(8 + totalMinutes / 7)));
  const rows = Math.min(7, Math.max(4, Math.round(4 + totalMinutes / 22)));
  return { cols, rows };
}

function RicePatch({ state }) {
  return (
    <div className={"rice-patch rice-patch--" + state} aria-hidden="true">
      <img className="rice-patch__img" src="./assets/images/rice_cluster.png" alt="" loading="lazy" decoding="async" width="200" height="200" />
      <div className="rice-patch__stub"></div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [phase, setPhase] = useState('setup');
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);

  const [farmerLines, setFarmerLines] = useState(FALLBACK_FARMER_LINES);
  const [riceFacts, setRiceFacts] = useState(FALLBACK_RICE_FACTS);

  const [dialog, setDialog] = useState(null);
  const [fact, setFact] = useState(null);
  const [bundleBounce, setBundleBounce] = useState(-1);

  const intervalRef = useRef(null);
  const messageTimeoutRef = useRef(null);
  const messageHideRef = useRef(null);
  const lastKindRef = useRef(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mql.matches ? 'dark' : 'light');
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    loadLines('./content/farmer_lines.txt', FALLBACK_FARMER_LINES).then(setFarmerLines);
    loadLines('./content/rice_facts.txt', FALLBACK_RICE_FACTS).then(setRiceFacts);
  }, []);

  const { cols, rows } = useMemo(() => computeGrid(durationMin), [durationMin]);
  const totalStalks = cols * rows;

  const order = useMemo(() => {
    const idxs = [];
    for (let r = 0; r < rows; r++) {
      const rowRange = [];
      for (let c = 0; c < cols; c++) rowRange.push(r * cols + c);
      if (r % 2 === 1) rowRange.reverse();
      idxs.push(...rowRange);
    }
    return idxs;
  }, [cols, rows]);

  const elapsed = totalSeconds - secondsLeft;
  const progress = totalSeconds > 0 ? Math.min(1, elapsed / totalSeconds) : 0;
  const harvestedCount = Math.floor(progress * totalStalks);
  const harvestedSet = useMemo(() => new Set(order.slice(0, harvestedCount)), [order, harvestedCount]);
  const harvestingIdx = order[harvestedCount] !== undefined ? order[harvestedCount] : -1;

  const currentStep = Math.min(totalStalks - 1, harvestedCount);
  const curRow = Math.floor(currentStep / cols);
  const rawCol = currentStep % cols;
  const curCol = curRow % 2 === 1 ? (cols - 1 - rawCol) : rawCol;
  const movingRight = curRow % 2 === 0;

  const bundleCount = Math.min(14, Math.floor((harvestedCount / Math.max(1, totalStalks)) * 14));

  useEffect(() => {
    if (bundleCount > bundleBounce) setBundleBounce(bundleCount);
  }, [bundleCount, bundleBounce]);

  const scheduleMessage = useCallback(() => {
    const delay = 60000;
    messageTimeoutRef.current = setTimeout(() => {
      const kind = lastKindRef.current === 'dialog'
        ? 'fact'
        : (lastKindRef.current === 'fact' ? 'dialog' : (Math.random() < 0.5 ? 'dialog' : 'fact'));
      lastKindRef.current = kind;

      if (kind === 'dialog') {
        // setFact(null);
        setDialog(prev => {
          const prevIdx = prev ? prev.index : -1;
          const { item, index } = pickRandom(farmerLines, prevIdx);
          clearTimeout(messageHideRef.current);
          messageHideRef.current = setTimeout(() => setDialog(null), 7000);
          return { text: item, index };
        });
      } else {
        // setDialog(null);
        setFact(prev => {
          const prevIdx = prev ? prev.index : -1;
          const { item, index } = pickRandom(riceFacts, prevIdx);
          clearTimeout(messageHideRef.current);
          messageHideRef.current = setTimeout(() => setFact(null), 10000);
          return { text: item, index };
        });
      }
      scheduleMessage();
    }, delay);
  }, [farmerLines, riceFacts]);

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setPhase('done');
            return 0;
          }
          return s - 1;
        });
      }, 1000);
      scheduleMessage();
    }
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(messageTimeoutRef.current);
      clearTimeout(messageHideRef.current);
    };
  }, [phase, scheduleMessage]);

  const startTimer = () => {
    const total = durationMin * 60;
    setTotalSeconds(total);
    setSecondsLeft(total);
    setDialog(null);
    setFact(null);
    lastKindRef.current = null;
    setBundleBounce(-1);
    setPhase('running');
  };

  const pauseTimer = () => setPhase('paused');
  const resumeTimer = () => setPhase('running');
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    clearTimeout(messageTimeoutRef.current);
    clearTimeout(messageHideRef.current);
    setPhase('setup');
    setSecondsLeft(durationMin * 60);
    setTotalSeconds(durationMin * 60);
    setDialog(null);
    setFact(null);
  };

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const fieldMaxWidth = Math.min(1100, 460 + cols * 44);

  const farmerLeftPct = ((curCol + 1.5) / cols) * 80;
  const farmerTopPct = ((curRow + 3) / rows) * 50;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="Rice Study Timer logo">
            <path d="M16 30 L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 14 Q8 6 4 2" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <path d="M16 14 Q24 6 28 2" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            <path d="M16 19 Q10 12 7 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
            <path d="M16 19 Q22 12 25 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6"/>
          </svg>
          <span className="brand-name">Paddy Focus</span>
        </div>
        <button className="theme-toggle" aria-label={"Switch to " + (theme === 'dark' ? 'light' : 'dark') + " mode"} onClick={toggleTheme}>
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          )}
        </button>
      </header>

      <main className="main">
        {phase === 'setup' && (
          <section className="setup-card" aria-labelledby="setup-title">
            <h1 id="setup-title" className="setup-title">How long will you study?</h1>
            <p className="setup-sub">The longer your session, the bigger the field your farmer must harvest.</p>
            <div className="duration-row" role="group" aria-label="Choose study duration">
              {[15, 25, 45, 60, 90].map(min => (
                <button
                  key={min}
                  className={"duration-chip" + (durationMin === min ? " active" : "")}
                  onClick={() => { setDurationMin(min); setSecondsLeft(min*60); setTotalSeconds(min*60); }}
                  aria-pressed={durationMin === min}
                >
                  {min}m
                </button>
              ))}
            </div>
            <div className="custom-duration">
              <label htmlFor="custom-min" className="custom-label">Custom minutes</label>
              <input
                id="custom-min"
                type="number"
                min="1"
                max="240"
                value={durationMin}
                onChange={e => {
                  const v = Math.max(1, Math.min(240, Number(e.target.value) || 1));
                  setDurationMin(v);
                  setSecondsLeft(v*60);
                  setTotalSeconds(v*60);
                }}
              />
            </div>
            <div className="field-preview-note">Field size: {cols} x {rows} — {totalStalks} rice patches</div>
            <button className="btn-primary start-btn" onClick={startTimer}>Start Harvest Session</button>
          </section>
        )}

        {phase !== 'setup' && (
          <section className="session-view">
            <div className="timer-panel">
              <div className="timer-display" aria-live="polite">{formatTime(secondsLeft)}</div>
              <div className="timer-sub">{Math.round(progress * 100)}% harvested - {harvestedCount}/{totalStalks} patches</div>
              <div className="controls">
                {phase === 'running' && <button className="btn-secondary" onClick={pauseTimer}>Pause</button>}
                {phase === 'paused' && <button className="btn-primary" onClick={resumeTimer}>Resume</button>}
                {phase !== 'done' && <button className="btn-ghost" onClick={resetTimer}>Reset</button>}
                {phase === 'done' && <button className="btn-primary" onClick={resetTimer}>New Session</button>}
              </div>
            </div>

            <div
              className="field-wrap"
              style={{ maxWidth: fieldMaxWidth + 'px', backgroundImage: "url('./assets/images/field_bg.jpg')" }}
            >
              <div className="field-overlay"></div>

              <div className="field-grid">
                {Array.from({ length: rows }, (_, r) => (
                  <div
                    key={r}
                    className="rice-row"
                    style={{ top: (r / rows * 100) + '%', height: (100 / rows) + '%' }}
                  >
                    {Array.from({ length: cols }, (_, c) => {
                      const i = r * cols + c;
                      let state = 'full';
                      if (harvestedSet.has(i)) state = 'done';
                      else if (i === harvestingIdx && phase === 'running') state = 'harvesting';
                      return <RicePatch key={i} state={state} />;
                    })}
                  </div>
                ))}
              </div>

              <div
                role="img"
                aria-label="Pixel-art rice farmer walking through the field harvesting rice"
                className={"farmer-sprite" + (phase !== 'running' ? " is-idle" : "")}
                style={{
                  left: `calc(${farmerLeftPct}% - 32px)`,
                  top: `calc(${farmerTopPct}% - 60px)`,
                  backgroundImage: "url('./assets/images/farmer_walk_sheet.png')",
                  transform: movingRight ? 'scaleX(1)' : 'scaleX(-1)'
                }}
              ></div>

              {dialog && (
                <div
                  className="speech-bubble"
                  role="status"
                  style={{
                    left: `calc(${farmerLeftPct}% - 60px)`,
                    top: `calc(${farmerTopPct}% - 130px)`
                  }}
                >
                  {dialog.text}
                </div>
              )}

              <div className="bundle-pile" aria-label={bundleCount + " rice bundles harvested"}>
                {Array.from({ length: bundleCount }, (_, i) => (
                  <img
                    key={i}
                    src="./assets/images/rice_bundle.png"
                    alt=""
                    className="bundle-icon"
                    style={{
                      left: (i % 5) * 22 + 'px',
                      bottom: Math.floor(i / 5) * 20 + 'px',
                      zIndex: i
                    }}
                    width="32" height="32" loading="lazy" decoding="async"
                  />
                ))}
              </div>

              {phase === 'done' && (
                <div className="done-banner" role="alert">
                  <span>Harvest complete! Great study session.</span>
                </div>
              )}
            </div>

            {fact && (
              <div className="fact-ticker" role="note" aria-label="Rice fact">
                <span className="fact-badge">Rice Fact</span>
                <span className="fact-text">{fact.text}</span>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Inspired by the patience of rice farmers — one grain, one minute at a time.</p>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
