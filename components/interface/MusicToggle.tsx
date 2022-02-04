import { useEffect, useState } from 'react'
import useSound from 'use-sound'

const MusicToggle = ({ color }) => {
    const [play, { stop }] = useSound('/music/background.mp3', {
        volume: 0.1,
    })

    const [musicPlaying, setMusicPlaying] = useState(false)

    useEffect(() => {
        musicPlaying ? play() : stop()
    }, [musicPlaying, play, stop])

	const tailwind_bgs = 'bg-indigo-600 bg-red-600 bg-amber-600'

    const styles = {
        indigo: 'from-indigo-500 to-indigo-900 hover:from-indigo-700 hover:to-indigo-900',
        red: 'from-red-500 to-red-900 hover:from-red-700 hover:to-red-900',
        amber: 'from-amber-500 to-amber-900 hover:from-amber-700 hover:to-amber-900',
    }

    return (
        <button
            className={`relative m-3 p-2 rounded bg-gradient-to-br ${styles[color]} text-2xl`}
            onClick={() => setMusicPlaying(!musicPlaying)}
        >
            <i className='bi bi-music-note-beamed'></i>
            {musicPlaying && (
                <span>
                    <span className={`h-3 w-3 absolute top-[-5px] left-[-5px] rounded-full bg-${color}-600 animate-ping`}></span>
                    <span className={`h-3 w-3 absolute top-[-5px] left-[-5px] rounded-full bg-${color}-600`}></span>
                </span>
            )}
        </button>
    )
}

export default MusicToggle
