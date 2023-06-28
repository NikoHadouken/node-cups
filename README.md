# CUPS JavaScript API

The CUPS JavaScript API is a library that provides a convenient way to interact with the CUPS (Common UNIX Printing System) command line tool on Linux distributions.
With the provided functions and type definitions, you can easily retrieve print job details, get printer options, print files or buffers, and cancel print jobs. This API enables seamless integration of printing capabilities into your JavaScript applications on Linux distributions.

## Getting Started

To use the CUPS JavaScript API in your project, follow these steps:

1. Install the necessary dependencies:

```bash
npm install node-cups
```

2. Import the required functions and types into your JavaScript file:

```js
import {
  getCompletedQueue,
  getNotCompletedQueue,
  getPrinterNames,
  getPrinterOptions,
  getAllPrinterOptions,
  printBuffer,
  printFile,
  cancelAllJobs,
  cancelJob,
} from "node-cups";
```

3. Start using the API functions in your application as shown in the examples below.

## API Summary

The CUPS JavaScript API exposes several functions for interacting with print jobs and printers:

### 1. Type Definitions

The API also provides the following type definitions to assist in type checking:

```typescript
type JobQueue = Array<{
  id: string;
  printerName: string;
  user: string;
  size: string;
  date: string;
}>

type QueueOptions = {
  printers?: string[];
}

type PrinterOptions = {
  name: string;
  values: string[];
  defaultValue?: string;
}

type PrintParams = {
  printer?: string;
  copies?: number;
  priority?: number;
  pages?: string;
  fitToPage?: boolean;
  printerOptions: Record<string, string>;
}

type PrintResult = {
  stdout: string;
  requestId?: string;
}
```

### 2. Print Job Functions

- `getCompletedQueue(options?: QueueOptions): Promise<JobQueue>`
  Retrieves a list of completed print jobs.

  Example:

  ```javascript
  const completedJobs = await getCompletedQueue();
  console.log(completedJobs);
  ```

- `getNotCompletedQueue(options?: QueueOptions): Promise<JobQueue>`
  Retrieves a list of print jobs that are not yet completed.

  Example:

  ```javascript
  const notCompletedJobs = await getNotCompletedQueue();
  console.log(notCompletedJobs);
  ```

- `getPrinterNames(): Promise<string[]>`
  Retrieves a list of printer names available on the system.

  Example:

  ```javascript
  const printerNames = await getPrinterNames();
  console.log(printerNames);
  ```

- `getPrinterOptions(printerName: string): Promise<Array<PrinterOptions>>`
  Retrieves the available options for a specific printer.

  Example:

  ```javascript
  const printerOptions = await getPrinterOptions("printer-1");
  console.log(printerOptions);
  ```

- `getAllPrinterOptions(): Promise<Array<{ printerName: string; options: PrinterOptions[] }>>`
  Retrieves all printer options for each printer on the system.

  Example:

  ```javascript
  const allPrinterOptions = await getAllPrinterOptions();
  console.log(allPrinterOptions);
  ```

- `printBuffer(data: Buffer, params: PrintParams): Promise<PrintResult>`
  Prints a buffer of data using the specified print parameters.

  Example:

  ```javascript
  const data = Buffer.from("Hello, World!", "utf8");
  const params = {
    printer: "printer-1",
    copies: 2,
    printerOptions: {
      orientation: "landscape",
    },
  };
  const result = await printBuffer(data, params);
  console.log(result);
  ```

- `printFile(file: string, params: PrintParams): Promise<PrintResult>`
  Prints a file using the specified print parameters.

  Example:

  ```javascript
  const file = "/path/to/file.pdf";
  const params = {
    printer: "printer-1",
    copies: 1,
    printerOptions: {
      media: "A4",
    },
  };
  const result = await printFile(file, params);
  console.log(result);
  ```

- `cancelAllJobs(printer?: string): Promise<void>`
  Cancels all print jobs on the system.

  Example:

  ```javascript
  await cancelAllJobs();
  ```

- `cancelJob(requestId: string): Promise<void>`
  Cancels a specific print job identified by the `requestId`.

  Example:

  ```javascript
  const requestId = "job-123";
  await cancelJob(requestId);
  ```


