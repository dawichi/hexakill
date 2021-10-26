/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar'

const Base = () => {

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

	const colorHP = (hp: number) => {
		if (hp < 10) return 'danger'
		if (hp >= 10 && hp < 31) return 'warning'
		return 'success'
	}

	const [animation, setAnimation] = useState(0)

	const animations = {
		0: 'idle.gif',
		1: 'attack.gif',
		2: 'die.gif',
	}

	const attack = () => {
		setAnimation(1)
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
										<li>HP: 1000</li>
										<li>HP: 1000</li>
										<li>HP: 1000</li>
										<li>HP: 1000</li>
										<li>HP: 1000</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="col-6 h-100">
							<div className="border-black rounded bg-black h-100">
								<div className="row">
									<div className="col-6">
										<img src={'/images/slime/' + animations[animation]} className="w-32 m-auto" alt="slime"/>
										<div className="mt-2 p-4">
											<p>HP: {life}%</p>
											<ProgressBar striped animated variant={colorHP(life)} key={1} now={life} />
										</div>
									</div>
									<div className="col-6 flex justify-content items-end flex-col">
									</div>
								</div>
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
