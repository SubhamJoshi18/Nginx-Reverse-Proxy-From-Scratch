import fs from 'fs/promises'
import {parse} from 'yaml'
import {configSchema} from '../validation/config.validation'


async function parseYamlConfig(filePath :string){
    const configFile = await fs.readFile(filePath,{encoding:'utf-8'})
    const parseContent = parse(configFile)
    return JSON.stringify(parseContent)

}


async function validateConfiguration(config : string){
    const validatedConfig = await configSchema.parseAsync(JSON.parse(config))
    return validatedConfig
}


export {
    parseYamlConfig,
    validateConfiguration
}