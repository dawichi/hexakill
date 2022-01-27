const StatsTable = ({ player }) => {
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

    return (
        <div className='grid grid-cols-2 bg-zinc-600 m-5 w-1/2 text-xl'>
            {stats.map((stat, idx) => (
                <p title={stat.title} key={idx} className='rounded py-1 px-3 text-white'>
                    <i className={`ra ra-${stat.icon} ${stat.color}`}></i> {player[stat.keyword]}
                </p>
            ))}
        </div>
    )
}

export default StatsTable
