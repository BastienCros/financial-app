## Architecture Analysis — CSV Import Feature

NTLDR: let choos in modal, make the modal not return until it and (or cancel) / no state maanger eslewhere for now

### Current state

The feature has three layers:
1. `useImportTransaction` — owns I/O (FileReader, future PapaParse)
2. `ImportCsvModal` — owns form, hosts the hook, bubbles status via `onStatusChange`
3. `MainNavigation` — owns display status state machine, drives icon

### The core architectural problem

A background process has two properties that define where it should live:
- **Lifetime**: it should outlive its trigger
- **Scope**: it should be owned at the level of all its consumers

`ImportCsvModal` fails both. It is the trigger, not the owner. Its lifetime is controlled by the user (closing the modal kills the process). Its consumers span beyond it — the nav icon, future toast — but the modal cannot reach them without prop drilling or callbacks.

`MainNavigation` fails the scope criterion. It is one consumer of the process status, not the owner of the process. Owning I/O in a navigation component is a responsibility mismatch.

### Handling state 

A dedicated `React Context` at layout level may satisfies both properties:
- **Lifetime**: the layout is stable for the session
- **Scope**: all consumers — modal, nav, future toast — are layout children

TODO: decide if `QueryContext` is right place
Other place?  

### What disappears with the right architecture

The `onStatusChange` callback and the bridging `useEffect` in `ImportCsvModal` are symptoms of the hook being in the wrong place. They exist solely to tunnel state upward across a component boundary that shouldn't exist. Move the hook to the right owner and they are no longer needed.

### UX and architecture

You correctly identified these as related but independent. The architectural conclusion — `ImportContext` at layout level — holds regardless of UX choice. The UX choice only determines what the modal does after triggering the import: stay open or close immediately. Both are coherent once the hook is in the right place.

## The Strategy

1. File Picker: Use a standard HTML <input type="file">.
2. Parsing: Use a library to turn the "blob" into an array of objects.
3. Transformation: Map the raw CSV headers to your specific DB schema.
4. Validation: Ensure the data isn't junk before sending it off.

## File Picker

✅ Done: standard `<input type="file">` inside the import modal.

Note: massive file may break thing, analyse shall be done to determinat maximu file size

## Parsing

✅ Done: PapaParse with `worker: true` (offloads parsing off main thread).
React version is not required — using the vanilla library directly.


## Transformation layer

✅ Done: `SCHEMA_MAP` with case-insensitive key normalization (`normalizeRowKeys`).

Idea: later, propose a preview of 5-10 rows to let user reveiw the mapping beetween csv header <=> transaction field

### Data type

Goal interface is : 

```ts
export interface Transaction {
  id: string;
  date: string;        // ISO string: "2025-10-31"
  description: string; // what you show in the list
  categoryId: CategoryId;
  amount: number;      // > 0 = income, < 0 = expense
}
```

- **id**: handled by DB, shall no be touched
- **date**: 
    Format is likely to be incistent, shall be ocnverted to ISO format
- **category**: the maaping to a specific category may be problematic
- **amount**: may have IN and OUT amount ; shall be normalized

✅ Done: simple keyword mapping against personal CSV categories (`CATEGORY_MAP`).

At some point a preview of rendered mapping may be useful (especially for categories)

### Mapping object 
The most simple: the idea is to map a few string that realte to the same field.
OK if only a few possiblities, else a fuzzing mathcing may be relevant

```js
const SCHEMA_MAP = {
  email_address: ["email", "e-mail", "email address", "contact"],
  first_name: ["first name", "fname", "given name"],
  last_name: ["last name", "lname", "surname"]
};

const findHeader = (rowKeys, targetField) => {
  // Find which key in the CSV row matches our allowed list
  return rowKeys.find(key => 
    SCHEMA_MAP[targetField].includes(key.toLowerCase().trim())
  );
};

// Usage during transformation:
const transformed = rawData.map(row => {
  const keys = Object.keys(row);
  return {
    email: row[findHeader(keys, 'email_address')],
    firstName: row[findHeader(keys, 'first_name')]
  };
});
```

#### The Fuzzy matching

More "smart" macth making, can handle type , etc. 
Require a library like **Fuse.js**.

Idea: lazy-load the lib as a fall abck if the trivial mapping did not work


```js
import React, { useState } from 'react';
import Papa from 'papaparse';

const CsvImporter = () => {
  const [data, setData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    Papa.parse(file, {
      header: true, // Converts rows into JS objects using the first row as keys
      skipEmptyLines: true,
      complete: (results) => {
        transformData(results.data);
      },
      error: (error) => {
        console.error("Parsing error:", error.message);
      }
    });
  };

  const transformData = (rawRows) => {
    // This is where you structure it for your DB
    const structuredData = rawRows.map(row => ({
      external_id: row["ID"] || row["id"],
      full_name: `${row["First Name"]} ${row["Last Name"]}`,
      email_address: row["Email"]?.toLowerCase(),
      imported_at: new Date().toISOString(),
    }));

    setData(structuredData);
    console.log("Ready for DB:", structuredData);
  };

  return (
    <div className="p-4">
      <input 
        type="file" 
        accept=".csv" 
        onChange={handleFileUpload} 
        className="block mb-4"
      />
      
      {data.length > 0 && (
        <p>{data.length} rows parsed and structured!</p>
      )}
    </div>
  );
};

export default CsvImporter;
```

---

## Decisions

Small choices made during implementation that are worth tracking explicitly.

### Error handling strategy: fail-safe per row

Current decision: invalid rows are silently dropped, the import never aborts entirely.
This applies at two levels:
- **PapaParse row-level errors** (malformed quotes, field count mismatch): rows that generated a parse error are removed by index, the rest are processed normally.
- **Transformation errors** (`csvToTransaction` returns `undefined`): rows that fail mapping are filtered out before the bulk insert.

Open question: should the user be informed of how many rows were dropped, and why?

### Per-field fallback behavior

Each field has its own fallback strategy — the choice of what "missing or unrecognized value" means differs per field:

| Field | Missing/unrecognized | Rationale |
|---|---|---|
| `date` | `null` → row rejected | A transaction without a date is not meaningful |
| `category` | `"other"` → row kept | Losing categorization is acceptable, data is preserved |
| `amount` | `0` → row kept | Awkward but acceptable for now; strategy not yet defined |

Open question: is `amount: 0` a valid state or a silent data loss? Should rows with no resolvable amount be rejected like rows with no date?

### Encoding

CSV encoding is hardcoded to `ISO-8859-1` (French bank CSV format).
Open question: auto-detect encoding using a library like `jschardet` for broader compatibility.

### Outcome when all rows are filtered out

If every row fails (parse error + transformation), the import resolves as `"success"` with nothing inserted.
This is consistent with the fail-safe strategy but may be surprising to the user.
Open question: distinguish between "import succeeded with N rows" and "import ran but nothing was saved".
