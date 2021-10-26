/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react'
import Welcome from '../components/Welcome'
import { load, save } from '../lib/localstorage'

export default function Index() {

	const state = {
		hp: 12
	}

	const start = () => {
		console.log("hofsadhf")
	}
	
	const [menuVisibility, setMenuVisibility] = useState(false)
	const [firstRender, setFirstRender] = useState(true)
	const [playing, setPlaying] = useState(false)

	const title_class = ' text-white font-bold tracking-wider font-2xl p-3 rounded-xl bg-gradient-to-br '
	const coming = ' animate__animated animate__fadeIn animate__fast'
	const leaving = ' animate__animated animate__fadeOut animate__fast '

	const animation = firstRender ? 'opacity-0' : menuVisibility ? coming : leaving

	// if (loading) return <Loader />

	return (
		<>
		{ !playing &&
			<Welcome
				setFirstRender={setFirstRender}
				setMenuVisibility={setMenuVisibility}
				menuVisibility={menuVisibility}
				title_class={title_class}
				animation={animation}
				start={start}
			/>
		}
		{ playing &&
			<div className="backgroundPlaying h-screen">
				<div className="bg-gray-800 h-screen opacity-90">
					<button onClick={start}>START</button>
				</div>
			</div>
		}
		</>
	)
}