export function save(gameState) {
    localStorage.setItem('gameState', JSON.stringify(gameState))
}

export function load() {
    const savedGame = JSON.parse(localStorage.getItem('gameState'))
    return savedGame ? savedGame : undefined
}
