import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "./components/Avatar";
import { Icon, type IconName } from "./components/Icons";
import { useLiga } from "./lib/useLiga";
import { weekView } from "./lib/week";
import { AddSheet } from "./screens/AddSheet";
import { CharacterScreen } from "./screens/CharacterScreen";
import { EntriesScreen } from "./screens/EntriesScreen";
import { OverviewScreen } from "./screens/OverviewScreen";

type Tab = "overview" | "training" | "character";

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: "overview", label: "Übersicht", icon: "chart" },
  { key: "training", label: "Training", icon: "list" },
  { key: "character", label: "Charakter", icon: "person" },
];

export default function App() {
  const liga = useLiga();
  const [tab, setTab] = useState<Tab>("overview");
  const [offset, setOffset] = useState(0);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; big?: string; shown: boolean } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const today = new Date();
  const week = weekView(today, offset, liga.weeks);

  const showToast = (msg: string, big?: string) => {
    setToast({ msg, big, shown: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => t && { ...t, shown: false }), 2400);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  const closeSheet = useCallback(() => setAdding(false), []);

  return (
    <>
      <div className="app">
        <header className="top">
          <div className="top-row">
            <img className="logo" src="/icon.svg" alt="" />
            <h1>Wochen-Liga</h1>
            <button type="button" className="me" aria-label={`Charakter, Level ${liga.level}`} onClick={() => setTab("character")}>
              <Avatar level={liga.level} look={liga.look} bust />
              <span className="me-badge num">{liga.level}</span>
            </button>
          </div>

          <div className="tool-row">
            {tab !== "character" ? (
              <div className="weeknav">
                <button type="button" className="round-btn" aria-label="Vorige Woche" onClick={() => setOffset(offset - 1)}>
                  <Icon name="left" />
                </button>
                <div className="weeklabel">
                  <b>KW {week.key.slice(-2)}</b>
                  <span>{offset === 0 ? "diese Woche" : offset === -1 ? "letzte Woche" : week.range}</span>
                </div>
                <button type="button" className="round-btn" aria-label="Nächste Woche" disabled={offset >= 0} onClick={() => setOffset(offset + 1)}>
                  <Icon name="right" />
                </button>
              </div>
            ) : (
              <div className="weeklabel">
                <b>Level {liga.level}</b>
                <span className="num">{liga.totalXp} XP gesamt</span>
              </div>
            )}
            <button type="button" className="fab" aria-label="Training eintragen" onClick={() => setAdding(true)}>
              <Icon name="plus" size={24} />
            </button>
          </div>

          <nav className="tabs" aria-label="Bereiche">
            {TABS.map((t, i) => (
              <button key={t.key} type="button" aria-current={tab === t.key ? "page" : undefined} onClick={() => setTab(t.key)}>
                <span className="tab-num num">{String(i + 1).padStart(2, "0")}</span>
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="content">
          {!liga.loaded ? null : tab === "overview" ? (
            <OverviewScreen liga={liga} week={week} today={today} />
          ) : tab === "training" ? (
            <EntriesScreen liga={liga} week={week} onAdd={() => setAdding(true)} onToast={showToast} />
          ) : (
            <CharacterScreen liga={liga} />
          )}
        </main>
      </div>

      <nav className="bottombar" aria-label="Navigation">
        {TABS.map((t) => (
          <button key={t.key} type="button" aria-label={t.label} aria-current={tab === t.key ? "page" : undefined} onClick={() => setTab(t.key)}>
            <Icon name={t.icon} size={22} />
          </button>
        ))}
      </nav>

      {adding && liga.loaded && <AddSheet liga={liga} today={today} onClose={closeSheet} onToast={showToast} />}

      <div className={"toast" + (toast?.shown ? " show" : "")} role="status">
        {toast?.big && <b key={toast.msg + toast.big}>{toast.big}</b>}
        <span>{toast?.msg}</span>
      </div>
    </>
  );
}
