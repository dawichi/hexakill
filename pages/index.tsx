import { Button2 } from 'components'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Index() {
    const [showOptions, setShowOptions] = useState(false)
    const [firstRender, setFirstRender] = useState(true)

    const coming = ' animate__animated animate__fadeIn animate__fast'
    const leaving = ' animate__animated animate__fadeOut animate__fast '
    const animation = firstRender ? 'opacity-0' : showOptions ? coming : leaving

    const title_class = 'text-white text-xl p-3 rounded-xl bg-gradient-to-br'

    const handleInit = () => {
        setFirstRender(false)
        setShowOptions(!showOptions)
    }

    return (
        <div className='bg-gray-800 h-screen flex flex-col justify-center items-center'>
            <div className='h-20 w-20 mb-5 relative'>
                <Image src='/logo.svg' alt='Hexakill' layout='fill' />
            </div>
            <Button2 onClick={handleInit}>Welcome to Hexakill!</Button2>
            <div className={`${title_class} ${animation} from-blue-500 to-violet-800 w-72 flex flex-col justify-center items-start`}>
                <Link href='/single' passHref>
                    <button className='p-2 hover:font-bold'>
                        <i className='bi bi-arrow-right'></i> Singleplayer
                    </button>
                </Link>
                <Link href='/single' passHref>
                    <button className='p-2 hover:font-bold'>
                        <i className='bi bi-arrow-right'></i> Multiplayer
                    </button>
                </Link>
            </div>
        </div>
    )
}
