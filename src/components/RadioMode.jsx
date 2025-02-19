import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export const RadioMode = ({ radioOperation, setRadioOperation }) => {
  return (
    <RadioGroup
      value={radioOperation}
      onValueChange={setRadioOperation}
      className="flex flex-row gap-[4rem] mt-8 ms-3"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="r1" value="add" />
        <Label htmlFor="r1">Add</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem id="r2" value="subtract" />
        <Label htmlFor="r2">Subtract</Label>
      </div>
    </RadioGroup>
  );
};
