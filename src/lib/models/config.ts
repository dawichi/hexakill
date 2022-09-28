const baseStats: {
    base: {
        health: number
        ad: number
        ap: number
        armor: number
        mr: number
        speed: number
    }
    names: string[]
} = {
    base: {
        // multiples of 4
        // so u can multiply by: 0.75, 1.25, 1.75, ...
        health: 200,
        ad: 16,
        ap: 20,
        armor: 12,
        mr: 12,
        speed: 4,
    },
    names: ['Pablo', 'Miguel', 'Paco', 'Jose Luis', 'Berto', 'Juan', 'Rodolfo', 'Rigoberto', 'Ricardo', 'Manolo', 'Pepe', ''],
}

export default baseStats
