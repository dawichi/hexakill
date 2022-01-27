import { useState } from 'react'
import { StatsTable } from 'components'

const DisplayStats = ({ player }) => {
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
        <div>
            <h2>
                {player.name} {player.level}
            </h2>
            <StatsTable player={player} />
            <div className='m-5 p-4 grid grid-cols-3 gap-4 bg-yellow-200/75'>
                <UpLevel />
                <DealDmg />
            </div>
        </div>
    )
}

export default DisplayStats
