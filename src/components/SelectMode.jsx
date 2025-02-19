import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SelectMode = ({ mode, setMode }) => {
  return (
    <Select value={mode} onValueChange={setMode}>
      <SelectTrigger className="w-[255px] bg-inherit hover:bg-neutral-800 border-0 text-lg">
        <SelectValue placeholder="Difference between dates" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">Difference between dates</SelectItem>
        <SelectItem value="1">Add or subtract days</SelectItem>
      </SelectContent>
    </Select>
  );
};
