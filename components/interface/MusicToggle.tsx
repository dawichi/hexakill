import { useEffect, useState } from 'react'
import useSound from 'use-sound'

const MusicToggle = () => {
    const [play, { stop }] = useSound('/music/background.mp3', {
        volume: 0.1,
    })

    const [musicPlaying, setMusicPlaying] = useState(false)

    useEffect(() => {
        musicPlaying ? play() : stop()
    }, [musicPlaying, play, stop])

    return (
        <button className='relative m-3 p-2 rounded bg-zinc-700 hover:bg-orange-500' onClick={() => setMusicPlaying(!musicPlaying)}>
            <i className='bi bi-music-note-beamed'></i>
            {musicPlaying && (
                <span>
                    <span className='h-3 w-3 absolute top-[-5px] left-[-5px] rounded-full bg-orange-400 animate-ping'></span>
                    <span className='h-3 w-3 absolute top-[-5px] left-[-5px] rounded-full bg-orange-400'></span>
                </span>
            )}
        </button>
    )
}

export default MusicToggle
