import { useEffect, useRef, useState } from "react";
import { useLiga } from "./lib/useLiga";
import { StartScreen } from "./screens/StartScreen";
import { TrainScreen } from "./screens/TrainScreen";

type Tab = "start" | "train";

export default function App() {
  const liga = useLiga();
  const [tab, setTab] = useState<Tab>("start");
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const today = new Date();

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  return (
    <>
      <div className="wrap">
        <header>
          <div className="eyebrow">Trainings-Spiel</div>
          <h1>Nasufs Wochen-Liga</h1>
        </header>
        {!liga.loaded ? null : tab === "start" ? (
          <StartScreen liga={liga} today={today} />
        ) : (
          <TrainScreen liga={liga} today={today} onToast={showToast} />
        )}
      </div>

      <nav className="tabbar" aria-label="Navigation">
        <button type="button" aria-current={tab === "start" ? "page" : undefined} onClick={() => setTab("start")}>
          <span aria-hidden="true">🏆</span>Start
        </button>
        <button type="button" aria-current={tab === "train" ? "page" : undefined} onClick={() => setTab("train")}>
          <span aria-hidden="true">＋</span>Eintragen
        </button>
      </nav>

      <div className={"toast" + (toast ? " show" : "")} role="status">
        {toast}
      </div>
    </>
  );
}
