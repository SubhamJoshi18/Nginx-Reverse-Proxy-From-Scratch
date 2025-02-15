import {z} from 'zod'


const upstreamSchema = z.object({
    id : z.string(),
    url : z.string()
})

const headerSchema = z.object({
    key : z.string(),
    value : z.any()
})

const rulesSchema = z.object({
    path : z.string(),
    upstreams : z.array(z.string())
})

const serverSchema  = z.object({
    listen : z.number(),
    workers : z.number().optional(),
    upstreams : z.array(upstreamSchema),
    headers : z.array(headerSchema),
    rules : z.array(rulesSchema)


})

export const configSchema = z.object({
    server : serverSchema
})



