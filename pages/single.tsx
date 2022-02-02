import { useState } from 'react'
import { DisplayInfo, StatsTable, MusicToggle, Welcome } from 'components'
import { Barbarian, Character, Eagle, Enemy, Knight, Slime } from 'entities'

export default function Single() {
    const [playing, setPlaying] = useState(false)

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
                <MusicToggle />
            </nav>

            {playing ? (
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
            ) : (
                <section className='container mx-auto text-center'>
					<hr/>
					<h1 className='text-2xl py-10'>Welcome to the hexakill game!</h1>
					<h2 className='text-green-400 text-xl py-5'>HOW TO PLAY :</h2>
					<p className='py-5'>Farm to <span className='text-cyan-400'>level up</span> your character and improve his stats 💪🏻</p>
					<p className='py-5'>
						You will fight different enemies with strengths and weaknesses.<br/>
						Play the correct damage and build to reach the final boss and win hexakill!
					</p>
					<p className='py-5'>
						In hexakill, there are 2 types of damage:<br/>
						- <span className='text-red-400'>Attacks (AD)</span> : <span className='text-red-400'>10%</span> critic chance. <span className='text-red-400'>10%</span> missing chance.<br/>
						- <span className='text-blue-400'>Magic (AP)</span> : <span className='text-blue-400'>40%</span> critic chance. <span className='text-blue-400'>30%</span> missing chance.
					</p>
					<p>It&apos;s on you which one priorize! Remember that some enemies are stronger vs a specific type of damage!</p>
					<p><span className='text-amber-400'>Armor</span> and <span className='text-fuchsia-400'>Magic Resist (MR)</span> reduces by a flat amount the damage recieved.</p>

					<br/>
					<br/>
					<br/>

					<button
						className='font-bold text-xl p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-2 hover:from-purple-700 hover:to-indigo-700'
						onClick={() => setPlaying(true)}
					>
						START GAME
					</button>
				</section>
            )}
        </div>
    )
}
