import { ICreateServer, WorkerMessageResponseType } from "../types"
import cluster , {Worker} from 'node:cluster'
import http from 'node:http'
import { validateConfiguration } from "../configs/config"
import { WorkerMessageType } from "../types"
import {workerMessageResponse, workerMessageSchema} from "../validation/server.validation"

async function createServer(configServer : ICreateServer){
    const {worker_count, port} = configServer
    const workerPool : Worker[] = new Array()
    if(cluster.isPrimary){
        console.log(`Master Node is Process`)
        for (let i = 0 ; i < worker_count; i++) {
            const clusterFork = cluster.fork({config : JSON.stringify(configServer.config)})
            console.log(`Master Process : Worker Node Spinned up on ${i}`)
            workerPool.push(clusterFork)
        }

        const server = http.createServer(function(req,res) {
            const randomWorkerIndex = Math.floor(Math.random() * worker_count)

            const randomWorker : Worker | undefined = workerPool.at(randomWorkerIndex)

            if(!randomWorker){
                throw new Error(`No Workers`)
            }

            const payload  : WorkerMessageType = {
                requestType : 'http',
                headers : req.headers,
                body : null,
                url : req.url as string
            }
            randomWorker.send(JSON.stringify(payload))

            randomWorker.on('message', async (message) => {
                const reply = await workerMessageResponse.parseAsync(JSON.parse(message))
                if(reply.errorCode){
                    res.writeHead(parseInt(reply.errorCode))
                    res.end(reply.error)
                }else{
                    res.writeHead(200)
                    res.end(reply.data)
                }
            })
        })

        server.listen(port, () => {
            console.log(`Shubham Nginx Reverse Proxy is running on ${port}`)
        })
    }else{
        console.log(`Worker Nodes : ${process.env.config}`)
        const config = await validateConfiguration(JSON.parse(process.env.config as string))
        process.on('message', async (data) => {
            console.log(`Worker Has Obtained an Message : ${data} `)
            const messageValidation = await workerMessageSchema.parseAsync(JSON.parse(data as unknown as any ))

            const requestUrl =  messageValidation.url
            const pathRules = config.server.rules
            const rule = pathRules.filter((data:any) => data.path === requestUrl)
            if(!rule){
                const reply : WorkerMessageResponseType = {
                    error : 'Rule Not Found',
                    errorCode : '404'
                } 

                if(process.send) return process.send(JSON.stringify(reply))
            }

            const allUpstreams = config.server.upstreams
            const extractedUpstreams = rule ? rule.pop()?.upstreams : []
            const matchUpstreams = []

            if(Array.isArray(extractedUpstreams) && extractedUpstreams.length > 0) {

                 for(let i = 0; i < extractedUpstreams.length; i++) {
                     const upstreamContent = extractedUpstreams[i]
                     const filterUpstream =allUpstreams.filter((data:any) => data.id === upstreamContent)
                     if(filterUpstream.length > 0) {
                        matchUpstreams.push(filterUpstream.pop())
                     }else{
                        continue
                     }

                 }
            }

            for (let i = 0; i < matchUpstreams.length; i++ ){
                const streamContent = matchUpstreams[i]

                http.request({host : streamContent?.url, path : requestUrl}, (proxyRes) => {
                    let body = ''

                    proxyRes.on('data',(chunk) => {
                        body += chunk
                    })

                    proxyRes.on('end',() => {
                        const reply : WorkerMessageResponseType = {
                            data : body,
                            error : 'No Error',
                            errorCode : '500'
                        }
                        if(process.send) return process.send(JSON.stringify(reply))
                    })

                    
                })
            }
        })
    }
     
}   

export {
    createServer
}