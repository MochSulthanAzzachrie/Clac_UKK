import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CopyPlus, Trash2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Main } from "./Main";

export const Histemory = ({
  children,
  calcHistory,
  memory,
  onRecallHistory,
  memoryClear,
  memoryRecall,
  memoryAdd,
  memorySubtract,
  clearHistory,
  // Callback untuk menghapus satu entri (opsional; harus di-handle di parent)
  deleteHistoryEntry,
  deleteMemoryEntry,
  memoryClone
}) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  // Ambil nilai query parameter "histemory"
  const view = searchParams.get("histemory");

  // Cek apakah route URL adalah "date-calculation"
  const isDateCalculation = location.pathname.includes("date-calculation");

  // Fungsi untuk memformat angka
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    if (isNaN(num) || !isFinite(num)) return "Error";
    const [integerPart, decimalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const handleClear = () => {
    if (view === "history") {
      clearHistory();
    } else if (view === "memory") {
      memoryClear(undefined, true);
    }
  };

  // State untuk mengatur context menu (dropdown) yang muncul saat klik kanan
  const [contextMenu, setContextMenu] = useState(null);
  // contextMenu: { x, y, type, index, data }
  // type: "history" atau "memory"
  // index: untuk history (indeks entry)
  // data: untuk history adalah entry object, sedangkan untuk memory adalah value (misal: memory[memory.length - 1])

  const handleContextMenu = (e, type, index, data) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      index, // untuk history; bisa null untuk memory
      data, // untuk history: entry; untuk memory: nilai (misal: memory[memory.length - 1])
    });
  };

  const handleCopy = () => {
    if (contextMenu && contextMenu.data) {
      // Untuk history, yang disalin adalah entry.result; untuk memory, disalin nilainya langsung
      const textToCopy =
        contextMenu.type === "history"
          ? contextMenu.data.result
          : contextMenu.data;
      navigator.clipboard.writeText(String(textToCopy));
    }
    setContextMenu(null);
  };

  const handleDelete = () => {
    if (contextMenu) {
      if (contextMenu.type === "history") {
        if (typeof deleteHistoryEntry === "function") {
          deleteHistoryEntry(contextMenu.index);
        }
      } else if (contextMenu.type === "memory") {
        if (typeof deleteMemoryEntry === "function") {
          deleteMemoryEntry();
        }
      }
    }
    setContextMenu(null);
  };

  const handleClone = () => {
    if (contextMenu && contextMenu.data !== undefined) {
      // Panggil fungsi memoryClone dengan data dari context menu
      memoryClone(contextMenu.data);
    }
    setContextMenu(null);
  };

  // Hilangkan context menu ketika klik di luar
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Gunakan ref untuk mendapatkan ukuran dropdown dan mengatur posisi yang tepat
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (contextMenu && menuRef.current) {
      const { offsetWidth, offsetHeight } = menuRef.current;
      let left = contextMenu.x;
      let top = contextMenu.y;

      // Pastikan dropdown tidak melebihi lebar layar
      if (left + offsetWidth > window.innerWidth) {
        left = window.innerWidth - offsetWidth - 5; // tambahkan margin 5px
      }
      // Pastikan dropdown tidak melebihi tinggi layar
      if (top + offsetHeight > window.innerHeight) {
        top = window.innerHeight - offsetHeight - 5;
      }
      setMenuPosition({ left, top });
    }
  }, [contextMenu]);

  return (
    <>
      <div className="flex w-full h-full gap-2 mb-2 xl:flex-row xl:ms-1">
        {/* Gunakan kelas yang berbeda berdasarkan isDateCalculation */}
        <Main className={`h-full w-full ${ isDateCalculation ? "xl:w-1/2" : "xl:w-5/6" }`}>
          {children}
        </Main>
        <Card className={`h-full max-h-[1006px] p-2 border-4 bg-inherit hidden sm:block ${ isDateCalculation ? "w-1/2" : "w-1/6" }`}>
          <div className="flex flex-col justify-between h-full">
            <div className="flex flex-col w-full h-full gap-2 overflow-auto over">
              {view === "history" ? (
                calcHistory && calcHistory.length > 0 ? (
                  calcHistory.slice().reverse().map((entry, index) => {
                    const originalIndex = memory.length - 1 - index;
                    return(
                    <Button
                      key={originalIndex}
                      onClick={() => onRecallHistory(entry)}
                      onContextMenu={(e) =>
                        handleContextMenu(e, "history", originalIndex, entry)
                      }
                      className="flex flex-shrink-0 flex-col justify-center items-end text-right text-white border-0 outline-none bg-inherit hover:bg-neutral-900 focus:outline-none h-[75px] w-full px-2 py-1 gap-1"
                    >
                      <p className="text-neutral-500">{entry.expression}</p>
                      <p className="text-xl">{formatNumber(entry.result)}</p>
                    </Button>
                    );
})
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white">There&apos;s no history yet.</p>
                  </div>
                )
              ) : view === "memory" ? (
                memory && memory.length > 0 ? (
                  memory.slice().reverse().map((memValue, index) => {
                    const originalIndex = memory.length - 1 - index;
                    return(
                  <Button
                    className="group relative flex-shrink-0 flex flex-col justify-center items-end text-right text-white border-0 outline-none bg-inherit hover:bg-neutral-900 focus:outline-none h-[75px] w-full px-2 py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      memoryRecall(memValue);
                    }}
                    key={originalIndex}
                    onContextMenu={(e) =>
                      handleContextMenu(
                        e,
                        "memory",
                        originalIndex,
                        memValue
                      )
                    }
                  >
                    <p className="absolute text-xl right-2 top-1">
                      {formatNumber(memValue)}
                    </p>
                    <span className="absolute flex-row justify-end hidden w-full gap-1 right-2 bottom-1 group-hover:flex">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          memoryClear(originalIndex);
                        }}
                        className="w-10 text-white border-0 outline-none h-7 bg-neutral-800 hover:bg-neutral-700"
                      >
                        MC
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          memoryAdd(originalIndex);
                        }}
                        className="w-10 text-white border-0 outline-none h-7 bg-neutral-800 hover:bg-neutral-700"
                      >
                        M+
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          memorySubtract(originalIndex);
                        }}
                        className="w-10 text-white border-0 outline-none h-7 bg-neutral-800 hover:bg-neutral-700"
                      >
                        M-
                      </Button>
                    </span>
                  </Button>
                  );
                  })
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-white">
                      There&apos;s nothing saved in memory.
                    </p>
                  </div>
                )
              ) : null}
            </div>
            <div className="flex justify-end w-full">
              <Button
                onClick={handleClear}
                className="text-white border-0 outline-none bg-inherit hover:bg-neutral-900 focus:outline-none h-[35px] w-[35px]"
              >
                <Trash2 />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Dropdown context menu ditempatkan di luar layout utama */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: menuPosition.top,
            left: menuPosition.left,
            zIndex: 50,
          }}
          className="p-1 rounded-lg shadow bg-neutral-800"
        >
          {view === "memory" ? (
          <>
          <div className="py-[2px]" />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClone();
            }}
            className="flex items-center justify-start w-full gap-2 px-3 py-1 text-sm text-white border-0 rounded-lg outline-none cursor-pointer hover:bg-neutral-700 focus:outline-none bg-inherit h-[30px]"
          >
            <CopyPlus />
            Clone
          </Button>
          </>
          ) : null}
          <Button
            onClick={handleCopy}
            className="flex items-center justify-start w-full gap-2 px-3 py-1 text-sm text-white border-0 rounded-lg outline-none cursor-pointer hover:bg-neutral-700 focus:outline-none bg-inherit h-[30px]"
          >
            <Copy />
            Copy
          </Button>
          <div className="py-[2px]" />
          <Button
            onClick={handleDelete}
            className="flex items-center justify-start w-full gap-2 px-3 py-1 text-sm text-white border-0 rounded-lg outline-none cursor-pointer hover:bg-neutral-700 focus:outline-none bg-inherit h-[30px]"
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      )}
    </>
  );
};
