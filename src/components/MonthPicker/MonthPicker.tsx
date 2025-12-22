import { formatMonthLabel, formatMonthValue, parseMonthValue } from "@/helpers";
import { useAvailableMonths } from "@/hooks/transactions.hooks";

// TODO MonthPicker possible improvement
// << Current date >> => wrap with prev/next (if they exist) button
// 'Jump to xx month'
// Implement better UI

const WINDOW_SIZE = 5;

interface Props {
  currentMonth: Date | null;
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
const getMonthWindow = (availableMonths: string[] = [], selectedMonth: Date, windowSize = 6): string[] => {

  if (!availableMonths?.length) return [];

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

  const { months, loading, error } = useAvailableMonths()

  const windowedMonths = getMonthWindow(months, currentMonth, WINDOW_SIZE);

  if (!currentMonth) return <></>;

  return (
    <>
      <select
        value={formatMonthValue(currentMonth)}
        onChange={e => setMonth(parseMonthValue(e.target.value))}
        disabled={loading}
      >
        {loading ? (
          <option>Loading months...</option>
        ) : (
          windowedMonths.map(m => (
            <option key={m} value={m}>
              {formatMonthLabel(m)}
            </option>
          ))
        )}
      </select>
      {error && <div className="text-red-600 mt-1">{error}</div>}
      {/* TODO add button "Jump to month" => open modal => <input type="month"> */}
      {/* TODO add loading indictor, and so remove the <option>Loading months...</option>  */}
    </>
  );
}

export default MonthPicker;
