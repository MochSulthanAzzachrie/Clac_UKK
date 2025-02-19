import { useEffect } from "react";
import Layout from "@/app/layout";
import "@/App.css";
import { ButtonCalc } from "@/components/ButtonCalc";
import { Memstory } from "@/components/Memstory";
import { StandardCalcLogic } from "@/components/CalcLogic";

const buttons = [
  ["%", "CE", "C", "⌫"],
  ["⅟x", "x²", "²√x", "÷"],
  ["7", "8", "9", "×"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["±", "0", ".", "="],
];

const keyMapping = {
  "%": "%",
  CE: "Delete",
  C: "C / c / Esc",
  "⌫": "Backspace",
  "⅟x": "⅟x",
  "x²": "x²",
  "²√x": "²√x",
  "÷": "/",
  "×": "*",
  7: "7",
  8: "8",
  9: "9",
  4: "4",
  5: "5",
  6: "6",
  1: "1",
  2: "2",
  3: "3",
  "±": "±",
  0: "0",
  ".": ".",
  "+": "+ / =",
  "-": "-",
  "=": "Enter",
};

function Standard() {
  const {
    display,
    expression,
    handleButtonClick,
    calcHistory,
    memory,
    memoryClear,
    memoryRecall,
    memoryAdd,
    memorySubtract,
    memoryStore,
    recallHistoryEntry,
    clearHistory,
    deleteHistoryEntry,
    deleteMemoryEntry,
    memoryClone,
  } = StandardCalcLogic();

  // Daftar tombol yang masih aktif ketika error "Cannot divide by zero"
  const allowedButtonsOnError = [
    "C",
    "CE",
    "⌫",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "=",
  ];

  // Menambahkan event listener untuk menangani input dari keyboard
  useEffect(() => {
    const allowedKeysOnError = ["C", "c", "Escape", "Delete", "Backspace"];

    const handleKeyDown = (event) => {
      if (
        (display === "Cannot divide by zero" ||
          display === "Result is undefined") &&
        !allowedKeysOnError.includes(event.key)
      ) {
        return;
      }

      const key = event.key;
      if (key === "Enter") {
        handleButtonClick("=");
      } else if (key === "C" || key === "c" || key === "Escape") {
        handleButtonClick("C");
      } else if (key === "Delete") {
        handleButtonClick("CE");
      } else if (key === "Backspace") {
        handleButtonClick("⌫");
      } else if (key === "*") {
        handleButtonClick("×");
      } else if (key === "/") {
        handleButtonClick("÷");
      } else if (key === "+" || key === "=") {
        handleButtonClick("+");
      } else if (key === "-") {
        handleButtonClick(key);
      } else if ("0123456789".includes(key)) {
        handleButtonClick(key);
      } else if (key === ".") {
        handleButtonClick(key);
      } else if (key === "%") {
        handleButtonClick(key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleButtonClick, display]);

  return (
    <Layout
      header={"Standard"}
      calcHistory={calcHistory}
      memory={memory}
      onRecallHistory={recallHistoryEntry}
      memoryClear={memoryClear}
      memoryRecall={memoryRecall}
      memoryAdd={memoryAdd}
      memorySubtract={memorySubtract}
      memoryStore={memoryStore}
      clearHistory={clearHistory}
      deleteHistoryEntry={deleteHistoryEntry}
      deleteMemoryEntry={deleteMemoryEntry}
      memoryClone={memoryClone}
    >
      <div className="flex flex-col mx-2 text-end">
        <p className="my-2 text-xl text-neutral-400 h-[24px] w-full truncate">
          {expression || " "}
        </p>
        <p className="text-5xl xl:text-6xl w-full font-semibold xl:h-[135px] h-[90px] truncate">
          {display}
        </p>
      </div>
      <Memstory
        memoryClear={memoryClear}
        memoryRecall={memoryRecall}
        memoryAdd={memoryAdd}
        memorySubtract={memorySubtract}
        memoryStore={memoryStore}
        isMemoryEmpty={!memory || memory.length === 0}
      />
      <div className="w-full h-[2px] bg-secondary" />
      <div className="grid flex-grow grid-cols-4 gap-2 pt-2">
        {buttons.flat().map((btn, index) => {
          // Tentukan apakah tombol ini disabled
          const isDisabled =
            (display === "Cannot divide by zero" ||
              display === "Result is undefined") &&
            !allowedButtonsOnError.includes(btn);

          // Jika disabled, gunakan style khusus; jika tidak, gunakan style standard
          const baseStyle = isDisabled
            ? "text-white bg-neutral-900 cursor-none" // style khusus untuk tombol disabled
            : [
                "%",
                "CE",
                "C",
                "⌫",
                "⅟x",
                "x²",
                "²√x",
                "÷",
                "×",
                "-",
                "+",
              ].includes(btn)
            ? "text-white bg-neutral-800 hover:bg-neutral-700"
            : btn === "="
            ? "text-black bg-sky-400 hover:bg-sky-400 hover:opacity-60"
            : "text-white bg-neutral-700 hover:bg-neutral-800";

          return (
            <ButtonCalc
              tooltip={keyMapping[btn] || ""}
              key={index}
              id="calculator-standard"
              disabled={isDisabled}
              className={`p-4 rounded ${baseStyle}`}
              onClick={() => handleButtonClick(btn)}
            >
              {btn}
            </ButtonCalc>
          );
        })}
      </div>
    </Layout>
  );
}

export default Standard;
