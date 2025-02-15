import {z} from 'zod'
import { configSchema } from './validation/config.validation'
import {workerMessageSchema} from './validation/server.validation'
import { workerMessageResponse } from './validation/server.validation'

type ConfigSchemType = z.infer<typeof configSchema>
type WorkerMessageType = z.infer<typeof workerMessageSchema>
type WorkerMessageResponseType = z.infer<typeof workerMessageResponse>

interface ICreateServer {
    port : number
    worker_count : number,
    config : ConfigSchemType
}

export {
    ICreateServer,
    ConfigSchemType,
    WorkerMessageType,
    WorkerMessageResponseType
}