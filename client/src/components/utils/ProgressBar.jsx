import { useEffect, useState } from "react";
import { TbCheck, TbAlertTriangle, TbPlayerPause, TbPlayerPlay, TbX } from "react-icons/tb";

const ProgressBar = ({ percent = 0, speed, eta, status, paused, onCancel, onPause }) => {
  const [displayPct, setDisplayPct] = useState(0);
  const done = status === "done";
  const error = status === "error";
  const downloading = status === "downloading";

  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(percent), 50);
    return () => clearTimeout(t);
  }, [percent]);

  const color = error
    ? "bg-red-500"
    : done
    ? "bg-emerald-400"
    : paused
    ? "bg-amber-300/50"
    : "bg-amber-400";

  const borderColor = error
    ? "border-red-500/30"
    : done
    ? "border-emerald-400/30"
    : "border-amber-500/20";

  const cornerColor = done
    ? "border-emerald-400/60"
    : error
    ? "border-red-500/60"
    : "border-amber-500/60";

  return (
    <div className={`w-full max-w-2xl relative border ${borderColor} bg-black/40 backdrop-blur-sm`}>
      <span className={`absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2 ${cornerColor}`} />
      <span className={`absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2 ${cornerColor}`} />
      <span className={`absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2 ${cornerColor}`} />
      <span className={`absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2 ${cornerColor}`} />

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {done && <TbCheck className="size-4 text-emerald-400" />}
            {error && <TbAlertTriangle className="size-4 text-red-400" />}
            {downloading && !paused && (
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full size-2 bg-amber-500" />
              </span>
            )}
            {downloading && paused && (
              <span className="relative inline-flex rounded-full size-2 bg-amber-300/50" />
            )}
            <span
              className={`font-mono text-xs tracking-widest uppercase ${
                done
                  ? "text-emerald-400"
                  : error
                  ? "text-red-400"
                  : paused
                  ? "text-amber-300/60"
                  : "text-amber-400"
              }`}
            >
              {done
                ? "Transfer complete"
                : error
                ? "Transfer failed"
                : paused
                ? "Paused"
                : "Transferring…"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`font-mono text-sm font-bold ${
                done ? "text-emerald-400" : error ? "text-red-400" : "text-amber-300"
              }`}
            >
              {displayPct.toFixed(1)}%
            </span>

            {downloading && (
              <button
                onClick={onPause}
                title={paused ? "Resume" : "Pause"}
                className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs tracking-widest uppercase border border-amber-500/30 text-amber-400/70 hover:text-amber-300 hover:border-amber-400/50 transition-all"
              >
                {paused ? (
                  <TbPlayerPlay className="size-3" />
                ) : (
                  <TbPlayerPause className="size-3" />
                )}
                {paused ? "Resume" : "Pause"}
              </button>
            )}

            {(downloading || paused) && (
              <button
                onClick={onCancel}
                title="Cancel"
                className="flex items-center gap-1.5 px-2.5 py-1 font-mono text-xs tracking-widest uppercase border border-red-500/30 text-red-400/70 hover:text-red-300 hover:border-red-400/50 transition-all"
              >
                <TbX className="size-3" />
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="relative h-1.5 bg-white/5 overflow-hidden mb-3">
          {downloading && !paused && (
            <div
              className="absolute inset-y-0 left-0 bg-amber-500/10 animate-pulse"
              style={{ width: "100%" }}
            />
          )}
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${color}`}
            style={{ width: `${displayPct}%` }}
          />
          {downloading && !paused && (
            <div
              className="absolute inset-y-0 w-8 bg-white/20 blur-sm transition-all duration-500"
              style={{ left: `calc(${displayPct}% - 16px)` }}
            />
          )}
        </div>

        {downloading && (
          <div className="flex items-center gap-6">
            <div>
              <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-0.5">
                Speed
              </p>
              <p className="font-mono text-xs text-white/60">
                {paused ? "—" : (speed ?? "—")}
              </p>
            </div>
            <div>
              <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-0.5">
                ETA
              </p>
              <p className="font-mono text-xs text-white/60">
                {paused ? "—" : (eta ?? "—")}
              </p>
            </div>
            <div className="flex-1 text-right">
              <p className="font-mono text-xs text-white/25 uppercase tracking-widest mb-0.5">
                Status
              </p>
              <p
                className={`font-mono text-xs ${
                  paused ? "text-amber-300/40" : "text-amber-500/60 animate-pulse"
                }`}
              >
                {paused ? "Paused" : "Live"}
              </p>
            </div>
          </div>
        )}

        {done && (
          <p className="font-mono text-xs text-emerald-400/60 tracking-wider">
            Saved to ~/Downloads
          </p>
        )}

        {error && (
          <p className="font-mono text-xs text-red-400/60 tracking-wider">
            Check console for details
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;