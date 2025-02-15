import {program} from 'commander'
import { parseYamlConfig, validateConfiguration } from './configs/config'
import os from 'node:os'
import { createServer } from './nginxServers/nginxServer'



async function main(){


    program.option('--config <path>')
    program.parse()

    const options = program.opts()
    if(options && 'config' in options){
        const validatedConfig = await validateConfiguration(await parseYamlConfig(options['config']))
        console.log(validatedConfig)

    await createServer({
        port : validatedConfig.server.listen,
        worker_count : validatedConfig.server.workers ?? os.cpus().length,
        config : validatedConfig
    })
    }

  
}

main()