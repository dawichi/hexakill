import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Switch } from '@headlessui/react'
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
        <button className='relative m-3 p-2 rounded bg-zinc-700 hover:bg-orange-500 text-2xl' onClick={() => setMusicPlaying(!musicPlaying)}>
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

// Toggle to switch between dark and light mode
const DarkModeToggle = ({ darkMode, setDarkMode }) => {
    return (
        <Switch
            checked={darkMode}
            onChange={setDarkMode}
            className={
                'relative inline-flex flex-shrink-0 h-[34px] w-[58px] border-2 dark:border-zinc-600 border-orange-100 rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 bg-orange-50 dark:bg-zinc-900'
            }
        >
            <span className='sr-only'>Use setting</span>
            <span
                aria-hidden='true'
                className={`${
                    darkMode ? 'translate-x-6 bg-zinc-700' : 'translate-x-0 bg-orange-200'
                } pointer-events-none inline-block h-[30px] w-[30px]
				rounded-full shadow-lg transform ring-0 transition ease-in-out duration-200 flex justify-center items-center`}
            >
                {darkMode ? <i className='bi bi-moon-fill text-white'></i> : <i className='bi bi-sun-fill text-black'></i>}
            </span>
        </Switch>
    )
}


export default function Toggles() {
    const [darkMode, setDarkMode] = useState(false)
    const theme = darkMode ? 'dark' : 'light'

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            setDarkMode(true)
        }
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setDarkMode(true)
        }
    }, [])

    useEffect(() => {
        document.body.dataset.theme = theme
        if (darkMode) {
            localStorage.setItem('theme', 'dark')
            document.documentElement.classList.add('dark')
        } else {
            localStorage.setItem('theme', 'light')
            document.documentElement.classList.remove('dark')
        }
    }, [darkMode, theme])

    return (
       <div className='flex items-center'>
        	<DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
			<MusicToggle/>
	   </div>
    )
}


