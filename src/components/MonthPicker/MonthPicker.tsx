import { useMemo } from "react";
import { useTransactions } from "@/contexts";
import { getAvailableMonth, formatMonthLabel, formatMonthValue, parseMonthValue } from "@/helpers";

// TODO MonthPicker possible improvement
// << Current date >> => wrap with prev/next (if they exist) button
// 'Jump to xx month'
// Implement better UI

interface Props {
  currentMonth: Date;
  setMonth: (date: Date) => void;
}

/**
 * Returns a sliding window of months centered around the selected month.
 *
 * @param availableMonths - Sorted array of month strings (chronological order)
 * @param selectedMonth - Currently selected month
 * @param windowSize - Number of months to display in the window
 * @returns Subset of availableMonths with length ≤ windowSize
 *
 * Logic:
 * - If window ≥ array length: return entire array
 * - If selected month near start: anchor window to beginning
 * - If selected month near end: anchor window to end
 * - Otherwise: center window around selected month
 */
const getMonthWindow = (availableMonths: string[], selectedMonth: Date, windowSize = 6): string[] => {
  const selectedMonthValue = formatMonthValue(selectedMonth);
  const selectedMonthIndex = availableMonths.findIndex(m => m === selectedMonthValue);

  if (selectedMonthIndex === -1) {
    throw new Error(`Month ${selectedMonthValue} not found in available months`);
  }

  const totalMonths = availableMonths.length;

  // Early return: window fits entire array
  if (windowSize >= totalMonths) return availableMonths;

  // Calculate centered window boundaries using explicit integer math
  const halfWindow = Math.floor(windowSize / 2);
  const startIndex = selectedMonthIndex - halfWindow;
  const endIndex = selectedMonthIndex + halfWindow;

  // Handle boundary conditions
  // Note: Cannot have both startIndex < 0 AND endIndex >= totalMonths
  // when windowSize < totalMonths (proven mathematically)
  if (startIndex < 0) {
    // Selected month too near start: anchor to beginning
    return availableMonths.slice(0, windowSize);
  }

  if (endIndex >= totalMonths) {
    // Selected month too near end: anchor to end
    return availableMonths.slice(-windowSize);
  }

  // Centered window: enough room on both sides
  // For odd windowSize: symmetric (k before + selected + k after)
  // For even windowSize: slightly asymmetric (k before + selected + k-1 after)
  return availableMonths.slice(startIndex, endIndex);
}

function MonthPicker({ currentMonth, setMonth }: Props) {

  /* Used to contruct list of available mont */
  const { transactions } = useTransactions();
  const allMonths = useMemo(
    () => getAvailableMonth(transactions),
    [transactions]
  );

  const windowedMonths = useMemo(
    () => getMonthWindow(allMonths, currentMonth, 5),
    [allMonths, currentMonth]
  );

  return (
    <>
      <select
        value={formatMonthValue(currentMonth)}
        onChange={e => setMonth(parseMonthValue(e.target.value))}
      >
        {windowedMonths.map(m => {
          const label = formatMonthLabel(m);
          return (
            <option key={m} value={m}>{label}</option>
          )
        })}
      </select>
      {/* TODO add button "Jump to month" => open modal => <input type="month"> */}
    </>
  );
}

export default MonthPicker;
