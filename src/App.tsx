import { useEffect, useRef, useState } from "react";
import { useLiga } from "./lib/useLiga";
import { StartScreen } from "./screens/StartScreen";
import { TrainScreen } from "./screens/TrainScreen";

type Tab = "start" | "train";

export default function App() {
  const liga = useLiga();
  const [tab, setTab] = useState<Tab>("start");
  const [toast, setToast] = useState<{ msg: string; big?: string; shown: boolean } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const today = new Date();

  const showToast = (msg: string, big?: string) => {
    setToast({ msg, big, shown: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast((t) => t && { ...t, shown: false }), 2200);
  };
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  return (
    <>
      <div className="wrap">
        <header className="title">
          <span className="eyebrow">Trainings-Spiel</span>
          <h1>
            Wochen<span>-</span>Liga
          </h1>
        </header>
        {!liga.loaded ? null : tab === "start" ? (
          <StartScreen liga={liga} today={today} />
        ) : (
          <TrainScreen liga={liga} today={today} onToast={showToast} />
        )}
      </div>

      <nav className="tabbar" aria-label="Navigation">
        <button type="button" aria-current={tab === "start" ? "page" : undefined} onClick={() => setTab("start")}>
          <span>Start</span>
        </button>
        <button type="button" aria-current={tab === "train" ? "page" : undefined} onClick={() => setTab("train")}>
          <span>Eintragen</span>
        </button>
      </nav>

      <div className={"toast" + (toast?.shown ? " show" : "") + (toast?.big ? " splash" : "")} role="status">
        {toast?.big && <b key={toast.msg + toast.big}>{toast.big}</b>}
        {toast?.msg}
      </div>
    </>
  );
}
