import React from 'react'

const Base = () => {
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
							<div className="border-black rounded bg-black h-100"></div>
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
