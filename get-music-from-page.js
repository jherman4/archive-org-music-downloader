const fs = require('fs')
const path = require('path')

const puppeteer = require('puppeteer')
const axios = require('axios')

// Parse argv
const argv = require('yargs')
.option('dest', {
    type: 'string',
    demandOption: true,
    desc: 'Relative path to a directory to which the music will be downloaded to'
}) 
.option('queue-json-file', {
        type: 'string',
        desc: 'Relative path to a json file which stores a json list of string urls to fetch music from'
})
.option('queue', {
        type: 'array',
        desc: 'list of string urls to fetch live music from'
})
.argv

const { dest, queue } = argv
const queueFile = argv['queue-json-file']

let pageQueue

if (queueFile) {
    const queueFilePath = path.join(__dirname, queueFile)
    try {
        console.log(`Opening queue file at ${queueFilePath}..`)
        const jsonQueue = fs.readFileSync(queueFilePath)
        pageQueue = JSON.parse(jsonQueue)
    } catch(e) {
        console.error(`Error opening queue file path or parsing queue file: ${e.message}`)
        process.exit(1)
    }
} else if (queue) {
    pageQueue = queue
} else {
    console.warning('Neither cli queue or queue path passed to argv, no urls passed to parse.')
    console.log('exiting...')
    process.exit(0)
}

const getMusic = async (url, localPath) => {
    try {
        console.log(`scraping url: ${url}`)
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url)

        // Scrape details
        const { trackList, showName } = await page.$eval('#theatre-ia-wrap', (container) => {
            const showName = container.querySelector('h1.sr-only').innerText

            const trackList = []
            container.querySelectorAll('div').forEach(div => {
                const dupRegex = /_(\d+)$/
                if (div.attributes.itemprop) {
                    let name = div.children['0'].attributes.content.value

                    let duplicate = trackList.find(track => track.name === name)
                    if (duplicate) {
                        const match = duplicate.name.match(dupRegex)
                        
                        if (match) {
                            const n = parseInt(match[1])
                            name = `${name}_${n + 1}`
                        } else {
                            name = `${name}_1`
                        }
                    }

                    // find and replace some problematic chars
                    name = name.replace('>','')
                    name = name.replace('*','')
                    name = name.replace(/\//g,'_')

                    trackList.push({
                        name,
                        link: div.children['2'].attributes.href.textContent
                    })
                    
                }
            })

            return {
                showName,
                trackList
            }
        })
        console.log(`${trackList.length} tracks found for ${showName}`)
        console.log('Downloading data...')

        // download tracks
        const downloadDir = path.join(localPath, showName)
        fs.mkdirSync(downloadDir)

        for (let i=0; i < trackList.length; i++) {
            const { name, link } = trackList[i]
            
            console.log(`Downloading track: ${name}...`)
            try {
                const { data } = await axios({
                    url: link,
                    method: 'GET',
                    responseType: 'arraybuffer',
                    headers: {
                        'Content-Type': 'audio/wav'
                    }
                })
                
                fs.writeFileSync(path.join(downloadDir, `${name}.mp3`), data)
                console.log('done')
            } catch(e) {
                console.log(`Error getting track "${name}": ${e.stack}`)
            }
        }

        await page.close()
        await browser.close()
        console.log('complete!')
    } catch (e) {
        console.log(`Error for ${url}: ${e.stack}`)
    }
}

const runQueue = async (queue, dest) => {
    for (const url of queue) {
        try {
            await getMusic(url, dest)
        } catch(e) {
            console.log(`Error getting music from ${url}: ${e.message}`)
        }
    }
    process.exit(0)
}

runQueue(pageQueue, path.join(__dirname, dest))
