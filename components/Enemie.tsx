/* eslint-disable @next/next/no-img-element */
import React from 'react'
import enemies from '../lib/enemies'

const Enemie = ({life, animation, enemy_index}) => {

	const colorHpBar = (hp: number) => {
		if (hp < 11) return 'danger'
		if (hp > 10 && hp < 31) return 'warning'
		return 'success'
	}

	const animations = {
		0: 'idle.gif',
		1: 'attack.gif',
		2: 'die.gif',
	}

	const enemy = {
		name: enemies[enemy_index].name,
		path: enemies[enemy_index].path,
		type: enemies[enemy_index].type,
		hp: enemies[enemy_index].hp,
		dmg: enemies[enemy_index].dmg,
		armor: enemies[enemy_index].armor,
		exp: enemies[enemy_index].exp,
	}
	
	const pool = () => {
		let total = 0
		enemies.map(x => {
			total += x.rarity
		})
		console.log(total)
	}
	pool()
	
	const type = (type: string) => {
		const types = {
			'water': 'bg-blue-600',
			'plant': 'bg-green-600',
			'fire': 'bg-red-600',
			'iron': 'bg-gray-600',
			'magic': 'bg-purple-600',
			'ground': 'bg-brown-600',
			'ice': 'bg-white-600',
			'dragon': 'bg-indigo-700',
		}
		return <span className={"rounded py-1 px-2 " + types[type] + " capitalize"}>{type}</span>
	}


	return (
		<div className="row">
			<div className="col-6">
				<h2 className="text-center">{enemy.name}</h2>
				<img src={'/images/' + enemy.path + '/' + animations[animation]} className="w-32 m-auto" alt="slime"/>
				<div className="mt-2 p-4"> 
					<p>HP: {enemy.hp}</p>
					{/* <ProgressBar striped animated variant={colorHpBar(life)} key={1} now={life} label={`${life}%`} /> */}
				</div>
			</div>
			<div className="col-6">
				<ul className="border rounded p-3 inline-block">
					<li><i className="bi bi-journals"></i> {type(enemy.type)}</li>
					<li><i className="bi bi-vector-pen"></i> <span className="text-red-600 font-bold">{enemy.dmg}</span></li>
					<li><i className="bi bi-shield-shaded"></i> <span className="text-blue-600 font-bold">{enemy.armor}</span></li>
					<li><i className="bi bi-gift-fill"></i> <span className="text-green-600 font-bold">{enemy.exp} exp</span></li>
				</ul>
			</div>
		</div>
	)
}

export default Enemie
