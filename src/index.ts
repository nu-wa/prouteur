import * as fs from 'fs'
import 'reflect-metadata'
import { Intents, VoiceChannel } from 'discord.js'
import { ArgsOf, Client, Discord, On } from 'discordx'
import { getAudioDurationInSeconds } from 'get-audio-duration'
import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior, VoiceConnectionStatus } from '@discordjs/voice'

type Status = {
    running: boolean,
    lastJoined: number,
    channel?: VoiceChannel
}

let status: Status = {
    lastJoined: 0,
    running: false,
    channel: undefined
}

const MAX_TIME = 1_800_000
const MIN_TIME = 300_000
let FILES: string[] = []

const player = createAudioPlayer({
    behaviors: {
        noSubscriber: NoSubscriberBehavior.Pause
    }
})

const getRandomTime = () => Math.floor(Math.random() * (MAX_TIME - MIN_TIME + MIN_TIME) + MIN_TIME)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

function getRandomFile(): string {
    const len = FILES.length

    if (len === 0) throw "assets empty ig"

    return `assets/${FILES[Math.floor(Math.random() * len)]}`
}

async function joinAndFart(voiceChannel: VoiceChannel) {
    status.running = true
    let time = getRandomTime()

    while (time + status.lastJoined > Date.now().valueOf() + MAX_TIME) {
        time = getRandomTime()
    }

    setTimeout(() => {
        const conn = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guildId,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        })

        conn.on(VoiceConnectionStatus.Ready, async () => {
            const randomFile = getRandomFile()
            const audioFile = createAudioResource(randomFile)
            const duration = await getAudioDurationInSeconds(randomFile)

            player.play(audioFile)

            const subscriber = conn.subscribe(player)
            if (subscriber) {
                setTimeout(async () => {
                    status.lastJoined = Date.now().valueOf()
                    status.channel = undefined
                    status.running = false
                    subscriber.unsubscribe()
                    delay((duration + 2) * 1000)
                    conn.disconnect()
                }, (duration + 1.5) * 1000)
            }
        })
    }, time)
    time = getRandomTime()
    await delay(time)
    joinAndFart(voiceChannel)
}

function checkChannel(channel: VoiceChannel) {
    if (!channel.joinable) return

    if (channel.members.size === 0) {
        status.running = false
        status.lastJoined = 0
        status.channel = undefined
        return
    }

    if (status.running) return

    if (channel.members.size > 0 && status.channel !== channel) {
        joinAndFart(channel)
    }
}

@Discord()
class Fart {
    @On("voiceStateUpdate")
    private onJoinVoice(
        [_, newState]: ArgsOf<"voiceStateUpdate">
    ) {
        const channel = newState.channel

        if (!(channel instanceof VoiceChannel)) return
        checkChannel(channel)
    }
}

const client = new Client({
    botId: process.env.BOT_ID,
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
})

client.once("ready", async () => {
    await client.initApplicationPermissions(true)

    fs.readdir("./assets", (err, files) => {
        console.error(err)

        files.forEach((file) => {
            if (file.endsWith(".mp3"))
                FILES.push(file)
        })
    })
})

async function main() {
    client.login(process.env.BOT_TOKEN)
}

main()
