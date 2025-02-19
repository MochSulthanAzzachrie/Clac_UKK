import { Card } from "./ui/card";

export const Main = ({ children, className }) => {
  return (
    <Card className={`p-2 border-4 bg-inherit ${className}`}>
        <div className="flex flex-col w-full h-full">{children}</div>
    </Card>
  );
};

