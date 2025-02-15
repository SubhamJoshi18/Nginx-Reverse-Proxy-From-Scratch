import {z} from 'zod'

const workerMessageBodySchema = z.any()
const workerMessageHeaderSchema = z.any()

const workerMessageSchema = z.object({
    requestType : z.enum(['http']),
    headers : workerMessageHeaderSchema,
    body : workerMessageBodySchema,
    url : z.string()
})

const workerMessageResponse = z.object({
    data : z.string().optional(),
    error : z.string(),
    errorCode: z.enum(['500','404'])


})

export {
    workerMessageSchema,
    workerMessageResponse
}