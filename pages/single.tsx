import { ReactElement, useEffect, useState } from 'react'
import { StatsTable, MusicToggle, Welcome, Button2 } from 'components'
import { Adventurer, Archer, ArmoredHuntress, BringerOfDeath, Character, Enemy, EvilTree, EvilWizard, FireWorm, Knight, Martial, Slime, WildHuntress, WitchBlue } from 'entities'
import { textBlue, textCyan, textGreen, textRed } from 'utils/colorText'

export default function Single() {
    // ╔══════════════════════════════════════════════════════
    // ║ UseStates! All the variables of the game
    // ╚══════════════════════════════════════════════════════
    // Color theme (it depends of the character selected)
    const [colorTheme, setColorTheme] = useState('')
    // Enemy and Player, the protagonists
    const [enemy, setEnemy] = useState<Enemy>()
    const [player, setPlayer] = useState<Character>()
    // Is there any combat currently active?
    const [fighting, setFighting] = useState(false)
    // Is the player turn? Or the enemy turn.
    const [playerAction, setPlayerAction] = useState(0)
    // Side function to force child components to refresh
    const [resetHtml, setResetHtml] = useState(false)

    // ╔══════════════════════════════════════════════════════
    // ║ ✍🏻 Logger: stores the info-messages of the game
    // ╚══════════════════════════════════════════════════════
    const [messages, setMessages] = useState<Array<ReactElement>>([])
    const [messagesPlayer, setMessagesPlayer] = useState<Array<ReactElement>>([])
    const [messagesEnemy, setMessagesEnemy] = useState<Array<ReactElement>>([])
    const logMsg = (text: JSX.Element) => {
        if (messages.length < 4) {
            setMessages([...messages, text])
        } else {
            const msgs = messages.filter((x, i) => i != 0)
            setMessages([...msgs, text])
        }
    }
    const logMsgPlayer = (text: JSX.Element) => {
        if (messagesPlayer.length < 4) {
            setMessagesPlayer([...messagesPlayer, text])
        } else {
            const msgs = messagesPlayer.filter((x, i) => i != 0)
            setMessagesPlayer([...msgs, text])
        }
    }
    const logMsgEnemy = (text: JSX.Element) => {
        if (messagesEnemy.length < 4) {
            setMessagesEnemy([...messagesEnemy, text])
        } else {
            const msgs = messagesEnemy.filter((x, i) => i != 0)
            setMessagesEnemy([...msgs, text])
        }
    }

    // ╔══════════════════════════════════════════════════════
    // ║ Enemy trigger: executes every time the enemy changes
    // ╚══════════════════════════════════════════════════════
    useEffect(() => {
        if (!enemy) return
        const text = player.speed > enemy.speed ? textGreen(player.name) : textRed(enemy.name)
        logMsg(
            <p>
                {textRed(enemy.name)} lv {textRed(enemy.level)} has appeared!
                <br />
                <span className='mt-2'>{text} attacks first!</span>
            </p>,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enemy])

    // ╔══════════════════════════════════════════════════════
    // ║ Turn trigger: executes every time the turn changes
    // ╚══════════════════════════════════════════════════════
    useEffect(() => {
        if (!enemy || !playerAction) return
        player.speed >= enemy.speed ? entityAction(player, enemy) : entityAction(enemy, player)
        setTimeout(() => {
            player.speed < enemy.speed ? entityAction(player, enemy) : entityAction(enemy, player)
        }, 1500)
        setPlayerAction(0)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerAction])

    // ╔══════════════════════════════════════════════════════
    // ║ Initialize a combat with a new enemie
    // ╚══════════════════════════════════════════════════════
    const initFight = () => {
        setEnemy(enemyGenerator(player.level))
        setFighting(true)
    }

    // ╔══════════════════════════════════════════════════════
    // ║ Entity action: executes the action
    // ╚══════════════════════════════════════════════════════
    const entityAction = (entity: Character | Enemy, rival: Character | Enemy) => {
        const is_a_player = entity['exp'] != undefined
        const colored_entity_name = is_a_player ? textGreen(entity.name) : textRed(entity.name)

        const choice = is_a_player ? playerAction - 1 : enemyChoiceActionGenerator(player)
        const action_text = choice === 0 ? 'attack! 🔪' : 'magic! ☄'

        let damage: number
        let dmgRecieved: number

        const log = is_a_player ? logMsgPlayer : logMsgEnemy

        switch (choice) {
            case 0:
                damage = entity.attack()
                dmgRecieved = rival.recieveAttack(damage)
                break
            case 1:
                damage = entity.magic()
                dmgRecieved = rival.recieveMagic(damage)
                break
            default:
                const healed = entity.heal()
                log(
                    <p className='mt-2'>
                        {colored_entity_name} healed +{textCyan(healed)}! 🍷
                    </p>,
                )
                break
        }
        if (choice != 2) {
            log(
                <p>
                    {colored_entity_name} used {action_text}! <br />
                    {colored_entity_name} did {choice ? textBlue(dmgRecieved) : textRed(dmgRecieved)} damage!
                </p>,
            )
        }
        if (rival.dmgRecieved === rival.health) {
            is_a_player ? enemyDefeat() : playerDefeat()
            // setPlayerTurn(null)
        }
    }

    // ╔══════════════════════════════════════════════════════
    // ║ ❌ PLAYER DEFEATED
    // ╚══════════════════════════════════════════════════════
    const playerDefeat = () => {
        setFighting(false)
        logMsgPlayer(
            <p>
                I&apos;m sorry {textBlue(player.name)}, you have been defeated 😔 <br />
                Better luck the next time!
            </p>,
        )
        setTimeout(() => {
            setPlayer(null)
            setEnemy(null)
            setMessages([])
        }, 3000)
    }

    // ╔══════════════════════════════════════════════════════
    // ║ ✅ ENEMY DEFEATED
    // ╚══════════════════════════════════════════════════════
    const enemyDefeat = () => {
        setFighting(false)
        const exp = parseInt(((enemy.level / player.level) * 100).toFixed(0))
        const leveledUp = player.gainExp(exp)
        logMsgEnemy(
            <p>
                {textRed(enemy.name)} lv {textRed(enemy.level)} has been defeated! 🎉🎉
                <br />
                Well done, you recieved <span className='text-cyan-400'>{exp}</span> exp! 💪🏻
                <br />
                {leveledUp ? <span>You level up! Lv: {textCyan(player.level)}</span> : ''}
            </p>,
        )
        // TODO: powerups?
        setTimeout(() => setEnemy(null), 2000)
    }

    // ╔══════════════════════════════════════════════════════
    // ║ 💻 Game view
    // ╚══════════════════════════════════════════════════════

    // If player is not defined, go to welcome to create one!
    if (!player) return <Welcome setPlayer={setPlayer} setColorTheme={setColorTheme} />

    return (
        <div className='animate__animated animate__fadeIn bg-zinc-900 h-screen pt-20 pb-10 relative'>
            <h1 className='absolute top-0 left-0 text-3xl p-5 text-center text-white w-full'>Hexakill !</h1>
            <nav className='absolute top-0 right-10 text-white'>
                <MusicToggle color={colorTheme} />
            </nav>

            <section className='bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1'>
                <div className='grid grid-cols-3'>
                    <div className='bg-zinc-900 shadow p-2 m-2 rounded flex justify-center items-center'>
                        {fighting && playerAction === 0 && (
                            <div>
                                <h4 className='text-center text-lg p-2'>What do you want to do?</h4>
                                <hr />
                                <div className='flex gap-4 justify-center items-center p-4'>
                                    <Button2 onClick={() => setPlayerAction(1)} style={'red'}>
                                        Attack
                                    </Button2>
                                    <Button2 onClick={() => setPlayerAction(2)} style={'blue'}>
                                        Magic
                                    </Button2>
                                    <Button2 onClick={() => setPlayerAction(3)} style={'green'}>
                                        Heal
                                    </Button2>
                                </div>
                            </div>
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
                    <article className='p-4 h-4/5 overflow-y-hidden grid grid-cols-3 gap-4'>
                        <div>
                            {messagesPlayer.map((msg, idx) => (
                                <div className='animate__animated animate__fadeIn mt-2' key={idx}>
                                    <div className={idx + 1 === messagesPlayer.length ? '' : 'opacity-25'}>{msg}</div>
                                </div>
                            ))}
                        </div>
                        <div>
                            {messages.map((msg, idx) => (
                                <div className='animate__animated animate__fadeIn mt-2' key={idx}>
                                    <div className={idx + 1 === messages.length ? '' : 'opacity-25'}>{msg}</div>
                                </div>
                            ))}
                        </div>
                        <div>
                            {messagesEnemy.map((msg, idx) => (
                                <div className='animate__animated animate__fadeIn mt-2' key={idx}>
                                    <div className={idx + 1 === messagesEnemy.length ? '' : 'opacity-25'}>{msg}</div>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </section>
        </div>
    )
}

const enemyGenerator = (level: number) => {
    // range of levels
    const min_enemy_level = Math.floor(level / 2)
    const max_enemy_level = level * 1.75
    const enemy_level = parseInt((Math.floor(Math.random() * (max_enemy_level - min_enemy_level + 1)) + min_enemy_level).toFixed(0))

    // create the enemy
    // const enemies_pool = [Adventurer, EvilTree, FireWorm, Knight, Martial, Slime, Archer, ArmoredHuntress, BringerOfDeath, EvilWizard, WildHuntress, WitchBlue]
    const enemies_pool = [WitchBlue]
    const enemy_pick = enemies_pool[Math.floor(Math.random() * enemies_pool.length)]
    return new enemy_pick(enemy_level)
}

const enemyChoiceActionGenerator = (enemy: Enemy) => {
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
