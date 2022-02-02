import { useState } from 'react'
import { StatsTable, MusicToggle, Welcome } from 'components'
import { Adventurer, FireWorm, Knight, Martial, Samurai, Slime, Warrior, Wizard } from 'characters'

export default function Single() {
    // Character selected. If 0, ask for one in the Welcome screen
    const [messages, setMessages] = useState<Array<string>>()
    const [playerData, setPlayerData] = useState({
        name: '',
        character: 0,
    })
    if (!playerData.character) return <Welcome setPlayerData={setPlayerData} />

    // Characters available
    const characters_available = [Wizard, Samurai, Warrior]
    const player = new characters_available[playerData.character - 1](5, playerData.name)

    // ------------------------------------------------------
    //    THE GAME STARTS !
    // ------------------------------------------------------

    let playing = true
    const enemy = generateEnemy(player.level)
    player._getDamage(200)
    enemy._getDamage(436)

    console.log(player)

    // while (playing) {
    // 	const min_enemy_level = Math.floor(player.level / 2)
    // 	const max_enemy_level = player.level * 2
    // 	const enemy_level = parseInt((Math.floor(Math.random() * (max_enemy_level - min_enemy_level + 1)) + min_enemy_level).toFixed(0))

    // 	let enemy_pick = enemies_pool[Math.floor(Math.random()*enemies_pool.length)]
    // 	enemy = new enemy_pick(enemy_level)
    // 	console.log(`Careful! One lv ${enemy.level} ${enemy.name} has appeared!`)
    // }

    return (
        <div className='bg-zinc-900 h-screen pt-20 pb-10 relative'>
            <h1 className='absolute top-0 left-0 text-3xl p-5 text-center text-white w-full'>Hexakill !</h1>
            <nav className='absolute top-0 right-10 text-white'>
                <MusicToggle />
            </nav>

            <section className='bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1'>
                <div className='grid grid-cols-3'>
                    <StatsTable entity={player} />
                    <StatsTable entity={enemy} />
                    <div className='bg-zinc-900 shadow p-2 m-2 rounded'>
                        <h4 className='text-center text-lg p-2'>Info</h4>
                        <hr />
                        <article className='p-4'>
                            <p>{}</p>
                        </article>
                    </div>
                </div>
                <div className='bg-zinc-900 shadow p-2 m-2 rounded relative col-span-3'>
                    <p>fasdfasdfasd</p>
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
    const enemies_pool = [Adventurer, FireWorm, Knight, Martial, Slime]
    const enemy_pick = enemies_pool[Math.floor(Math.random() * enemies_pool.length)]
    return new enemy_pick(enemy_level)
}
