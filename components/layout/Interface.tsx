import { DisplayStats } from 'components'
import { useState } from 'react'

const Interface = ({ player }) => {
    const [resetHTML, setResetHTML] = useState(false)

    const UpLevel = () => (
        <button
            className='bg-zinc-800 text-white rounded-xl'
            onClick={() => {
                player.upLevel()
                setResetHTML(!resetHTML)
            }}
        >
            <i className='bi bi-arrow-up'></i> UP LEVEL
        </button>
    )

    const DealDmg = () => (
        <button
            className='bg-zinc-800 text-white rounded-xl'
            onClick={() => {
                player.getDamage(100)
                setResetHTML(!resetHTML)
            }}
        >
            <i className='bi bi-emoji-angry'></i> MAKE 100 DMG
        </button>
    )

    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: YOUR DATA */}
            <div>
                <DisplayStats player={player} />
                <div className='m-5 p-4 grid grid-cols-3 gap-4 bg-yellow-200/75'>
                    <UpLevel />
                    <DealDmg />
                </div>
            </div>
            {/* CENTER: MOVES */}
            <div className='bg-yellow-100'>Attack</div>
            {/* RIGHT: OPTIONS */}
            <div className='bg-blue-100'>Options</div>
        </div>
    )
}

export default Interface
