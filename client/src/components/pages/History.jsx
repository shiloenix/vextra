import { useState, useEffect, useCallback } from "react";
import { TbHistory, TbTrash, TbExternalLink, TbSearch, TbX, TbDownload, TbBox } from "react-icons/tb";

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

const History = () => {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("vido_history") || "[]");
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  const handleDelete = useCallback((id) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("vido_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    localStorage.removeItem("vido_history");
    setItems([]);
    setConfirmClear(false);
  }, [confirmClear]);

  const filtered = items.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050a0f] relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(251,191,36,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center px-4 pt-32 pb-20 gap-8">

        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            <TbHistory className="size-10 text-amber-400" />
          </div>
          <p className="font-mono text-xs text-white/25 tracking-[0.2em] uppercase">
            {items.length} extraction{items.length !== 1 ? "s" : ""} logged
          </p>
        </div>

        {items.length > 0 && (
          <div className="w-full max-w-2xl flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-amber-500/40" />
              <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-amber-500/40" />
              <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-amber-500/40" />
              <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-amber-500/40" />
              <div className="flex items-center bg-white/3 border border-white/10">
                <TbSearch className="size-3.5 text-white/25 ml-3 flex-shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="search history…"
                  className="flex-1 bg-transparent font-mono text-xs text-white/70 placeholder-white/20 focus:outline-none px-3 py-2.5 tracking-wide"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="pr-3 text-white/25 hover:text-white/50 transition-colors"
                  >
                    <TbX className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleClearAll}
              className={`flex items-center gap-2 px-4 py-2.5 font-mono text-xs tracking-widest uppercase border transition-all
                ${
                  confirmClear
                    ? "border-red-500/60 text-red-400 bg-red-500/10"
                    : "border-white/10 text-white/30 hover:border-red-500/40 hover:text-red-400/70"
                }`}
            >
              <TbTrash className="size-3.5" />
              {confirmClear ? "Confirm?" : "Clear all"}
            </button>
          </div>
        )}

        <div className="w-full max-w-2xl relative">
          {filtered.length > 0 ? (
            <>
              <span className="absolute -top-px -left-px w-5 h-5 border-t-2 border-l-2 border-amber-500/40" />
              <span className="absolute -top-px -right-px w-5 h-5 border-t-2 border-r-2 border-amber-500/40" />
              <span className="absolute -bottom-px -left-px w-5 h-5 border-b-2 border-l-2 border-amber-500/40" />
              <span className="absolute -bottom-px -right-px w-5 h-5 border-b-2 border-r-2 border-amber-500/40" />

              <div className="border border-amber-500/15 bg-black/40 backdrop-blur-sm divide-y divide-white/5">
                <div className="flex items-center gap-3 px-4 py-2 bg-white/2">
                  <span className="font-mono text-xs text-amber-500/40 tracking-widest uppercase flex-1">
                    Title
                  </span>
                  <span className="font-mono text-xs text-amber-500/40 tracking-widest uppercase w-20 text-right hidden sm:block">
                    Format
                  </span>
                  <span className="font-mono text-xs text-amber-500/40 tracking-widest uppercase w-20 text-right hidden sm:block">
                    When
                  </span>
                  <span className="w-16" />
                </div>

                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors group"
                  >
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="w-14 h-9 object-cover flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{
                          clipPath:
                            "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))",
                        }}
                      />
                    ) : (
                      <div className="w-14 h-9 bg-white/5 flex-shrink-0 flex items-center justify-center">
                        <TbDownload className="size-3 text-white/20" />
                      </div>
                    )}

                    <p className="font-mono text-xs text-white/60 group-hover:text-white/80 transition-colors flex-1 line-clamp-2 leading-relaxed min-w-0">
                      {item.title || "Unknown"}
                    </p>

                    <span className="font-mono text-xs text-white/25 w-20 text-right hidden sm:block flex-shrink-0">
                      {item.formatId || "—"}
                    </span>

                    <span className="font-mono text-xs text-white/25 w-20 text-right hidden sm:block flex-shrink-0">
                      {timeAgo(item.downloadedAt)}
                    </span>

                    <div className="flex items-center gap-1 flex-shrink-0 w-16 justify-end">
                      {item.webpage_url && (
                        <a
                          href={item.webpage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open source"
                          className="p-1.5 text-white/20 hover:text-amber-400 transition-colors"
                        >
                          <TbExternalLink className="size-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Remove"
                        className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <TbTrash className="size-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-20">
              <TbBox className="size-10 text-white/10" />
              <p className="font-mono text-xs text-white/20 tracking-widest uppercase">
                {search ? "No results found" : "No downloads yet"}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="font-mono text-xs text-amber-500/40 hover:text-amber-400 tracking-wider transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

        {search && filtered.length > 0 && (
          <p className="font-mono text-xs text-white/20 tracking-wider">
            {filtered.length} of {items.length} results
          </p>
        )}
      </div>
    </div>
  );
};

export default History;