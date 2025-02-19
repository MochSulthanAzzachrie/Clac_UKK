import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  export const SelectCount = ({
    selectedDay,
    setSelectedDay,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
  }) => {
    const numbers = Array.from({ length: 1000 }, (_, i) => String(i));
  
    return (
      <div className="flex flex-row gap-5 xl:gap-[4rem] mt-8 ms-3">
        <div>
          <p className="mb-6 text-sm text-muted-foreground">Day</p>
          <Select value={selectedDay} onValueChange={setSelectedDay}>
            <SelectTrigger className="w-[100px] bg-neutral-800 hover:bg-neutral-700 border-0 text-lg">
              <SelectValue placeholder="0" />
            </SelectTrigger>
            <SelectContent>
              {numbers.map((num) => (
                <SelectItem key={`day-${num}`} value={num}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-6 text-sm text-muted-foreground">Month</p>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[100px] bg-neutral-800 hover:bg-neutral-700 border-0 text-lg">
              <SelectValue placeholder="0" />
            </SelectTrigger>
            <SelectContent>
              {numbers.map((num) => (
                <SelectItem key={`month-${num}`} value={num}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <p className="mb-6 text-sm text-muted-foreground">Year</p>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px] bg-neutral-800 hover:bg-neutral-700 border-0 text-lg">
              <SelectValue placeholder="0" />
            </SelectTrigger>
            <SelectContent>
              {numbers.map((num) => (
                <SelectItem key={`year-${num}`} value={num}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  