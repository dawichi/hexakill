import { useState } from 'react'
import { DisplayInfo, StatsTable, Toggles } from 'components'
import { Barbarian, Character, Eagle, Enemy, Knight, Slime } from 'entities'

export default function Single() {

    // Currently displaying messages for the player
    const [alerting, setAlerting] = useState(false)

	const enemies_pool = [Eagle, Knight, Slime]
	
	const player = new Barbarian(7, 'David')
	const enemy = new Knight(13)

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
                <Toggles />
            </nav>

            <section className='bg-orange-50 dark:bg-zinc-800 relative container mx-auto h-full grid grid-rows-2 grid-cols-1'>
				<div className='grid grid-cols-3'>
					<StatsTable entity={player}/>
					<StatsTable entity={enemy}/>
       				<div className='bg-white dark:bg-zinc-900 shadow p-2 m-2 rounded relative'>
						   <h4 className='text-center text-lg p-2'>Info</h4>
						   <hr/>
						   <article className='p-4'>
							<p>fdjsafjkhasdjkfa jsdhfjka sdfkjasd jfajsdfkjasdh fj</p>
							<p>fdjsafjkhkjasd jfajasdjkfa jsdhfjka sdfsdfkjas</p>
							<p>fdjsafjkhsdfkjasd jfajsdfasdjkfa jsdhfjka kjasdhsdfsdf sas</p>
						   </article>

					</div>
				</div>
				<div className='bg-white dark:bg-zinc-900 shadow p-2 m-2 rounded relative col-span-3'>
					fdlasklflksdlkjmfk
				</div>

                {alerting && (
                    <div className='absolute top-0 left-0 h-full w-full'>
                        <div className='flex justify-center items-end h-1/2'>
                            <DisplayInfo title='A weno' text='Info super  super importante' />
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}


