import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const FormSchema = z.object({
  dob: z.date({
    required_error: "A date is required.",
  }),
});

export function CalendarDate({ calendarLabel, date, setDate }) {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dob: date || new Date(), // gunakan date jika tersedia, jika tidak, gunakan tanggal hari ini
    },
  });

  return (
    <Form {...form}>
      <div className="space-y-8">
        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="mt-8 text-sm ms-3 text-muted-foreground">
                {calendarLabel}
              </FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  asChild
                  className="border-0 outline-none focus:outline-none"
                >
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-[255px] pl-3 text-left font-normal text-lg"
                      onClick={() => setOpen(true)}
                    >
                      {format(field.value, "PPP")}
                      <CalendarDays className="w-4 h-4 ml-auto" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(selectedDate) => {
                      field.onChange(selectedDate);
                      setDate(selectedDate);
                      setOpen(false);
                    }}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
