const DisplayStats = ({ player }) => {
   const stats=[
       {
           title:'Ability Power',
           keyword:'ability_power',
           color:'bg-blue-600',
           icon:'magic'
       },
       {
        title:'Attack Damage',
        keyword:'attack_damage',
        color:'bg-red-600',
        icon:'sword'
    },
    {
        title:'Critical Hit',
        keyword:'critical_hit',
        color:'bg-yellow-600',
        icon:'bullseye'
    },
    {
        title:'Magic Resist',
        keyword:'magic_resist',
        color:'bg-purple-600',
        icon:'round-shield'
    },
    {
        title:'Armor',
        keyword:'armor',
        color:'bg-amber-900',
        icon:'shield'
    },
    {
        title:'Movement Speed',
        keyword:'movement_speed',
        color:'bg-cyan-400',
        icon:'wind'
    },
    {
        title:'Luck',
        keyword:'luck',
        color:'bg-lime-400',
        icon:'flower2'
    },

   ]

    return (
        <div>
            <p>
                <span title='Health points' className='rounded px-1 text-white bg-green-600'>
                    <i className='bi bi-heart-fill'></i>
                    {player.health}
                </span>
            </p>

            {
                stats.map((stat, idx) => (
                    <p title={stat.title} key={idx} className={'rounded px-1 text-white ' + stat.color} >
                        <i className={'ra ra-' + stat.icon}></i> {player[stat.keyword]}
                    </p>
                ))
            }

        </div>
    )
}

export default DisplayStats
