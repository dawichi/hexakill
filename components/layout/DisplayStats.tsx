const DisplayStats = ({ player }) => {
    return (
        <div>
            <p>health: {player.health}</p>
            <p>ability_power: {player.ability_power}</p>
            <p>attack_damage: {player.attack_damage}</p>
            <p>critical_hit: {player.critical_hit}</p>
            <p>magic_resist: {player.magic_resist}</p>
            <p>armor: {player.armor}</p>
            <p>movement_speed: {player.movement_speed}</p>
            <p>luck: {player.luck}</p>
        </div>
    )
}

export default DisplayStats
