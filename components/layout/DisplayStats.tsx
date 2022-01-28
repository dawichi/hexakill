import { useState } from 'react'
import { StatsTable } from 'components'

const DisplayStats = ({ player }) => {

	const [resetHTML, setResetHTML] = useState(false)

	const health_width = ((player.health - player.dmgRecieved) / player.health) * 100

	const colorHpBar = (hp_width: number) => {
        if (hp_width < 11) return 'bg-red-600'
        if (hp_width > 10 && hp_width < 31) return 'bg-yellow-600'
        return 'bg-green-600'
    }

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

    const DealDmg = ({damage}) => (
        <button
            className='bg-zinc-800 text-white rounded-xl'
            onClick={() => {
                player.getDamage(damage)
                setResetHTML(!resetHTML)
            }}
        >
            <i className='bi bi-emoji-angry'></i> MAKE {damage} DMG
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
                <DealDmg damage={20} />
				<DealDmg damage={-20} />
            </div>
			<div className='p-5 bg-zinc-600'>
                <div className='bg-zinc-700 rounded'>
                    <div className={`${colorHpBar(health_width)} rounded`} style={{ width: `${health_width}%` }}>
                        {player.health - player.dmgRecieved}/{player.health}
                        <i className='ra ra-hearts text-red-600'></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisplayStats
