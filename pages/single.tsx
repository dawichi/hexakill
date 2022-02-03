import { ReactElement, useEffect, useState } from 'react'
import { StatsTable, MusicToggle, Welcome, Button2 } from 'components'
import { Adventurer, Enemy, EvilTree, FireWorm, Knight, Martial, Samurai, Slime, Warrior, Wizard } from 'characters'

export default function Single() {
    const [messages, setMessages] = useState<Array<ReactElement>>([])
    const [fighting, setFighting] = useState<boolean>(false)
    const [enemy, setEnemy] = useState<Enemy>()
    const [playerData, setPlayerData] = useState({
        name: '',
        character: 0,
    })

    const textRed = (text: string | number) => <span className='text-red-400'>{text}</span>

	// ------------------------------------------------------
    //    ENEMY MODIFICATION TRIGGER
    // ------------------------------------------------------
	// Each time a new enemy comes
    useEffect(() => {
        if (!enemy) return
		const msg = <p>{textRed(enemy.name)} lv {textRed(enemy.level)} has appeared!<br/><br/></p>
		if (messages.length < 6) {
			setMessages([...messages, msg])
		} else {
			const msgs = messages.filter((x,i) => i != 0)
			setMessages([...msgs, msg])
		}
		setFighting(true)
    }, [enemy])

    // ------------------------------------------------------
    //    CHARACTER SELECTION
    // ------------------------------------------------------
    // Returns the number of character [1-3]
    if (!playerData.character) return <Welcome setPlayerData={setPlayerData} />

    // Characters available
    const characters_available = [Wizard, Samurai, Warrior]
    const player = new characters_available[playerData.character - 1](4, playerData.name)


    // ------------------------------------------------------
    //    THE GAME STARTS !
    // ------------------------------------------------------
    const initFight = () => {
        setEnemy(generateEnemy(player.level))
    }

	const HandleMainDamage = () => {
		player._getDamage(200)
		enemy._getDamage(200)
	}

    return (
        <div className='animate__animated animate__fadeIn bg-zinc-900 h-screen pt-20 pb-10 relative'>
            <h1 className='absolute top-0 left-0 text-3xl p-5 text-center text-white w-full'>Hexakill !</h1>
            <nav className='absolute top-0 right-10 text-white'>
                <MusicToggle />
            </nav>

            <section className='bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1'>
                <div className='grid grid-cols-3'>
                    <StatsTable entity={player} />
                    {enemy != undefined ? (
                        <StatsTable entity={enemy} />
                    ) : (
                        <section className='bg-zinc-900 shadow p-2 m-2 rounded flex justify-center items-center'>
                            <Button2 onClick={initFight}>FIGHT</Button2>
                        </section>
                    )}

                    <div className='bg-zinc-900 shadow p-2 m-2 rounded'>
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
                </div>
                <div className='bg-zinc-900 shadow p-2 m-2 rounded relative col-span-3'>
                    <Button2 onClick={initFight}>FIGHT</Button2>
					<Button2 onClick={HandleMainDamage}>Damage</Button2>
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
