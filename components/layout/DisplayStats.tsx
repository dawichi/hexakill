import { useState } from 'react'

const DisplayStats = ({ player }) => {

	const [resetHTML, setResetHTML] = useState(false)
	const [levelUpSkill, setLevelUpSkill] = useState(true)

	const handleLevelUpSkill = (skill) => {
		player.upSkill(skill)
		setResetHTML(!resetHTML)
	}

    const stats = [
        {
            title: 'Attack Damage',
            keyword: 'attack_damage',
            color: 'text-red-600',
            icon: 'sword',
        },
        {
            title: 'Ability Power',
            keyword: 'ability_power',
            color: 'text-blue-700',
            icon: 'fire-symbol',
        },
        {
            title: 'Armor',
            keyword: 'armor',
            color: 'text-amber-900',
            icon: 'shield',
        },
        {
            title: 'Magic Resist',
            keyword: 'magic_resist',
            color: 'text-purple-600',
            icon: 'round-shield',
        },
        {
            title: 'Movement Speed',
            keyword: 'movement_speed',
            color: 'text-cyan-400',
            icon: 'player-dodge',
        },
        {
            title: 'Critical Hit',
            keyword: 'critical_hit',
            color: 'text-yellow-600',
            icon: 'player-thunder-struck',
        },
        {
            title: 'Luck',
            keyword: 'luck',
            color: 'text-lime-400',
            icon: 'clover',
        },
    ]

	const health_width = ((player.health.value - player.dmgRecieved) / player.health.value) * 100

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
	
	const SkillLevel = ({level}) => (
		<span>
			<i className={`bi bi-star${level > 0 ? '-fill' : ''}`}></i>
			<i className={`bi bi-star${level > 1 ? '-fill' : ''}`}></i>
			<i className={`bi bi-star${level > 2 ? '-fill' : ''}`}></i>
		</span>
	)

    return (
        <div>
            <h2>
                {player.name} {player.level}
            </h2>
			<div className='grid grid-cols-2 bg-zinc-600 m-5 text-xl'>
				{stats.map((stat, idx) => (
					<p title={stat.title} key={idx} className='rounded py-1 px-3 text-white'>
						{ levelUpSkill && (
							<button className="m-3" onClick={()=> handleLevelUpSkill(stat.keyword)}>
								<i className="bi bi-arrow-up-circle"></i>
							</button>
						)}
						<i className={`ra ra-${stat.icon} ${stat.color}`}></i> {player[stat.keyword].value}
						{' '}
						<SkillLevel level={player[stat.keyword].level}/>
					</p>
				))}
			</div>
            <div className='m-5 p-4 grid grid-cols-3 gap-4 bg-yellow-200/75'>
                <UpLevel />
                <DealDmg damage={20} />
				<DealDmg damage={-20} />
            </div>
			<div className='p-5 bg-zinc-600'>
                <div className='bg-zinc-700 rounded'>
                    <div className={`${colorHpBar(health_width)} rounded`} style={{ width: `${health_width}%` }}>
                        {player.health.value - player.dmgRecieved}/{player.health.value}
                        <i className='ra ra-hearts text-red-600'></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DisplayStats
