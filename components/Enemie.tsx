/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import ProgressBar from 'react-bootstrap/ProgressBar'
import enemies from '../lib/enemies'

const Enemie = ({life, animation}) => {

	const colorHpBar = (hp: number) => {
		if (hp < 10) return 'danger'
		if (hp >= 10 && hp < 31) return 'warning'
		return 'success'
	}

	const animations = {
		0: 'idle.gif',
		1: 'attack.gif',
		2: 'die.gif',
	}

	const picked_enemy = Math.floor((Math.random() * enemies.length))

	const enemy = {
		name: enemies[picked_enemy].name,
		path: enemies[picked_enemy].path,
		type: enemies[picked_enemy].type,
		hp: enemies[picked_enemy].hp,
		dmg: enemies[picked_enemy].dmg,
		armor: enemies[picked_enemy].armor,
		exp: enemies[picked_enemy].exp,
	}
	
	const pool = () => {
		let total = 0
		enemies.map(x => {
			total += x.rarity
		})
		console.log(total)
	}
	pool()

	return (
		<div className="row">
			<div className="col-6">
				<h2 className="text-center">{enemy.name}</h2>
				<img src={'/images/' + enemy.path + '/' + animations[animation]} className="w-32 m-auto" alt="slime"/>
				<div className="mt-2 p-4"> 
					<p>HP: {enemy.hp}</p>
					<ProgressBar striped animated variant={colorHpBar(life)} key={1} now={life} label={`${life}%`} />
				</div>
			</div>
			<div className="col-6">
				<ul className="border rounded p-3">
					<li><i className="bi bi-journals"></i> Class: {enemy.type}</li>
					<li><i className="bi bi-vector-pen"></i> Dmg: <span className="text-red-600 font-bold">{enemy.dmg}</span></li>
					<li><i className="bi bi-shield-shaded"></i> Armor: <span className="text-blue-600 font-bold">{enemy.armor}</span></li>
					<li><i className="bi bi-gift-fill"></i> Reward: <span className="text-green-600 font-bold">{enemy.exp} exp</span></li>
				</ul>
			</div>
		</div>
	)
}

export default Enemie
