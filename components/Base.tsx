import React, { useState } from 'react'
import { gameState } from '../lib/localstorage'
import Enemie from './Enemie'

const Base = ({gameState, setGameState}) => {

	const [life, setLife] = useState(100)

	const getDamage = (damage: number) => {
		if (damage >= life) {
			setLife(0)
			setAnimation(2)
		} else {
			setLife(life - damage)
		}
	}
	const getHealth = (health: number) => {
		setAnimation(0)
		if (health + life > 100) return
		setLife(life + health)
	}

	const [animation, setAnimation] = useState(0)

	const attack = () => {
		setAnimation(1)
	}

	const addExp = (state: gameState, exp: number) => {
		setGameState({
			name: state.name,
			type: state.type,
			dmg: state.dmg,
			armor: state.armor,
			level: state.level,
			exp: state.exp + exp,
		})
	}

	return (
		<div className="backgroundPlaying h-screen text-white">
			<div className="bg-gray-800 h-100 opacity-90">
				<div className="container h-100">
					<div className="row p-2 md:p-5 h-100">
						<div className="col-3 h-100">
							<div className="border-black rounded bg-black h-100">
								<div>
									<h2 className="text-center font-bold tracking-wider text-2xl p-3">Stats</h2>
									<hr style={{backgroundColor: 'white', width: '80%', margin: 'auto'}}/>
									<ul className="p-5">
										<li className="text-center text-xl mb-2">{gameState.name}</li>
										<li><i className="bi bi-journals"></i> {gameState.type}</li>
										<li><i className="bi bi-bar-chart-fill"></i> <span className="text-purple-600 font-bold">{gameState.level}</span></li>
										<li><i className="bi bi-vector-pen"></i> <span className="text-red-600 font-bold">{gameState.dmg}</span></li>
										<li><i className="bi bi-shield-shaded"></i> <span className="text-blue-600 font-bold">{gameState.armor}</span></li>
										<li><i className="bi bi-battery-half"></i> <span className="text-green-600 font-bold">{gameState.exp} / 100 exp</span></li>
									</ul>
									<hr style={{backgroundColor: 'white', width: '80%', margin: 'auto'}}/>
									<button onClick={() => addExp(gameState, 20)} className="m-4 cursor-pointer p-2 text-black bg-white">+20 EXP</button>

								</div>
							</div>
						</div>
						<div className="col-6 h-100">
							<div className="border-black rounded bg-black h-100 p-3">
								<Enemie life={life} animation={animation} enemy_index={0} />
								<div className="inline-block border m-4 p-3">
									<button className="border p-3 m-2 bg-white text-red-600 font-bold" onClick={() => getDamage(5)}>DAMAGE</button>
									<button className="border p-3 m-2 bg-white text-green-600 font-bold" onClick={() => getHealth(5)}>CURASION</button>
									<button className="border p-3 m-2 bg-white text-blue-600 font-bold" onClick={() => attack()}>ATTACK</button>
								</div>
								{/* prueba */}
								<div className="container">
									<div className="row">
										<div className="col-6">
											<div className="cursor-pointer p-3 m-2 rounded bg-red-600 hover:bg-red-700 text-white text-center text-xl font-bold"><i className="bi bi-emoji-angry"></i> FIGHT</div>
										</div>
										<div className="col-6">
											<div className="cursor-pointer p-3 m-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white text-center text-xl font-bold"><i className="bi bi-emoji-angry"></i> ITEMS</div>
										</div>
										<div className="col-6">
											<div className="cursor-pointer p-3 m-2 rounded bg-green-600 hover:bg-green-700 text-white text-center text-xl font-bold"><i className="bi bi-emoji-angry"></i> CHAMPS</div>
										</div>
										<div className="col-6">
											<div className="cursor-pointer p-3 m-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-center text-xl font-bold"><i className="bi bi-emoji-angry"></i> RUN</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="col-3 h-100">
							<div className="border-black rounded bg-black h-100">
								<div>
									<h2 className="text-center font-bold tracking-wider text-2xl p-3">Items</h2>
									<hr style={{backgroundColor: 'white', width: '80%', margin: 'auto'}}/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Base
