import useFormInput from 'hooks/useFormInput'
import Image from 'next/image'
import { useState } from 'react'

export default function Welcome({ setPlaying }) {
    // Search params
    const user = useFormInput('')
    const [askPlayer, setAskPlayer] = useState(false)

    const [playerCharacter, setPlayerCharacter] = useState(0)

	const handleInitGame = () => {
		setPlaying(true)
	}

    return (
		<section className='container mx-auto text-center'>
            <hr />
            {askPlayer ? (
				<div className='pt-10'>
                    <h2 className='text-xl mb-2'>Enter your name:</h2>
                    <input
                        className='bg-zinc-700 p-2 w-64 h-12 rounded shadow outline-0 focus:ring-2 ring-indigo-400'
                        type='text'
                        {...user.inputProp}
                        placeholder='Player name'
						/>

                    {user.inputProp.value.length > 2 && (
                        <>
                            <h3 className='text-xl mt-10'>Great! Now select your class</h3>
                            <div className='container mx-auto max-w-3xl grid grid-cols-3'>
                                {characters.map((character, idx) => (
                                    <div
                                        key={idx}
                                        className={`${character.bg} m-2 p-4 cursor-pointer rounded-lg ${
                                            idx + 1 === playerCharacter ? character.shadow : ''
                                        }`}
                                        onClick={() => setPlayerCharacter(idx + 1)}
										>
                                        <h4 className='text-xl'>{character.name}</h4>
                                        <hr className='my-2' />
                                        <p>{character.desc}</p>
                                        <p>({character.subdesc})</p>
                                        <div className={`relative m-auto mt-2 ${character.size}`}>
                                            <Image src={`/images/${character.image_path}/idle.gif`} alt={character.name} layout='fill' />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {playerCharacter ? (
                                <button
								className='m-auto mt-10 font-bold text-xl p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-2 hover:from-purple-700 hover:to-indigo-700'
									onClick={handleInitGame}
									>
                                    START GAME!
                                </button>
                            ) : (
                                ''
								)}
                        </>
                    )}
                </div>
            ) : (
                <div>
                    <h1 className='text-2xl py-10'>Welcome to the hexakill game!</h1>
                    <h2 className='text-green-400 text-xl py-5'>HOW TO PLAY :</h2>
                    <p className='py-5'>
                        Farm to <span className='text-cyan-400'>level up</span> your character and improve his stats 💪🏻
                    </p>
                    <p className='py-5'>
                        You will fight different enemies with strengths and weaknesses.
                        <br />
                        Play the correct damage and build to reach the final boss and win hexakill!
                    </p>
                    <p className='py-5'>
                        In hexakill, there are 2 types of damage:
                        <br />- <span className='text-red-400'>Attacks (AD)</span> : <span className='text-red-400'>10%</span> critic
                        chance. <span className='text-red-400'>10%</span> missing chance.
                        <br />- <span className='text-blue-400'>Magic (AP)</span> : <span className='text-blue-400'>40%</span> critic
                        chance. <span className='text-blue-400'>30%</span> missing chance.
                    </p>
                    <p>It&apos;s on you which one priorize! Remember that some enemies are stronger vs a specific type of damage!</p>
                    <p>
                        <span className='text-amber-400'>Armor</span> and <span className='text-fuchsia-400'>Magic Resist (MR)</span>{' '}
                        reduces by a flat amount the damage recieved.
                    </p>

                    <br />
                    <br />
                    <br />

                    <button
                        className='font-bold text-xl p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-2 hover:from-purple-700 hover:to-indigo-700'
                        onClick={() => setAskPlayer(true)}
						>
                        START
                    </button>
                </div>
            )}
        </section>
    )
}


const characters = [
	{
		name: 'Wizard',
		image_path: 'wizard',
		bg: 'bg-indigo-700/50',
		desc: 'destroy with explosions',
		subdesc: 'weak vs AD',
		size: 'w-24 h-36',
		shadow: 'shadow-lg shadow-indigo-400',
	},
	{
		name: 'Samurai',
		image_path: 'samurai',
		bg: 'bg-red-700/50',
		desc: 'the power of pure AD',
		subdesc: 'weak vs AP',
		size: 'h-36',
		shadow: 'shadow-lg shadow-red-400',
	},
	{
		name: 'Warrior',
		image_path: 'warrior',
		bg: 'bg-amber-700/50',
		desc: 'Oneshots are not for him',
		subdesc: 'low damage',
		size: 'w-36 h-36',
		shadow: 'shadow-lg shadow-amber-400',
	},
]
