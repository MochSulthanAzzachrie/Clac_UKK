"use client";

import { useState } from "react";
import { SelectMode } from "@/components/SelectMode";
import { CalendarDate } from "@/components/CalendarDate";
import { DateCalcLogic } from "@/components/CalcLogic";
import { RadioMode } from "@/components/RadioMode";
import { SelectCount } from "@/components/SelectCount";
import LayoutOne from "@/app/layoutOne";

function Date_Calculation() {
  // Mode: "0" untuk difference, "1" untuk date calculation
  const [mode, setMode] = useState("0");

  // State untuk mode 0
  const [mode0FromDate, setMode0FromDate] = useState(new Date());
  const [mode0ToDate, setMode0ToDate] = useState(new Date());

  // State untuk mode 1
  const [mode1FromDate, setMode1FromDate] = useState(new Date());

  // State input untuk mode 1
  const [radioOperation, setRadioOperation] = useState("add");
  const [selectedDay, setSelectedDay] = useState("7"); // misal 7
  const [selectedMonth, setSelectedMonth] = useState("0");
  const [selectedYear, setSelectedYear] = useState("0");

  // Panggil hook kalkulasi dengan mengirim state yang sudah dipisah
  const { totalDays, formattedDiff } = DateCalcLogic({
    mode,
    mode0FromDate,
    mode0ToDate,
    mode1FromDate,
    radioOperation,
    dayCount: selectedDay,
    monthCount: selectedMonth,
    yearCount: selectedYear,
  });

  return (
    <LayoutOne header={"Date-Calculation"}>
      <SelectMode mode={mode} setMode={setMode} />
      {mode === "0" ? (
        <>
          <CalendarDate
            calendarLabel={"From"}
            date={mode0FromDate}
            setDate={setMode0FromDate}
          />
          <CalendarDate
            calendarLabel={"To"}
            date={mode0ToDate}
            setDate={setMode0ToDate}
          />
        </>
      ) : (
        <>
          <CalendarDate
            calendarLabel={"From"}
            date={mode1FromDate}
            setDate={setMode1FromDate}
          />
          <RadioMode
            radioOperation={radioOperation}
            setRadioOperation={setRadioOperation}
          />
          <SelectCount
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
          />
        </>
      )}
      <div className="ms-3 mt-9">
        {mode === "0" ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">Difference</p>
            <p className="mb-4 text-xl font-medium">{formattedDiff}</p>
            <p className="text-sm text-muted-foreground">
              {totalDays} day{totalDays !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">Date</p>
            <p className="mb-4 text-xl font-medium">{formattedDiff}</p>
          </>
        )}
      </div>
    </LayoutOne>
  );
}

export default Date_Calculation;
