import React from 'react'
import { load, save } from '../lib/localstorage'

const Index = () => {

	const state = {
		hp: 12
	}

	save(state)

	load()

	return (
		<div>
			holi
		</div>
	)
}

export default Index
