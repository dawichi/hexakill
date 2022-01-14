import { useEffect, useState } from 'react'
import GameView from './GameView'
import Interface from './Interface'
import useSound from 'use-sound'

const Layout = () => {

	const [play, { stop }] = useSound(
		'/music/background.mp3',
		{ volume: 0.5 }
	)

	const [musicPlaying, setMusicPlaying] = useState(false)

	useEffect(() => {
		musicPlaying
		? play()
		: stop()
	}, [musicPlaying, play, stop])


	return (
		<div className='bg-zinc-900 h-screen py-20 relative'>
			<h1 className='absolute top-0 left-0 text-white text-3xl p-5 text-center w-full'>Hexakill !</h1>
			<div className='absolute top-0 right-10 text-white text-2xl'>
				<button className='relative m-3 p-2 rounded bg-zinc-700 hover:bg-orange-500' onClick={() => setMusicPlaying(!musicPlaying)}>
					<i className="bi bi-music-note-beamed"></i>
					{ musicPlaying && (
						<span>
							<span className="h-3 w-3 absolute top-[-5px] left-[-5px] h-full w-full rounded-full bg-orange-400 animate-ping"></span>
							<span className="h-3 w-3 absolute top-[-5px] left-[-5px] h-full w-full rounded-full bg-orange-400"></span>
						</span>
					)}
				</button>
			</div>
			<div className='container m-auto h-full bg-zinc-700 grid grid-rows-2'>
				<GameView/>

				<Interface/>
			</div>
		</div>
	)
}

export default Layout