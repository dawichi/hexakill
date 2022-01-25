const GameView = ({ player }) => {
    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: ENEMY DATA */}
            <div className='bg-green-200/50'>enemy stats</div>
            {/* CENTER: YOU */}
            <div className='bg-red-200/50'>
				<p>health: {player.health}</p>
				<p>ability_power: {player.ability_power}</p>
				<p>attack_damage: {player.attack_damage}</p>
				<p>critical_hit: {player.critical_hit}</p>
				<p>magic_resist: {player.magic_resist}</p>
				<p>armor: {player.armor}</p>
				<p>movement_speed: {player.movement_speed}</p>
				<p>luck: {player.luck}</p>
			</div>
            {/* RIGHT: ENEMIE */}
            <div className='bg-blue-200/50'>EL OTRO WEY</div>
        </div>
    )
}

export default GameView
