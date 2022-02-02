import { useContext, useEffect, useState } from 'react'
import { DisplayInfo, StatsTable, MusicToggle, Welcome } from 'components'
import { Eagle, Knight, Samurai, Slime, Warrior, Wizard } from 'entities'

export default function Single() {
	// Character selected. If 0, ask for one in the Welcome screen
	const [playerData, setPlayerData] = useState({
		name: '',
		character: 0,
	})
	if (!playerData.character) return <Welcome setPlayerData={setPlayerData} />

	// Characters available
	const characters_available = [
		Wizard,
		Samurai,
		Warrior,
	]
	
	const player = new characters_available[playerData.character - 1](5, playerData.name)
	
	// ------------------------------------------------------
	//    THE GAME STARTS !
	// ------------------------------------------------------
	const enemies_pool = [Eagle, Knight, Slime]

    const enemy = new Warrior(13, 'Pedro')
	

	player._getDamage(200)
    enemy._getDamage(3236)

    // while (playing) {
    // const min_enemy_level = Math.floor(player.level / 2)
    // const max_enemy_level = player.level * 2
    // const enemy_level = parseInt((Math.floor(Math.random() * (max_enemy_level - min_enemy_level + 1)) + min_enemy_level).toFixed(0))

    // let enemy_pick = enemies_pool[Math.floor(Math.random()*enemies_pool.length)]
    // enemy = new enemy_pick(enemy_level)
    // console.log(`Careful! One lv ${enemy.level} ${enemy.name} has appeared!`)
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
					<div className='bg-zinc-900 shadow p-2 m-2 rounded relative'>
						<h4 className='text-center text-lg p-2'>Info</h4>
						<hr />
						<article className='p-4'>
							<p>fdjsafjkhasdjkfa jsdhfjka sdfkjasd jfajsdfkjasdh fj</p>
							<p>fdjsafjkhkjasd jfajasdjkfa jsdhfjka sdfsdfkjas</p>
							<p>fdjsafjkhsdfkjasd jfajsdfasdjkfa jsdhfjka kjasdhsdfsdf sas</p>
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
