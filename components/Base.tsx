import React, { useState } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar'

const Base = () => {

	const [health, setHealth] = useState(11)

	const getDamage = (damage: number) => {
		setHealth(health - damage)
	}

	const colorHP = (hp: number) => {
		if (hp < 10) return 'danger'
		if (hp >= 10 && hp < 21) return 'warning'
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
										<li>HP: 1204123</li>
										<li>HP: 1204123</li>
										<li>HP: 1204123</li>
										<li>HP: 1204123</li>
										<li>HP: 1204123</li>
									</ul>
								</div>
							</div>
						</div>
						<div className="col-6 h-100">
							<div className="border-black rounded bg-black h-100">
								<div className="p-5">
									<ProgressBar striped animated variant={colorHP(health)} key={1} now={health} />
								</div>
								<button className="border p-3 m-4 bg-white" onClick={() => setHealth(health - 5)}>DAMAGE</button>
								<button className="border p-3 m-4 bg-white" onClick={() => setHealth(health + 5)}>CURASIOON</button>
							</div>
						</div>
						<div className="col-3 h-100">
							<div className="border-black rounded bg-black h-100">
								<div>
									<h2 className="text-white text-center font-bold tracking-wider text-2xl p-3">Items</h2>
									<hr style={{backgroundColor: 'white', width: '80%', margin: 'auto'}}/>
									<div className="progress">
										<div className="progress-bar" role="progressbar" style={{width: '25%'}} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
									</div>
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
