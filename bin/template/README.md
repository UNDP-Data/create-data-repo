# 📦 Data Repository Template
This repository serves as a template for organizing and managing data files across projects. It provides a standardized structure for storing, validating, and sharing datasets effectively.

__[Log file](./validation.log)__


## ✅ Automated Data Validation
A GitHub Action is included to automatically validate uploaded data files (`.csv`, `.json`, `.xlsx`, `.xls`) whenever a commit or pull request modifies files in the `data/` folders.

### 🔁 What Happens on Validation Failure

If validation fails:
* 🔍 The workflow identifies the modified data files
* ♻️ Reverts only the modified files to their previous state
* 💬 Commits the reversion with an appropriate message
* ❌ Fails the workflow to prevent invalid data from being merged

You can view detailed logs and errors in the `GitHub Actions` tab.


### 🔧 Trigger Conditions

This workflow runs on:
* Push to any branch when: Files in `data/` folders with supported extensions are changed
* Pull Requests modifying those same files


### 🛠️ Validation Script

The validation logic is handled by `validation/validate.js`.


#### 🔍 How It Works

* Looks for files in `data/` with one of the following extensions: `.csv`, `.xlsx`, `.xls`, `.json`.
* For each data file, checks for a corresponding schema file in the schema/ directory:
    * The schema file must have the same base name and a `.json` extension.
    * If no schema exists, the data file is considered valid by default.
* Validates the data against the schema.
* Logs success or details of any validation errors in log file [here](./validation.log).


### 📐 Schema format
The schema file in the `schema/` folder must be a JSON array with the following structure:

```ts
{
  columnName: string;
  type: 'string' | 'number' | 'Alpha 3 code' | 'dateTime' | 'boolean';
  required?: boolean;
  enum?: string[];        // Only applicable if type is 'string'
  range?: [number, number]; // Only applicable if type is 'number'
  dateFormat?: string;    // Only applicable if type is 'dateTime'
}[]
```

## Logs
The github action creates a log file after every change to the data sheet. Log file can be found [here](./validation.log).

### Example log files

__Log for successful validation__

```log

Updated on: 7/12/2025, 10:07:54 AM UTC
Status: ✅ Validation Successful.

```


__Log for unsuccessful validation__

```log

Updated on: 12/07/2025, 12:57:18 UTC
Status: ❌ Validation failed. Files reverted to their previous valid version.

---

🚩 Files with issues (2)

📄 data01.csv
Row: 1 | Column: column 4 | ⚠️ Error: column 4 must be a valid number. Received: "text"
Row: 2 | Column: column 4 | ⚠️ Error: column 4 must be a valid number. Received: "tex"

📄 data02.csv
Row: 1 | Column: column 4 | ⚠️ Error: column 4 must be a valid number. Received: "text"
Row: 2 | Column: column 4 | ⚠️ Error: column 4 must be a valid number. Received: "yex"

---

✅ Files without any issues (2)

📄 data03.csv
📄 data04.csv

---
```

## Related Repos
* [name of the repo where this data is used](link to repo where this data is used): This is the application or project that uses this dataset. [View the application site]({{link to the project site here}})


## Contact
For questions or suggestions, please open an issue or contact the repository maintainer.
