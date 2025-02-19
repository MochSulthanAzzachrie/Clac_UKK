import { useState, useEffect } from "react";
import Layout from "@/app/layout";
import "@/App.css";
import { ButtonCalc } from "@/components/ButtonCalc";
import { Memstory } from "@/components/Memstory";
import { ScientificCalcLogic } from "@/components/CalcLogic";

const buttons = [
  ["2<sup>nd</sup>", "π", "e", "C", "⌫"],
  ["x²", "⅟x", "|x|", "exp", "mod"],
  ["²√x", "(", ")", "n!", "÷"],
  ["x<sup>y</sup>", "7", "8", "9", "×"],
  ["10<sup>x</sup>", "4", "5", "6", "-"],
  ["log", "1", "2", "3", "+"],
  ["In", "±", "0", ".", "="],
];

const keyMapping = {
  C: "C / c / Esc",
  "2<sup>nd</sup>": "2<sup>nd</sup>",
  "x<sup>y</sup>": "x<sup>y</sup>",
  "10<sup>x</sup>": "10<sup>x</sup>",
  "(": "(",
  ")": ")",
  log: "log",
  In: "In",
  exp: "exp",
  mod: "mod",
  e: "e",
  π: "π",
  "|x|": "|x|",
  "n!": "n!",
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

const renderHTML = (htmlString) => {
  if (htmlString.includes("<")) {
    return <span dangerouslySetInnerHTML={{ __html: htmlString }} />;
  }
  return htmlString;
};

function Scientific() {
  // State untuk mode 2nd
  const [secondActive, setSecondActive] = useState(false);

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
  } = ScientificCalcLogic();

  // Tombol yang masih aktif saat error
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

  // Mapping label alternatif untuk tombol yang terpengaruh mode 2nd
  const secondLabels = {
    "x²": "x³",
    "²√x": "³√x",
    "x<sup>y</sup>": "<sup>y</sup>√x",
    "10<sup>x</sup>": "2<sup>x</sup>",
    log: "log<sub>y</sub>x",
    In: "e<sup>x</sup>",
  };

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleButtonClick, display]);

  return (
    <Layout
      header={"Scientific"}
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
      />
      <div className="w-full h-[2px] bg-secondary" />
      <div className="grid flex-grow grid-cols-5 gap-2 pt-2">
        {buttons.flat().map((btn, index) => {
          const isDisabled =
            (display === "Cannot divide by zero" ||
              display === "Result is undefined") &&
            !allowedButtonsOnError.includes(btn);

          // Tentukan label, nilai, dan tooltip awal
          let buttonLabel = btn;
          let buttonValue = btn;
          let tooltipContent = keyMapping[btn] || "";

          // Ubah label tombol C menjadi CE jika display memiliki isi
          if (btn === "C") {
            buttonLabel = display && display !== "0" ? "CE" : "C";
            tooltipContent =
              display && display !== "0" ? "CE / c / Esc" : tooltipContent;
          }

          // Jika mode 2nd aktif, ubah label dan nilai tombol yang terpengaruh
          if (secondActive && secondLabels[btn]) {
            buttonLabel = secondLabels[btn];
            buttonValue = secondLabels[btn];
            tooltipContent = secondLabels[btn];
          }

          // Tentukan styling tombol
          let baseStyle = "";
          if (isDisabled) {
            baseStyle = "text-white bg-neutral-900 cursor-none";
          } else if (btn === "2<sup>nd</sup>") {
            baseStyle = secondActive
              ? "text-black bg-sky-400 hover:bg-sky-400 hover:opacity-80"
              : "text-white bg-neutral-800 hover:bg-neutral-700 active:bg-white";
          } else if (btn === "=") {
            baseStyle =
              "text-black bg-sky-400 hover:bg-sky-400 hover:opacity-80";
          } else if (secondActive && secondLabels[btn]) {
            baseStyle =
              "text-white bg-neutral-800 hover:animate-bg-color-transition";
          } else if (
            [
              "%",
              "e",
              "C",
              "⌫",
              "⅟x",
              "x²",
              "²√x",
              "x<sup>y</sup>",
              "10<sup>x</sup>",
              "log",
              "In",
              "exp",
              "mod",
              "(",
              ")",
              "n!",
              "÷",
              "×",
              "-",
              "+",
              "|x|",
              "π",
            ].includes(btn)
          ) {
            baseStyle = "text-white bg-neutral-800 hover:bg-neutral-700";
          } else {
            baseStyle = "text-white bg-neutral-700 hover:bg-neutral-800";
          }

          const onClickHandler = () => {
            if (btn === "2<sup>nd</sup>") {
              // Toggle mode 2nd
              setSecondActive((prev) => !prev);
            } else {
              handleButtonClick(buttonValue);
            }
          };

          return (
            <ButtonCalc
              tooltip={renderHTML(tooltipContent)}
              key={index}
              id="calculator-standard"
              disabled={isDisabled}
              className={`p-4 rounded ${baseStyle}`}
              onClick={onClickHandler}
            >
              {renderHTML(buttonLabel)}
            </ButtonCalc>
          );
        })}
      </div>
    </Layout>
  );
}

export default Scientific;
