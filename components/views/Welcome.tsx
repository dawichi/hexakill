import { useState } from 'react'
import { Samurai, Warrior, Wizard } from 'characters'
import useFormInput from 'hooks/useFormInput'
import Image from 'next/image'
import { Button2 } from 'components'

export default function Welcome({ setPlayer }) {
    // Search params
    const user = useFormInput('')
    const [askPlayer, setAskPlayer] = useState(false)
    const [playerCharacter, setPlayerCharacter] = useState(0)

    // ------------------------------------------------------
    //    CHARACTER SELECTION
    // ------------------------------------------------------
    // Characters available
    const characters_available = [Wizard, Samurai, Warrior]

    const handleSetPlayerData = () => {
		const player = new characters_available[playerCharacter - 1](4, user.inputProp.value)
		setPlayer(player)
    }

    return (
        <div className='bg-zinc-900 h-screen pt-20 pb-10 relative'>
            <h1 className='absolute top-0 left-0 text-3xl p-5 text-center text-white w-full'>Hexakill !</h1>
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
                                <h3 className='text-xl mt-10'>Great! Now select your class.</h3>
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
                                                <Image
                                                    src={`/images/${character.image_path}/idle.gif`}
                                                    alt={character.name}
                                                    layout='fill'
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {playerCharacter != 0 && (
                                    <Button2 className={`m-auto mt-10 ${characters[playerCharacter-1].button}`} onClick={handleSetPlayerData}>
                                        START GAME!
                                    </Button2>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div>
                        <h1 className='text-2xl py-10'>Welcome to the hexakill game!</h1>
                        <h2 className='text-green-400 text-xl py-5'>HOW TO PLAY :</h2>
                        <p className='py-5'>
                            Farm to <span className='text-cyan-400'>level up</span> your character and improve its stats 💪🏻.
                        </p>
                        <p className='py-5'>
                            You will fight different enemies with its strengths and weaknesses.
                            <br />
                            Use the best strategy to reach the final boss and win hexakill!
                        </p>
                        <p className='py-5'>
                            In hexakill, there are 2 types of damage:
                            <br />- <span className='text-red-400'>Attacks (AD)</span> : <span className='text-red-400'>10%</span> critic
                            chance but <span className='text-red-400'>10%</span> missing chance.
                            <br />- <span className='text-blue-400'>Magic (AP)</span> : <span className='text-blue-400'>40%</span> critic
                            chance but <span className='text-blue-400'>30%</span> missing chance.
                        </p>
                        <p>It&apos;s up to you which one to prioritize! Remember that some enemies are stronger vs a specific type of damage!</p>
                        <p>
                            <span className='text-amber-400'>Armor</span> and <span className='text-fuchsia-400'>Magic Resist (MR)</span>{' '}
                            reduces by a flat amount the damage recieved.
                        </p>

                        <br />
                        <br />
                        <br />

						<Button2 onClick={() => setAskPlayer(true)}>
							START
						</Button2>
                    </div>
                )}
            </section>
        </div>
    )
}

const characters = [
    {
        name: 'Wizard',
        image_path: 'wizard',
        bg: 'bg-indigo-700/50',
        desc: 'Destroy with explosions',
        subdesc: 'weak vs AD',
        size: 'w-24 h-36',
        shadow: 'shadow-lg shadow-indigo-400',
		button: 'from-indigo-500 to-indigo-900 hover:from-indigo-700 hover:to-indigo-900'
    },
    {
        name: 'Samurai',
        image_path: 'samurai',
        bg: 'bg-red-700/50',
        desc: 'The power of pure AD',
        subdesc: 'weak vs AP',
        size: 'h-36',
        shadow: 'shadow-lg shadow-red-400',
		button: 'from-red-500 to-red-900 hover:from-red-700 hover:to-red-900'
    },
    {
        name: 'Warrior',
        image_path: 'warrior',
        bg: 'bg-amber-700/50',
        desc: 'One-shots are not for him',
        subdesc: 'low damage',
        size: 'w-36 h-36',
        shadow: 'shadow-lg shadow-amber-400',
		button: 'from-amber-500 to-amber-900 hover:from-amber-700 hover:to-amber-900'
    },
]
