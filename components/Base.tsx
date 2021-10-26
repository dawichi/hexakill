import React, { useState } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar'

const Base = () => {

	const [life, setLife] = useState(100)

	const getDamage = (damage: number) => {
		if (damage > life) return
		setLife(life - damage)
	}
	const getHealth = (health: number) => {
		if (health + life > 100) return
		setLife(life + health)
	}

	const colorHP = (hp: number) => {
		if (hp < 10) return 'danger'
		if (hp >= 10 && hp < 31) return 'warning'
		return 'success'
	}

	return (
		<div className="backgroundPlaying h-screen">
			<div className="bg-gray-800 h-100 opacity-90">
				<div className="container h-100">
					<div className="row p-2 md:p-5 h-100">
						<div className="col-3 h-100">
							<div className="border-black rounded bg-black h-100">
								<div>
									<h2 className="text-white text-center font-bold tracking-wider text-2xl p-3">Stats</h2>
									<hr style={{backgroundColor: 'white', width: '80%', margin: 'auto'}}/>
									<ul className="text-white p-5">
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
								<div className="p-5 text-white">
									<p>HP: {life}%</p>
									<ProgressBar striped animated variant={colorHP(life)} key={1} now={life} />
								</div>
								<button className="border p-3 m-4 bg-white" onClick={() => getDamage(5)}>DAMAGE</button>
								<button className="border p-3 m-4 bg-white" onClick={() => getHealth(5)}>CURASION</button>
							</div>
						</div>
						<div className="col-3 h-100">
							<div className="border-black rounded bg-black h-100">
								<div>
									<h2 className="text-white text-center font-bold tracking-wider text-2xl p-3">Items</h2>
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
