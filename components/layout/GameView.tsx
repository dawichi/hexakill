import { useState } from "react"

const GameView = ({ player }) => {

	const [resetHTML, setResetHTML] = useState(false)

	const UpLevel = () => (
		<button
			className="bg-zinc-800 text-white rounded-xl"
			onClick={() => {
				player.upLevel()
				setResetHTML(!resetHTML)
			}}
		><i className="bi bi-arrow-up"></i> UP LEVEL</button>
	)

	const DealDmg = () => (
		<button
			className="bg-zinc-800 text-white rounded-xl"
			onClick={() => {
				player.getDamage(100)
				setResetHTML(!resetHTML)
			}}
		><i className="bi bi-emoji-angry"></i> MAKE 100 DMG</button>
	)

    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: ENEMY DATA */}
            <div className='bg-green-200/50'>enemy stats</div>
            {/* CENTER: YOU */}
            <div className='bg-red-200/50'>
				<div className="m-5 p-4 rounded bg-red-100/50">
					<h1 className="text-xl">PLAYER: {player.name}</h1>
					<h1 className="text-xl">LV: {player.level}</h1>
					<hr/>
					<div className="grid grid-cols-3 gap-4">
						<p className="bg-green-200">{player.health - player.dmgRecieved}/{player.health} {'<3'}</p>
						<p className="bg-cyan-200">{player.ability_power} &nbsp; &nbsp; AP</p>
						<p className="bg-red-200">{player.attack_damage} &nbsp; &nbsp; AD</p>
						<p className="bg-orange-200">{player.critical_hit} &nbsp; &nbsp; crit % </p>
						<p className="bg-violet-200">{player.magic_resist} &nbsp; &nbsp; MR</p>
						<p className="bg-amber-200">{player.armor} &nbsp; &nbsp; armor</p>
						<p className="bg-blue-200">{player.movement_speed} &nbsp; &nbsp; speed</p>
						<p className="bg-green-200">{player.luck} &nbsp; &nbsp; luck</p>
					</div>
				</div>
				<div className="m-5 p-4 grid grid-cols-3 gap-4 bg-yellow-200/75">
					<UpLevel/>
					<DealDmg/>
				</div>
			</div>
            {/* RIGHT: ENEMIE */}
            <div className='bg-blue-200/50'>
				<span>EL OTRO WEY</span>
			</div>
        </div>
    )
}

export default GameView