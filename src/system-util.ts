import childProcess from 'child_process'

export type CommandResult = {
  stdout: string
}

export const spawn = async (
  cmd: string,
  args: string[],
  data?: Buffer,
): Promise<CommandResult> => {
  return new Promise((resolve, reject) => {
    const process = childProcess.spawn(cmd, args)
    const chunks: Buffer[] = []
    const errorChunks: Buffer[] = []

    if (data) {
      process.stdin.write(data)
      process.stdin.end()
    }

    process.stdout.on('data', (data) => {
      chunks.push(data)
    })

    process.stderr.on('data', (data) => {
      errorChunks.push(data)
    })

    process.on('error', (error) => {
      reject(error)
    })

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(Buffer.concat(errorChunks).toString()))
        return
      }
      resolve({
        stdout: Buffer.concat(chunks).toString(),
      })
    })
  })
}
