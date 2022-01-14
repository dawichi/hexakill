/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { GameContext } from '../hooks/gameContext'

const Welcome = () => {
    const { context, setContext } = useContext(GameContext)
	
	const [showOptions, setShowOptions] = useState(false)
    const [firstRender, setFirstRender] = useState(true)
	
	// TODO: useEffect, get context from localStorage

	const coming = ' animate__animated animate__fadeIn animate__fast'
    const leaving = ' animate__animated animate__fadeOut animate__fast '
    const animation = firstRender ? 'opacity-0' : showOptions ? coming : leaving

	const title_class = 'text-white text-xl p-3 rounded-xl bg-gradient-to-br'

	const handleCreateGame = (new_game: boolean) => {
		setContext({
			name: 'David',
			type: 'coffee',
			dmg: 60,
			armor: 20,
			level: 1,
			exp: 0,
		})
	}

    return (
        <div className='bg-gray-800 h-screen flex flex-col justify-center items-center'>
			<img className='block w-20 mb-5' src='https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg' alt='Hexastats' />
			<button
				onClick={() => {
					setFirstRender(false)
					setShowOptions(!showOptions)
				}}
				className='text-white font-bold tracking-wider text-xl p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-2 hover:from-purple-800 hover:to-indigo-800'
			>
				Welcome to Hexakill!
			</button>
			<div className={`${title_class} ${animation} from-blue-500 to-violet-800 w-72 flex flex-col justify-center items-start`}>
				<button onClick={() => handleCreateGame(true)} className='p-2 hover:font-bold'>
					<i className='bi bi-arrow-right'></i> New game
				</button>
				<button onClick={() => handleCreateGame(false)} className='p-2 hover:font-bold'>
					<i className='bi bi-arrow-right'></i> Continue 
				</button>
			</div>
        </div>
    )
}

export default Welcome
