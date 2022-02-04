import { ReactElement, useEffect, useState } from 'react'
import { StatsTable, MusicToggle, Welcome, Button2 } from 'components'
import { Adventurer, Character, Enemy, EvilTree, FireWorm, Knight, Martial, Slime } from 'entities'
import { textBlue, textCyan, textRed } from 'utils/colorText'

export default function Single() {
    const [messages, setMessages] = useState<Array<ReactElement>>([])
    const [colorTheme, setColorTheme] = useState<string>('')
    const [fighting, setFighting] = useState<boolean>(false)
    const [enemy, setEnemy] = useState<Enemy>()
    const [player, setPlayer] = useState<Character>()
    const [resetHtml, setResetHtml] = useState(false)

    const logMsg = (text: JSX.Element) => {
        if (messages.length < 4) {
            setMessages([...messages, text])
        } else {
            const msgs = messages.filter((x, i) => i != 0)
            setMessages([...msgs, text])
        }
    }

    // ------------------------------------------------------
    //    ENEMY TRIGGER
    // ------------------------------------------------------
    // Each time a new enemy comes
    useEffect(() => {
        if (!enemy) return
        logMsg(
            <p className='mt-2'>
                {textRed(enemy.name)} lv {textRed(enemy.level)} has appeared!
            </p>,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enemy])

    // ------------------------------------------------------
    //    THE GAME STARTS !
    // ------------------------------------------------------
    const initFight = () => {
        setFighting(true)
        setEnemy(generateEnemy(player.level))
    }

    const playerGetDamage = () => {
        player._getDamage(200)
        setResetHtml(!resetHtml)
        if (player.dmgRecieved === player.health) {
            playerDefeat()
        }
    }

    const enemyGetDamage = () => {
        enemy._getDamage(200)
        setResetHtml(!resetHtml)
        if (enemy.dmgRecieved === enemy.health) {
            enemyDefeat()
        }
    }

    const playerDefeat = () => {
        setFighting(false)
        logMsg(<p className='mt-2'>I&apos;m sorry {textBlue(player.name)}, you have been defeated 😔</p>)
        logMsg(<p className='mt-2'>Better luck the next time!</p>)
        setTimeout(() => {
            setPlayer(null)
            setEnemy(null)
        }, 2000)
    }

    const enemyDefeat = () => {
        setFighting(false)
        const exp = parseInt(((enemy.level / player.level) * 75).toFixed(0))
        const leveledUp = player.gainExp(exp)
        logMsg(
            <p className='mt-2'>
                {textRed(enemy.name)} lv {textRed(enemy.level)} has been defeated! 🎉🎉
                <br />
                Well done, you recieved <span className='text-cyan-400'>{exp}</span> exp! 💪🏻
                <br />
                {leveledUp ? <span>You level up! Lv: {textCyan(player.level)}</span> : ''}
            </p>,
        )
        // TODO: powerups?
        setTimeout(() => setEnemy(null), 1000)
    }

    if (!player) return <Welcome setPlayer={setPlayer} setColorTheme={setColorTheme} />

    return (
        <div className='animate__animated animate__fadeIn bg-zinc-900 h-screen pt-20 pb-10 relative'>
            <h1 className='absolute top-0 left-0 text-3xl p-5 text-center text-white w-full'>Hexakill !</h1>
            <nav className='absolute top-0 right-10 text-white'>
                <MusicToggle />
            </nav>

            <section className='bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1'>
                <div className='grid grid-cols-3'>
                    <div className='bg-zinc-900 shadow p-2 m-2 rounded flex gap-4 justify-center items-center'>
                        <Button2 onClick={playerGetDamage} style={colorTheme}>
                            HIT player
                        </Button2>
                        {fighting && (
                            <Button2 onClick={enemyGetDamage} style={colorTheme}>
                                HIT enemy
                            </Button2>
                        )}
                    </div>
                    <StatsTable entity={player} resetHtml={resetHtml} />
                    {enemy != undefined ? (
                        <StatsTable entity={enemy} resetHtml={resetHtml} />
                    ) : (
                        <section className='bg-zinc-900 shadow p-2 m-2 rounded flex justify-center items-center'>
                            <Button2 onClick={initFight} style={colorTheme}>
                                FIGHT
                            </Button2>
                        </section>
                    )}
                </div>
                <div className='bg-zinc-900 shadow p-2 m-2 rounded relative col-span-3'>
                    <h4 className='text-center text-lg p-2'>Info</h4>
                    <hr />
                    <article className='p-4 h-4/5 overflow-y-hidden'>
                        {messages.map((msg, idx) => (
                            <div className='animate__animated animate__fadeIn' key={idx}>
                                <p className={idx + 1 === messages.length ? '' : 'opacity-25'}>{msg}</p>
                            </div>
                        ))}
                    </article>
                </div>
            </section>
        </div>
    )
}

const generateEnemy = (level: number) => {
    // range of levels
    const min_enemy_level = Math.floor(level / 2)
    const max_enemy_level = level * 2
    const enemy_level = parseInt((Math.floor(Math.random() * (max_enemy_level - min_enemy_level + 1)) + min_enemy_level).toFixed(0))

    // create the enemy
    const enemies_pool = [Adventurer, EvilTree, FireWorm, Knight, Martial, Slime]
    const enemy_pick = enemies_pool[Math.floor(Math.random() * enemies_pool.length)]
    return new enemy_pick(enemy_level)
}

const enemy_action = (enemy: Enemy) => {
    let choice: number
    const enemy_action_generator = Math.random()

    if ((enemy.health - enemy.dmgRecieved) / enemy.health < 0.2) {
        // If less than 20% hp, always heals
        choice = 2
    } else if ((enemy.health - enemy.dmgRecieved) / enemy.health > 0.6) {
        // If more than 60% hp, never heals
        choice = enemy_action_generator < 0.5 ? 0 : 1
    } else {
        choice = enemy_action_generator < 0.33 ? 0 : enemy_action_generator < 0.66 ? 1 : 2
    }
    return choice
}
