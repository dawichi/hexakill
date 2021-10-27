interface gameState {
	hp: number
}

export function save(gameState: gameState) {
	localStorage.setItem("gameState", JSON.stringify(gameState))
}

export function load() {
	const savedGame = JSON.parse(localStorage.getItem("gameState"))
	return savedGame ? savedGame : undefined
}