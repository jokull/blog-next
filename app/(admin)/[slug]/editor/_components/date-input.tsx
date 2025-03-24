import { Input } from "@/app/_catalyst/input";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentProps,
} from "react";
import { useDebounceCallback } from "usehooks-ts";

type DateInputProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
} & Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "onBlur" | "type"
>;

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(dateStr: string): Date | undefined {
  const regex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
  const match = dateStr.match(regex);
  if (!match) return undefined;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const date = new Date(year, month, day);

  return date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
    ? date
    : undefined;
}

export function DateInput({ value, onChange, ...props }: DateInputProps) {
  const [inputValue, setInputValue] = useState<string>(() => {
    const initialDate = value ? parseDate(value) : new Date();
    return initialDate ? formatDate(initialDate) : formatDate(new Date());
  });

  useEffect(() => {
    const currentDate = parseDate(inputValue);
    const newDate = value ? parseDate(value) : new Date();

    if (newDate && currentDate?.getTime() !== newDate.getTime()) {
      setInputValue(formatDate(newDate));
    }
  }, [value]);

  const onChangeMemo = useMemo(() => onChange, [onChange]);
  const debouncedCallback = useDebounceCallback(onChangeMemo, 500);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setInputValue(newValue);

    const parsed = parseDate(newValue);
    debouncedCallback(parsed ? formatDate(parsed) : undefined);
  }

  function handleBlur() {
    debouncedCallback.cancel();

    const parsed = parseDate(inputValue);
    if (!parsed) {
      const fallbackDate = value ? parseDate(value) : new Date();
      const validDate = fallbackDate || new Date();
      const dateString = formatDate(validDate);

      setInputValue(dateString);
      onChange(dateString);
    } else {
      const formattedValue = formatDate(parsed);
      setInputValue(formattedValue);
      onChange(formattedValue);
    }
  }

  return (
    <Input
      type="text"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
