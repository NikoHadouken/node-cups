import { CommandResult, spawn } from './system-util'

// list jobs

export type JobQueue = Array<{
  requestId: string
  user: string
  size: string
  date: string
}>

export type QueueOptions = {
  printer: string
}

export const getCompletedQueue = async (
  options?: QueueOptions,
): Promise<JobQueue> => getQueue(true, options)

export const getNotCompletedQueue = async (
  options?: QueueOptions,
): Promise<JobQueue> => getQueue(false, options)

const getQueue = async (
  completed = false,
  options?: QueueOptions,
): Promise<JobQueue> => {
  const args = ['-W', completed ? 'completed' : 'not-completed']
  const { printer } = options ?? {}

  if (printer) {
    args.push('-d', printer)
  }
  const { stdout } = await spawn('lpstat', args)
  return stdout
    .split('\n')
    .filter((line) => !!line)
    .map((line) => {
      const [requestId, user, size, date] = line.split(/\s{2,}/)
      return {
        requestId,
        user,
        size,
        date,
      }
    })
}

// list printers

export const getPrinterNames = async (): Promise<string[]> => {
  const { stdout } = await spawn('lpstat', ['-p'])

  const names = stdout.split('\n').map((line) => {
    const [_type, name] = line.split(' ')
    return name
  })

  return names.filter((name) => !!name)
}

// list printer options

export type PrinterOptions = {
  name: string
  values: string[]
  defaultValue?: string
}

export const getPrinterOptions = async (
  name: string,
): Promise<Array<PrinterOptions>> => {
  const { stdout } = await spawn('lpoptions', ['-p', name, '-l'])

  const options: Array<PrinterOptions> = []

  stdout
    .split('\n')
    .filter((line) => !!line)
    .forEach((line) => {
      const [names, list] = line.split(': ')
      if (!names || !list) {
        return
      }
      const [name] = names.split('/')
      const entry: PrinterOptions = {
        name,
        values: [],
      }

      const values = list.split(' ').map((value) => {
        if (value.charAt(0) === '*') {
          const val = value.substring(1)
          entry.defaultValue = val
          return val
        }

        return value
      })

      entry.values = values

      options.push(entry)
    })

  return options
}

export const getAllPrinterOptions = async (): Promise<
  Array<{ name: string; options: PrinterOptions[] }>
> => {
  const names = await getPrinterNames()
  const options = names.map(async (name) => {
    const options = await getPrinterOptions(name)
    return {
      name,
      options,
    }
  })

  return await Promise.all(options)
}

// create print job

export type PrintParams = {
  printer?: string
  copies?: number
  priority?: number
  pages?: string
  printerOptions: Record<string, string>
}

export type PrintResult = {
  stdout: string
  requestId?: string
}

type PrintCommand = (lpArgs: string[]) => Promise<CommandResult>

const print =
  (command: PrintCommand) =>
    async (params?: PrintParams): Promise<PrintResult> => {
      const { printer, copies, priority, pages, printerOptions } = params ?? {}
      const lpArgs: string[] = []

      if (printer) {
        lpArgs.push('-d', printer)
      }

      if (copies) {
        lpArgs.push('-n', copies.toString())
      }

      if (priority) {
        lpArgs.push('-q', priority.toString())
      }

      if (pages) {
        lpArgs.push('-P', pages)
      }

      Object.entries(printerOptions ?? {}).forEach(([key, value]) => {
        lpArgs.push('-o', `${key}=${value}`)
      })

      const { stdout } = await command(lpArgs)
      // example stdout: request id is epson-et-16650-9037 (1 file(s))
      const pattern = /(\S*-\d+) \(.*\)\n$/
      const match = pattern.exec(stdout)
      const requestId = match ? match?.[1] : undefined
      return {
        stdout,
        requestId,
      }
    }

export const printBuffer = async (
  data: Buffer,
  params: PrintParams,
): Promise<PrintResult> => {
  const command: PrintCommand = (args) => spawn('lp', args, data)
  return print(command)(params)
}

export const printFile = async (
  file: string,
  params: PrintParams,
): Promise<PrintResult> => {
  const command: PrintCommand = (args) => spawn('lp', [...args, '--', file])
  return print(command)(params)
}

// cancel print job

export const cancelAllJobs = async (printer?: string): Promise<void> => {
  const args = []
  if (printer) {
    args.push('-a', printer)
  }
  await spawn('cancel', args)
}

export const cancelJob = async (requestId: string): Promise<void> => {
  spawn('cancel', [requestId])
}
