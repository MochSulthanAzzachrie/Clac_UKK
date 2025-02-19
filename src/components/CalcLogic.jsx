import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { setWithExpiry, getWithExpiry } from "@/utils/storage"; // pastikan path-nya benar
import {
  addDays,
  subDays,
  addMonths,
  subMonths,
  addYears,
  subYears,
  differenceInDays,
  intervalToDuration,
  format,
} from "date-fns";

export const StandardCalcLogic = () => {
  const location = useLocation();
  const route = location.pathname; // misal: "/standard" atau "/scientific"

  // Kunci penyimpanan berdasarkan route
  const memoryKey = `calc_memory_${route}`;
  const historyKey = `calc_history_${route}`;

  // Inisialisasi memory dan calcHistory dari localStorage
  const [memory, setMemory] = useState(() => {
    const stored = getWithExpiry(memoryKey);
    return stored !== null ? stored : [];
  });
  
  const [calcHistory, setCalcHistory] = useState(() => {
    const stored = getWithExpiry(historyKey);
    return stored !== null ? stored : [];
  });

  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [currentValue, setCurrentValue] = useState("0");
  const [operator, setOperator] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  // State untuk operator dan operand terakhir (digunakan untuk repeated equals)
  const [lastOperator, setLastOperator] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);
  const MAX_DIGITS = 16;

  // --- STATE TAMBAHAN UNTUK PERILAKU "OPERATOR TANPA OPERAND" ---
  // pendingOperand menyimpan operand terakhir sebelum operator ditekan,
  // sedangkan waitingForOperand menjadi flag bahwa operand baru belum dimasukkan.
  const [pendingOperand, setPendingOperand] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Fungsi untuk memformat angka dengan pemisah ribuan
  const formatNumber = (num) => {
    if (isNaN(num) || !isFinite(num)) return "Result is undefined";
    const [integerPart, decimalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  const cleanNumber = (num) => num.replace(/,/g, "");

  // Jika operand sudah mengandung "%" maka tidak dilakukan pemformatan ulang
  const formatOperandForExpression = (operand) => {
    if (operand.includes("%")) {
      return operand;
    }
    const cleanOperand = cleanNumber(operand);
    return cleanOperand.startsWith("-") && !cleanOperand.startsWith("(-")
      ? `(${cleanOperand})`
      : cleanOperand;
  };

  const handleButtonClick = (value) => {
    // Jika pesan error muncul, reset kalkulator terlebih dahulu
    if (
      display === "Cannot divide by zero" ||
      display === "Result is undefined"
    ) {
      resetCalculator();
    }
    
    if (!isNaN(value) || value === ".") {
      handleNumberInput(value);
    } else {
      handleOperator(value);
    }
  };

  const handleNumberInput = (num) => {
    // Jika operator baru saja ditekan dan operand baru belum diisi,
    // mulai operand baru dengan menggantikan nilai display dan currentValue.
    if (waitingForOperand) {
      setWaitingForOperand(false);
      const newVal = num === "." ? "0." : num;
      setCurrentValue(newVal);
      setDisplay(newVal);
      return;
    }
    
    // Jika perhitungan sebelumnya telah selesai (ekspresi berakhir "="),
    // reset kalkulator untuk memulai perhitungan baru.
    if (lastResult !== null && expression.trim().endsWith("=")) {
      setExpression("");
      setLastResult(null);
      setLastOperator(null);
      setLastOperand(null);
    }
    
    // Update currentValue dan display
    setCurrentValue((prev) => {
      // Jika operand sudah mengandung "%" atau jika nilai awal adalah "0" yang bukan berupa titik,
      // maka lakukan penyesuaian.
      if (prev.includes("%")) return prev;
      const cleanPrev = cleanNumber(prev);
      if (cleanPrev.replace(".", "").length >= MAX_DIGITS) return prev;
      // **Pengecekan duplikat titik:**
      if (num === "." && prev.includes(".")) return prev;
      // Jika nilai awal adalah "0" dan yang ditekan bukan titik, maka ganti "0" dengan angka baru.
      if (prev === "0" && num !== ".") return num;
      // Jika tidak, gabungkan angka baru ke nilai sebelumnya.
      return formatNumber(cleanPrev + num);
    });
    
    setDisplay((prev) => {
      if (prev.includes("%")) return prev;
      const cleanPrev = cleanNumber(prev);
      if (cleanPrev.replace(".", "").length >= MAX_DIGITS) return prev;
      // **Pengecekan duplikat titik untuk display:**
      if (num === "." && prev.includes(".")) return prev;
      return formatNumber(
        cleanPrev === "0" && num !== "." ? num : cleanPrev + num
      );
    });
  };

  const handleOperator = (op) => {
    if (["+", "-", "×", "÷"].includes(op)) {
      const formattedOperand = formatOperandForExpression(currentValue);
      // Simpan operand terakhir sebagai pendingOperand
      setPendingOperand(currentValue);
      // Set flag bahwa operand baru belum diisi setelah operator
      setWaitingForOperand(true);
      setExpression((prev) => {
        if (!prev || prev.trim().endsWith("=")) {
          return `${formattedOperand} ${op} `;
        } else {
          if (cleanNumber(currentValue) === "0" && !currentValue.includes("%")) {
            return prev.slice(0, prev.length - 2) + ` ${op} `;
          } else {
            return prev + formattedOperand + ` ${op} `;
          }
        }
      });
      setOperator(op);
      setCurrentValue("0");
      setDisplay("0");
    } else if (op === "=") {
      calculateResult();
    } else if (op === "C") {
      resetCalculator();
    } else if (op === "CE") {
      clearEntry();
    } else if (op === "⌫") {
      handleBackspace();
    } else {
      handleSpecialOperations(op);
    }
  };

  const calculateResult = () => {
    if (
      display === "Cannot divide by zero" ||
      display === "Result is undefined"
    ) {
      resetCalculator();
      return;
    }

    // Jika ekspresi sudah berakhir "=" maka kita menangani operasi repeated equals
    if (expression.trim().endsWith("=")) {
      if (lastOperator && lastOperand !== null) {
        // Operasi lanjutan: gunakan lastOperator dan lastOperand
        const firstOperand = parseFloat(
          currentValue.includes("%")
            ? eval(currentValue.replace(/(-?\d+(\.\d+)?)%/g, "($1/100)"))
            : cleanNumber(currentValue)
        );
        const secondOperand = parseFloat(
          lastOperand.includes("%")
            ? eval(lastOperand.replace(/(-?\d+(\.\d+)?)%/g, "($1/100)"))
            : cleanNumber(lastOperand)
        );
        let result;
        switch (lastOperator) {
          case "+":
            result = firstOperand + secondOperand;
            break;
          case "-":
            result = firstOperand - secondOperand;
            break;
          case "×":
            result = firstOperand * secondOperand;
            break;
          case "÷":
            if (firstOperand === 0 && secondOperand === 0) {
              setDisplay("Result is undefined");
              return;
            } else if (secondOperand === 0) {
              setDisplay("Cannot divide by zero");
              return;
            }
            result = firstOperand / secondOperand;
            break;
          default:
            result = firstOperand;
        }
        const newExpression = `${formatOperandForExpression(
          String(firstOperand)
        )} ${lastOperator} ${formatOperandForExpression(String(lastOperand))} =`;
        setExpression(newExpression);
        setCurrentValue(String(result));
        setDisplay(formatNumber(result));
        setLastResult(result);
        setCalcHistory((prev) => [...prev, { expression: newExpression, result }]);
        return;
      } else {
        // Kasus seperti "8=" tanpa operator lanjutan:
        // Setiap kali "=" ditekan, simpan entry history baru dengan hasil yang sama.
        const numberVal = parseFloat(cleanNumber(currentValue));
        setCalcHistory((prev) => [...prev, { expression, result: numberVal }]);
        setDisplay(formatNumber(numberVal));
        return;
      }
    }

    // Kasus ketika belum ada ekspresi (misalnya hanya mengetik angka)
    if (!expression && currentValue) {
      if (currentValue.includes("%")) {
        const sanitized = currentValue.replace(
          /(-?\d+(\.\d+)?)%/g,
          "($1/100)"
        );
        const result = eval(sanitized);
        const expr = `${currentValue} =`;
        setDisplay(formatNumber(result));
        setExpression(expr);
        setLastResult(result);
        setLastOperator(null);
        setLastOperand(null);
        setCurrentValue(String(result));
        setCalcHistory((prev) => [...prev, { expression: expr, result }]);
        return;
      } else {
        const numberVal = parseFloat(cleanNumber(currentValue));
        const expr = `${currentValue} =`;
        setDisplay(formatNumber(numberVal));
        setExpression(expr);
        setLastResult(numberVal);
        setLastOperator(null);
        setLastOperand(null);
        setCurrentValue(String(numberVal));
        setCalcHistory((prev) => [
          ...prev,
          { expression: expr, result: numberVal },
        ]);
        return;
      }
    }
    if (!expression || !currentValue) return;

    try {
      // Jika operand baru belum diisi setelah operator (misal: "1+"), gunakan pendingOperand
      const operandValue =
        waitingForOperand && pendingOperand !== null
          ? pendingOperand
          : currentValue;
      const operand = formatOperandForExpression(operandValue);
      const finalExpression = expression.trim() + " " + operand;
    
      // Jika ada operator, simpan sebagai lastOperator dan lastOperand
      if (operator && ["+", "-", "×", "÷"].includes(operator)) {
        setLastOperator(operator);
        setLastOperand(operandValue);
      } else {
        setLastOperator(null);
        setLastOperand(null);
      }
    
      const sanitizedExpression = cleanNumber(finalExpression)
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/(-?\d+(\.\d+)?)%/g, "($1/100)")
        .replace(/\(([-]?\d+)\)/g, "($1)");
    
      const result = eval(sanitizedExpression);
    
      if (!isFinite(result)) {
        const newExpr = `${finalExpression} =`;
        if (finalExpression.replace(/\s/g, "") === "0÷0") {
          setExpression(newExpr);
          setDisplay("Result is undefined");
          return;
        } else {
          setExpression(newExpr);
          setDisplay("Cannot divide by zero");
          return;
        }
      }
    
      const newExpr = `${finalExpression} =`;
      setDisplay(formatNumber(result));
      setExpression(newExpr);
      setCurrentValue(String(result));
      setOperator(null);
      setLastResult(result);
      setCalcHistory((prev) => [...prev, { expression: newExpr, result }]);

      // Reset pendingOperand dan flag waiting
      setPendingOperand(null);
      setWaitingForOperand(false);
    } catch {
      setDisplay("Result is undefined");
    }
  };

  const handleSpecialOperations = (op) => {
    let newValue = parseFloat(cleanNumber(currentValue)) || 0;
    const formattedOperand = formatOperandForExpression(currentValue);

    if (op === "⅟x") {
      if (newValue === 0) {
        setDisplay("Cannot divide by zero");
        return;
      }
      setExpression(`1/(${formattedOperand})`);
      newValue = 1 / newValue;
    } else if (op === "x²") {
      setExpression(`(${formattedOperand})²`);
      newValue = newValue ** 2;
    } else if (op === "²√x") {
      if (newValue < 0) {
        setDisplay("Cannot divide by zero");
        return;
      }
      setExpression(`√(${formattedOperand})`);
      newValue = Math.sqrt(newValue);
    } else if (op === "±") {
      newValue = -newValue;
      setExpression((prev) =>
        prev.replace(new RegExp(`\\b${cleanNumber(currentValue)}\\b`), newValue)
      );
    } else if (op === "%") {
      if (!currentValue.includes("%")) {
        const newStr = currentValue + "%";
        setCurrentValue(newStr);
        setDisplay(newStr);
      }
      return;
    }

    setCurrentValue(String(newValue));
    setDisplay(formatNumber(newValue));
  };

  const handleBackspace = () => {
    if (currentValue.includes("%")) {
      setCurrentValue("0");
      setDisplay("0");
      return;
    }
    if (currentValue.length > 1) {
      const newVal = currentValue.slice(0, -1);
      setCurrentValue(newVal);
      setDisplay(formatNumber(newVal));
    } else {
      setCurrentValue("0");
      setDisplay("0");
    }
  };

  const resetCalculator = () => {
    setDisplay("0");
    setExpression("");
    setCurrentValue("0");
    setOperator(null);
    setLastResult(null);
    setLastOperator(null);
    setLastOperand(null);
    setPendingOperand(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    setCurrentValue("0");
    setDisplay("0");
  };

  // --- Fungsi MEMORY (dengan memory berupa array) ---
  const deleteHistoryEntry = (index) => {
    setCalcHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteMemoryEntry = () => {
    setMemory((prev) => prev.slice(0, prev.length - 1));
  };

  const memoryClear = (index, clearAll = false) => {
    setMemory((prev) => {
      if (prev.length === 0) return prev;
      if (clearAll) {
        return [];
      }
      const targetIndex = index === undefined ? prev.length - 1 : index;
      return prev.filter((_, i) => i !== targetIndex);
    });
  };

  const memoryRecall = (index) => {
    if (index !== undefined && memory[index] !== undefined) {
      const value = memory[index];
      setCurrentValue(String(value));
      setDisplay(formatNumber(value));
    } else if (memory.length > 0) {
      const lastValue = memory[memory.length - 1];
      setCurrentValue(String(lastValue));
      setDisplay(formatNumber(lastValue));
    }
  };

  const memoryAdd = (index) => {
    const value = parseFloat(cleanNumber(currentValue));
    setMemory((prev) => {
      if (prev.length > 0) {
        const targetIndex = index !== undefined ? index : prev.length - 1;
        return prev.map((item, i) => (i === targetIndex ? item + value : item));
      } else {
        return [value];
      }
    });
  };

  const memorySubtract = (index) => {
    const value = parseFloat(cleanNumber(currentValue));
    setMemory((prev) => {
      if (prev.length > 0) {
        const targetIndex = index !== undefined ? index : prev.length - 1;
        return prev.map((item, i) => (i === targetIndex ? item - value : item));
      } else {
        return [-value];
      }
    });
  };

  const memoryStore = () => {
    const value = parseFloat(cleanNumber(currentValue));
    setMemory((prev) => [...prev, value]);
  };

  const memoryClone = (valueToClone) => {
    const value =
      valueToClone !== undefined
        ? valueToClone
        : parseFloat(cleanNumber(currentValue));
    setMemory((prev) => [...prev, value]);
  };

  // --- Fungsi untuk History ---
  const recallHistoryEntry = (entry) => {
    // Saat memanggil data history, set nilai result dan ekspresi
    setCurrentValue(String(entry.result));
    setDisplay(formatNumber(entry.result));
    setExpression(entry.expression);
    setLastResult(entry.result);
    // Parsing ekspresi (misalnya "1 + 1 =") untuk mengambil operator & operand terakhir,
    // sehingga jika "=" ditekan lagi, operasi bisa dilanjutkan.
    const parts = entry.expression.split(" ");
    // Jika formatnya "operand operator operand =" (minimal 4 bagian)
    if (parts.length >= 4) {
      const op = parts[1];
      const operand = parts[2];
      setLastOperator(op);
      setLastOperand(operand);
    } else {
      setLastOperator(null);
      setLastOperand(null);
    }
  };

  const clearHistory = () => {
    setCalcHistory([]);
  };

  useEffect(() => {
    // 10 tahun = 10 * 365 * 24 * 60 * 60 * 1000 milidetik
    setWithExpiry(memoryKey, memory, 10 * 365 * 24 * 60 * 60 * 1000);
  }, [memory, memoryKey]);

  useEffect(() => {
    // 30 hari = 30 * 24 * 60 * 60 * 1000 milidetik
    setWithExpiry(historyKey, calcHistory, 30 * 24 * 60 * 60 * 1000);
  }, [calcHistory, historyKey]);

  return { 
    display, 
    expression: expression.trim() || "", 
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
    memoryClone
  };
};

export const ScientificCalcLogic = () => {
  const location = useLocation();
  const route = location.pathname;

  // Kunci penyimpanan berdasarkan route
  const memoryKey = `calc_memory_${route}`;
  const historyKey = `calc_history_${route}`;

  // Inisialisasi memory dan calcHistory dari localStorage
  const [memory, setMemory] = useState(() => {
    const stored = getWithExpiry(memoryKey);
    return stored !== null ? stored : [];
  });
  
  const [calcHistory, setCalcHistory] = useState(() => {
    const stored = getWithExpiry(historyKey);
    return stored !== null ? stored : [];
  });

  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [currentValue, setCurrentValue] = useState("0");
  const [operator, setOperator] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [lastOperator, setLastOperator] = useState(null);
  const [lastOperand, setLastOperand] = useState(null);
  // Flag untuk menandai bahwa operand baru telah dimasukkan
  const [operandEntered, setOperandEntered] = useState(false);
  // Flag untuk operasi khusus (misalnya exp, log, In, dll.)
  const [isSpecialOperation, setIsSpecialOperation] = useState(false);

  const MAX_DIGITS = 32;

  // Fungsi untuk memformat angka (misalnya menambahkan pemisah ribuan)
  const formatNumber = (num) => {
    if (isNaN(num) || !isFinite(num)) return "Result is undefined";
    const [integerPart, decimalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart !== undefined
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };

  // Menghilangkan tanda koma dari angka
  const cleanNumber = (num) => num.replace(/,/g, "");

  // Memformat operand untuk ekspresi.
  // Jika operand sudah berupa ekspresi dengan tanda kurung, kembalikan apa adanya.
  const formatOperandForExpression = (operand) => {
    if (operand.trim().startsWith("(") && operand.trim().endsWith(")")) {
      return operand;
    }
    const cleanOperand = cleanNumber(operand);
    return cleanOperand.startsWith("-") && !cleanOperand.startsWith("(-")
      ? `(${cleanOperand})`
      : cleanOperand;
  };

  // Fungsi utama saat tombol ditekan
  const handleButtonClick = (value) => {
    if (
      display === "Cannot divide by zero" ||
      display === "Result is undefined"
    ) {
      resetCalculator();
    }
    
    if (!isNaN(value) || value === ".") {
      handleNumberInput(value);
    } else {
      handleOperator(value);
    }
  };

  // Menangani input angka (digit dan titik desimal)
  const handleNumberInput = (num) => {
    // Jika perhitungan sebelumnya sudah selesai (ekspresi berakhiran "="), mulai perhitungan baru
    if (lastResult !== null && expression.trim().endsWith("=")) {
      setExpression("");
      setLastResult(null);
      setLastOperator(null);
      setLastOperand(null);
    }
    // Tandai bahwa operand baru telah dimasukkan
    setOperandEntered(true);
    setCurrentValue((prev) => {
      let cleanPrev = cleanNumber(prev);
      if (cleanPrev.replace(".", "").length >= MAX_DIGITS) return prev;
      if (prev === "0" && num !== ".") return num;
      if (num === "." && prev.includes(".")) return prev;
      return formatNumber(cleanPrev + num);
    });
    setDisplay((prev) => {
      let cleanPrev = cleanNumber(prev);
      if (cleanPrev.replace(".", "").length >= MAX_DIGITS) return prev;
      return formatNumber(
        cleanPrev === "0" && num !== "." ? num : cleanPrev + num
      );
    });
  };

  // Menangani operator (termasuk tanda kurung, backspace, CE, C, dan operator binary)
  const handleOperator = (op) => {
    // Tangani tanda kurung secara langsung
    if (op === "(" || op === ")") {
      if (currentValue !== "0") {
        setExpression((prev) =>
          prev + " " + formatOperandForExpression(currentValue) + " " + op + " "
        );
        setCurrentValue("0");
        setDisplay("0");
      } else {
        setExpression((prev) => prev + " " + op + " ");
      }
      return;
    }

    // Tangani tombol backspace
    if (op === "⌫") {
      handleBackspace();
      return;
    }

    // Tangani tombol "="
    if (op === "=") {
      calculateResult();
      return;
    }

    // Tangani tombol C (reset kalkulator) dan tombol CE (clear entry)
    if (op === "C") {
      resetCalculator();
      return;
    }
    if (op === "CE") {
      clearEntry();
      return;
    }

    // Daftar operator binary
    const binaryOperators = ["+", "-", "×", "÷", "mod", "x<sup>y</sup>"];

if (binaryOperators.includes(op)) {
  // Tandai bahwa operand baru belum dimasukkan
  setOperandEntered(false);
  const formattedOperand = formatOperandForExpression(currentValue);
  // Jika operator yang ditekan adalah "x<sup>y</sup>", gunakan caret "^" untuk tampilan ekspresi
  const displayOp = op === "x<sup>y</sup>" ? "^" : op;
  setExpression((prev) => {
    if (isSpecialOperation) {
          setIsSpecialOperation(false);
          return `${formattedOperand} ${op} `;
        }
    if (!prev || prev.trim().endsWith("=")) {
      return `${formattedOperand} ${displayOp} `;
    } else {
      if (!operandEntered) {
        if (prev.trim().endsWith(")")) {
          return prev + ` ${displayOp} `;
        } else {
          const tokens = prev.trim().split(" ");
          tokens[tokens.length - 1] = displayOp;
          return tokens.join(" ") + " ";
        }
      } else {
        return prev + formattedOperand + ` ${displayOp} `;
      }
    }
  });
  setOperator(op);
  // Setelah operator ditekan, reset currentValue dan display ke "0"
  setCurrentValue("0");
  setDisplay("0");
  return;
}


    // Jika bukan kasus di atas, anggap sebagai operasi unary/spesial
    handleSpecialOperations(op);
  };

  // Menghitung hasil ekspresi
  const calculateResult = () => {
    if (
      display === "Cannot divide by zero" ||
      display === "Result is undefined"
    ) {
      resetCalculator();
      return;
    }

    // Kasus: Operand saja ("8=")
    if (!expression) {
      const numberVal = parseFloat(cleanNumber(currentValue));
      const expr = `${currentValue} =`;
      setCalcHistory((prev) => [...prev, { expression: expr, result: numberVal }]);
      setDisplay(formatNumber(numberVal));
      setExpression(expr);
      return;
    }

    // Kasus repeated equals
    if (expression.trim().endsWith("=")) {
      if (lastOperator && lastOperand !== null) {
        const firstOperand = parseFloat(cleanNumber(currentValue));
        const secondOperand = parseFloat(cleanNumber(lastOperand));
        let result;
        switch (lastOperator) {
          case "+":
            result = firstOperand + secondOperand;
            break;
          case "-":
            result = firstOperand - secondOperand;
            break;
          case "×":
            result = firstOperand * secondOperand;
            break;
          case "÷":
            if (secondOperand === 0) {
              setDisplay("Cannot divide by zero");
              return;
            }
            result = firstOperand / secondOperand;
            break;
          case "mod":
            if (secondOperand === 0) {
              setDisplay("Cannot mod by zero");
              return;
            }
            result = firstOperand % secondOperand;
            break;
          case "x<sup>y</sup>":
            result = firstOperand ** secondOperand;
            break;
          case "<sup>y</sup>√x":
            if (secondOperand === 0) {
              setDisplay("Cannot take zeroth root");
              return;
            }
            result = firstOperand ** (1 / secondOperand);
            break;
          default:
            result = firstOperand;
        }
        const newExpression = `${formatOperandForExpression(String(firstOperand))} ${lastOperator} ${formatOperandForExpression(String(lastOperand))} =`;
        setExpression(newExpression);
        setCurrentValue(String(result));
        setDisplay(formatNumber(result));
        setLastResult(result);
        setCalcHistory((prev) => [...prev, { expression: newExpression, result }]);
        return;
      } else {
        // Repeated equals untuk operand saja atau operasi unary
        const numberVal = parseFloat(cleanNumber(currentValue));
        const expr = `${currentValue} =`;
        setCalcHistory((prev) => [...prev, { expression: expr, result: numberVal }]);
        setDisplay(formatNumber(numberVal));
        return;
      }
    }

    // Jika operasi unary (misalnya exp, log, In, dll.) belum memiliki operator biner
    if (expression && operator === null && lastOperator === null && lastOperand === null) {
      const newExpr = expression.trim() + " =";
      setExpression(newExpr);
      setCalcHistory((prev) => [
        ...prev,
        { expression: newExpr, result: parseFloat(cleanNumber(currentValue)) }
      ]);
      return;
    }

    // Operasi biner yang belum lengkap (misalnya "8 +")
    let operandForCalculation;
    if (!operandEntered) {
      const tokens = expression.trim().split(" ");
      operandForCalculation = tokens.length >= 2 ? tokens[tokens.length - 2] : formatOperandForExpression(currentValue);
    } else {
      operandForCalculation = formatOperandForExpression(currentValue);
    }
    const finalExpression = expression.trim() + " " + operandForCalculation;

    if (operator && ["+", "-", "×", "÷", "mod", "x<sup>y</sup>", "<sup>y</sup>√x"].includes(operator)) {
      setLastOperator(operator);
      setLastOperand(operandForCalculation);
    } else {
      setLastOperator(null);
      setLastOperand(null);
    }

    try {
      let sanitizedExpression = finalExpression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/mod/g, "%")
        .replace(/x<sup>y<\/sup>/g, "**");
      
      sanitizedExpression = sanitizedExpression.replace(/<sup>y<\/sup>√x/g, "nthRoot");
      const nthRoot = (a, b) => a ** (1 / b);
      
      const result = Function("nthRoot", "return " + sanitizedExpression)(nthRoot);
      
      if (!isFinite(result)) {
        const newExpr = `${finalExpression} =`;
        if (finalExpression.replace(/\s/g, "") === "0/0") {
          setExpression(newExpr);
          setDisplay("Result is undefined");
          return;
        } else {
          setExpression(newExpr);
          setDisplay("Cannot divide by zero");
          return;
        }
      }
      
      const newExpr = `${finalExpression} =`;
      setDisplay(formatNumber(result));
      setExpression(newExpr);
      setCurrentValue(String(result));
      setOperator(null);
      setLastResult(result);
      setOperandEntered(false);
      setCalcHistory((prev) => [...prev, { expression: newExpr, result }]);
    } catch {
      setDisplay("Result is undefined");
    }
  };

  // Menangani operasi unary/spesial (exp, log, In, dll.)
  const handleSpecialOperations = (op) => {
    let newValue = parseFloat(cleanNumber(currentValue)) || 0;
    const formattedOperand = formatOperandForExpression(currentValue);
    
    switch(op) {
      case "π":
        newValue = Math.PI;
        setExpression(String(newValue));
        setIsSpecialOperation(true);
        break;
      case "e":
        newValue = Math.E;
        setExpression(String(newValue));
        setIsSpecialOperation(true);
        break;
      case "exp":
        // Format currentValue ke notasi ilmiah, misalnya "9.e+0"
        newValue = currentValue + ".e+0";
        setExpression(String(newValue));
        setIsSpecialOperation(true);
        break;
      case "log":
        if(newValue <= 0){
          setDisplay("Invalid Input for Log");
          return;
        }
        newValue = Math.log10(newValue);
        setExpression(`log( ${String(newValue)} )`);
        setIsSpecialOperation(true);
        break;
      case "In":
        if(newValue <= 0){
          setDisplay("Invalid Input for ln");
          return;
        }
        newValue = Math.log(newValue);
        setExpression(`In( ${String(newValue)} )`);
        setIsSpecialOperation(true);
        break;
      case "e<sup>x</sup>":
        newValue = Math.exp(newValue);
        setExpression(`e^( ${String(newValue)} )`);
        setIsSpecialOperation(true);
        break;
      case "10<sup>x</sup>":
        newValue = 10 ** newValue;
        setExpression(`10^${String(newValue)}`);
        setIsSpecialOperation(true);
        break;
      case "2<sup>x</sup>":
        newValue = 2 ** newValue;
        setExpression(`2^${String(newValue)}`);
        setIsSpecialOperation(true);
        break;
      case "n!":
        if(newValue < 0 || !Number.isInteger(newValue)){
          setDisplay("Invalid Input for Factorial");
          return;
        }
        newValue = factorial(newValue);
        setExpression(`fact( ${formattedOperand} )`);
        break;
      case "⅟x":
        if(newValue === 0){
          setDisplay("Cannot divide by zero");
          return;
        }
        newValue = 1 / newValue;
        setExpression(`1/(${formattedOperand})`);
        break;
      case "x²":
        newValue = newValue ** 2;
        setExpression(`(${formattedOperand})²`);
        break;
      case "x³":
        newValue = newValue ** 3;
        setExpression(`(${formattedOperand})³`);
        break;
      case "|x|":
        newValue = Math.abs(newValue);
        setExpression(`abs( ${formattedOperand} )`);
        break;
      case "²√x":
        if(newValue < 0){
          setDisplay("Invalid Input for Root");
          return;
        }
        newValue = Math.sqrt(newValue);
        setExpression(`√( ${formattedOperand} )`);
        break;
      case "³√x":
        newValue = Math.cbrt(newValue);
        setExpression(`∛( ${formattedOperand} )`);
        break;
      case "log<sub>y</sub>x":
        newValue = 1;
        setExpression(`log base( ${formattedOperand} )`);
        break;
      case "±":
        newValue = -newValue;
        break;
      case "<sup>y</sup>√x":
        if(newValue === 0){
          setDisplay("Invalid Input for y-root");
          return;
        }
        newValue = Math.pow(newValue, 1 / newValue);
        setExpression(`yroot( ${formattedOperand} )`);
        break;
      default:
        return;
    }
    setCurrentValue(String(newValue));
    setDisplay(formatNumber(newValue));
  };

  // Fungsi factorial (n!)
  const factorial = (n) => {
    if(n === 0 || n === 1) return 1;
    let res = 1;
    for(let i = 2; i <= n; i++){
      res *= i;
    }
    return res;
  };

  // Backspace: hapus digit terakhir pada currentValue
  const handleBackspace = () => {
    if (currentValue.length > 1) {
      const newVal = currentValue.slice(0, -1);
      setCurrentValue(newVal);
      setDisplay(formatNumber(newVal));
    } else {
      setCurrentValue("0");
      setDisplay("0");
    }
  };

  // Reset kalkulator: reset seluruh state
  const resetCalculator = () => {
    setDisplay("0");
    setExpression("");
    setCurrentValue("0");
    setOperator(null);
    setLastResult(null);
    setLastOperator(null);
    setLastOperand(null);
    setOperandEntered(false);
  };

  // Clear Entry: hapus hanya currentValue (tanpa menghapus ekspresi sebelumnya)
  const clearEntry = () => {
    setCurrentValue("0");
    setDisplay("0");
    setOperandEntered(false);
  };

  // --- Fungsi Memory & History ---
  const deleteHistoryEntry = (index) => {
    setCalcHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteMemoryEntry = () => {
    setMemory((prev) => prev.slice(0, prev.length - 1));
  };

  const memoryClear = (index, clearAll = false) => {
    setMemory((prev) => {
      if (prev.length === 0) return prev;
      if (clearAll) return [];
      const targetIndex = index === undefined ? prev.length - 1 : index;
      return prev.filter((_, i) => i !== targetIndex);
    });
  };

  const memoryRecall = (index) => {
    if (index !== undefined && memory[index] !== undefined) {
      const value = memory[index];
      setCurrentValue(String(value));
      setDisplay(formatNumber(value));
    } else if (memory.length > 0) {
      const lastValue = memory[memory.length - 1];
      setCurrentValue(String(lastValue));
      setDisplay(formatNumber(lastValue));
    }
  };

  const memoryAdd = (index) => {
    const value = parseFloat(cleanNumber(currentValue));
    setMemory((prev) => {
      if (prev.length > 0) {
        const targetIndex = index !== undefined ? index : prev.length - 1;
        return prev.map((item, i) => (i === targetIndex ? item + value : item));
      } else {
        return [value];
      }
    });
  };

  const memorySubtract = (index) => {
    const value = parseFloat(cleanNumber(currentValue));
    setMemory((prev) => {
      if (prev.length > 0) {
        const targetIndex = index !== undefined ? index : prev.length - 1;
        return prev.map((item, i) => (i === targetIndex ? item - value : item));
      } else {
        return [-value];
      }
    });
  };

  const memoryStore = () => {
    const value = parseFloat(cleanNumber(currentValue));
    setMemory((prev) => [...prev, value]);
  };

  const memoryClone = (valueToClone) => {
    const value =
      valueToClone !== undefined
        ? valueToClone
        : parseFloat(cleanNumber(currentValue));
    setMemory((prev) => [...prev, value]);
  };

  const recallHistoryEntry = (entry) => {
    setCurrentValue(String(entry.result));
    setDisplay(formatNumber(entry.result));
    setExpression(entry.expression);
    setLastResult(entry.result);
    const parts = entry.expression.split(" ");
    if (parts.length >= 4) {
      const op = parts[1];
      const operand = parts[2];
      setLastOperator(op);
      setLastOperand(operand);
    } else {
      setLastOperator(null);
      setLastOperand(null);
    }
  };

  const clearHistory = () => {
    setCalcHistory([]);
  };

  useEffect(() => {
    setWithExpiry(memoryKey, memory, 10 * 365 * 24 * 60 * 60 * 1000);
  }, [memory, memoryKey]);

  useEffect(() => {
    setWithExpiry(historyKey, calcHistory, 30 * 24 * 60 * 60 * 1000);
  }, [calcHistory, historyKey]);

  return { 
    display, 
    expression: expression.trim() || "", 
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
    handleBackspace,
    calculateResult
  };
};

export const DateCalcLogic = ({
  mode, // "0" untuk difference, "1" untuk date calculation
  // State khusus mode 0:
  mode0FromDate,
  mode0ToDate,
  // State khusus mode 1:
  mode1FromDate,
  // Parameter untuk mode 1:
  radioOperation = "add",
  dayCount = "0",
  monthCount = "0",
  yearCount = "0",
}) => {
  const [totalDays, setTotalDays] = useState(0);
  const [formattedDiff, setFormattedDiff] = useState("");

  useEffect(() => {
    if (mode === "0") {
      // Perhitungan Difference untuk mode 0
      if (mode0FromDate.getTime() === mode0ToDate.getTime()) {
        setFormattedDiff("Same dates");
        setTotalDays(0);
        return;
      }
      const start = mode0FromDate < mode0ToDate ? mode0FromDate : mode0ToDate;
      const end = mode0FromDate < mode0ToDate ? mode0ToDate : mode0FromDate;
      const duration = intervalToDuration({ start, end });
      const weeks = Math.floor(duration.days / 7);
      const remainingDays = duration.days % 7;
      const parts = [];
      if (duration.years) {
        parts.push(`${duration.years} year${duration.years !== 1 ? "s" : ""}`);
      }
      if (duration.months) {
        parts.push(`${duration.months} month${duration.months !== 1 ? "s" : ""}`);
      }
      if (weeks) {
        parts.push(`${weeks} week${weeks !== 1 ? "s" : ""}`);
      }
      if (remainingDays || parts.length === 0) {
        parts.push(`${remainingDays} day${remainingDays !== 1 ? "s" : ""}`);
      }
      setFormattedDiff(parts.join(", "));
      setTotalDays(Math.abs(differenceInDays(mode0ToDate, mode0FromDate)));
    } else if (mode === "1") {
      // Perhitungan Date Calculation untuk mode 1
      const day = Number(dayCount) || 0;
      const month = Number(monthCount) || 0;
      const year = Number(yearCount) || 0;
      let calculatedDate = new Date(mode1FromDate);
      if (radioOperation === "add") {
        calculatedDate = addYears(calculatedDate, year);
        calculatedDate = addMonths(calculatedDate, month);
        calculatedDate = addDays(calculatedDate, day);
      } else {
        calculatedDate = subYears(calculatedDate, year);
        calculatedDate = subMonths(calculatedDate, month);
        calculatedDate = subDays(calculatedDate, day);
      }
      // Format tanggal: misalnya "Wednesday, February 19, 2025"
      const formattedDate = format(calculatedDate, "EEEE, MMMM d, yyyy");
      setFormattedDiff(formattedDate);
      setTotalDays(0);
    }
  }, [
    mode,
    mode0FromDate,
    mode0ToDate,
    mode1FromDate,
    radioOperation,
    dayCount,
    monthCount,
    yearCount,
  ]);

  return { totalDays, formattedDiff };
};