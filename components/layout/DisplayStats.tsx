const DisplayStats = ({ player }) => {
    return (
        <div> 
            
            <p>
                <span className='rounded px-1 text-white bg-green-600'>health: {player.health}
                <i className='px-1 bi bi bi-heart-fill text-red-500'></i>
                </span>
            </p>

            <p>
            <span className='rounded px-1 text-white bg-blue-600'>ability_power: {player.ability_power}</span>
            <i className='px-1 bi bi bi-magic'></i>
                </p>

            <p>
            <span className='rounded px-1 text-white bg-red-600'>attack_damage: {player.attack_damage}</span>
            <i className='px-1 bi bi-hammer'></i>
            </p>

            <p>
            <span className='rounded px-1 text-white bg-yellow-600'>crit_chance: {player.critical_hit}
            <i className='px-1 bi bi bi bi-bullseye'></i>
            </span>
            </p>

            <p>
            <span className='rounded px-1 text-white bg-purple-600'>magic_resist: {player.magic_resist}
            <i className='px-1 bi bi bi-stars'></i>
            </span>
            </p>

            <p>
            <span className='rounded px-1 text-white bg-amber-900'>armor: {player.armor}
            <i className='px-1 bi bi-shield-shaded'></i>
            </span>
            </p>

            <p>
            <span className='rounded px-1 text-white bg-cyan-400'>movement_speed: {player.movement_speed}
            <i className='px-1 bi bi-wind'></i>
            </span>
            </p>

            <p>
            <span className='rounded px-1 text-white bg-lime-400'>luck: {player.luck}</span>
            <i className='px-1 bi bi-flower2'></i>
            </p>
        
        </div>
    )
}

export default DisplayStats
