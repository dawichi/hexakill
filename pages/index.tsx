import React, { useEffect } from 'react'
import { load, save } from '../lib/localstorage'

const Index = () => {

	const state = {
		hp: 12
	}

	const start = () => {
		save({
			hp: 15
		})
		const prueba = load()
		console.log(prueba)
	}

	const sprite = (sprite_index) => {
		const sprites = {
			0: 'grass',
			1: 'sea1',
			2: 'sea2',
			5: 'border_top',
			6: 'border_right',
		}
		return sprites[sprite_index] 
	}

	const l0 = [0,0,0,0,0,0,0,0,0,0,6,1,1,1,2,1] 
	const l1 = [0,0,0,0,0,0,0,0,0,0,0,5,1,2,1,2] 
	const l2 = [0,0,0,0,0,0,0,0,0,0,0,0,5,1,2,1] 
	const l3 = [0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,1] 
	const l4 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5] 
	const l5 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
	const l6 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
	const l7 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
	const l8 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
	const l9 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] 
	const world = [l0, l1, l2, l3, l4, l5, l6, l7, l8, l9]

	return (
		<div>
			{ world.map((line, l_index) => {
				return (
					line.map((x, x_index) => {
						const type = sprite(x)
						console.log(line.length, x_index)
						return (
							<div
								key={l_index + "_" + x_index} 
								className={"sprite " + type}
								style={{clear: x_index==0 ? 'both' : 'none'}}
							></div>
						)
					}) 
				)
			})}
			

			<br/>
			<button onClick={start}>START</button>
		</div>
	)
}

export default Index
