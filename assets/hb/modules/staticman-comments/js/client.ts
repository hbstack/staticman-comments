import { Response } from './types'

class Client {
  constructor (private readonly api: string) {
  }

  async send (data: unknown): Promise<Response> {
    return await fetch(this.api, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(async (resp) => await resp.json())
  }
}

export default Client
