import { ReactElement, useEffect, useState } from 'react'
import { StatsTable, MusicToggle, Welcome, Button2 } from 'components'
import { Adventurer, Character, Enemy, EvilTree, FireWorm, Knight, Martial, Samurai, Slime, Warrior, Wizard } from 'characters'

export default function Single() {
    const [messages, setMessages] = useState<Array<ReactElement>>([])
    const [fighting, setFighting] = useState<boolean>(false)
    const [enemy, setEnemy] = useState<Enemy>()
    const [player, setPlayer] = useState<Character>()
    const [resetHtml, setResetHtml] = useState(false)

    const textRed = (text: string | number) => <span className='text-red-400'>{text}</span>
    const textBlue = (text: string | number) => <span className='text-blue-400'>{text}</span>

    const logMsg = (text: JSX.Element, style?: string) => {
        if (messages.length < 6) {
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
            <p className='mt-10'>
                {textRed(enemy.name)} lv {textRed(enemy.level)} has appeared!
            </p>,
        )
        setFighting(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enemy])

    // ------------------------------------------------------
    //    THE GAME STARTS !
    // ------------------------------------------------------
    const initFight = () => {
        setEnemy(generateEnemy(player.level))
    }

    const playerGetDamage = () => {
        player._getDamage(50)
        setResetHtml(!resetHtml)
        if (player.dmgRecieved === player.health) {
            playerDefeat()
        }
    }

    const enemyGetDamage = () => {
        enemy._getDamage(50)
        setResetHtml(!resetHtml)
        if (enemy.dmgRecieved === enemy.health) {
            enemyDefeat()
        }
    }

    const playerDefeat = () => {
        logMsg(<p className='mt-2'>I&apos;m sorry {textBlue(player.name)}, you have been defeated 😔</p>)
        logMsg(<p className='mt-2'>Better luck the next time!</p>)
        setTimeout(() => {
            setPlayer(null)
            setEnemy(null)
        }, 2000)
    }

    const enemyDefeat = () => {
        logMsg(
            <p className='mt-2'>
                {textRed(enemy.name)} lv {textRed(enemy.level)} has been defeated! 🎉🎉
            </p>,
        )
        setTimeout(() => {
            setEnemy(null)
            logMsg(<p className='mt-2'>Waiting for a new enemy...</p>)
        }, 2000)
    }

    if (!player) return <Welcome setPlayer={setPlayer} />

    return (
        <div className='animate__animated animate__fadeIn bg-zinc-900 h-screen pt-20 pb-10 relative'>
            <h1 className='absolute top-0 left-0 text-3xl p-5 text-center text-white w-full'>Hexakill !</h1>
            <nav className='absolute top-0 right-10 text-white'>
                <MusicToggle />
            </nav>

            <section className='bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1'>
                <div className='grid grid-cols-3'>
                    <div className='bg-zinc-900 shadow p-2 m-2 rounded flex gap-4 justify-center items-center'>
                        <Button2 onClick={playerGetDamage}>HIT player</Button2>
                        {enemy != undefined && <Button2 onClick={enemyGetDamage}>HIT enemy</Button2>}
                    </div>
                    <StatsTable entity={player} resetHtml={resetHtml} />
                    {enemy != undefined ? (
                        <StatsTable entity={enemy} resetHtml={resetHtml} />
                    ) : (
                        <section className='bg-zinc-900 shadow p-2 m-2 rounded flex justify-center items-center'>
                            <Button2 onClick={initFight}>FIGHT</Button2>
                        </section>
                    )}
                </div>
                <div className='bg-zinc-900 shadow p-2 m-2 rounded relative col-span-3'>
                    <h4 className='text-center text-lg p-2'>Info</h4>
                    <hr />
                    <article className='p-4'>
                        {messages.map((msg, idx) => (
                            <div className='animate__animated animate__fadeIn' key={idx}>
                                {msg}
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
