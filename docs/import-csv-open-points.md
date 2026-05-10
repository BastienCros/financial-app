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

Custom File Picker / Using modal and File input

Note: massive file may break thing, analyse shall be done to determinat maximu file size

## Parsing

Complex action => let an optimized lib do the job
De-facto is Papa Parse [See doc](https://react-papaparse.js.org/docs)
Interesting feature is: can do pasring in worker (`worker: true`), critical ot import big csv file
React version is required ? => no as File Import is custom


## Transformation layer

Shall detect the field according to csv header, 
BUT: dont trust blindly: Create a mapping object or use a fuzzy-matching logic to find the right columns regardless of capitalization.

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

At some point a preview of rendered mapping may be useful (specailly for categories)

But first: do a simple match mapping with personnal csv (that got categories)

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

#### The Fuzzing matching

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
