// Base props for each entity
export const base = {
    // multiples of 4, so u can multiply by: 0.75, 1.25, 1.75, ...
    health: 200,
    ad: 16,
    ap: 20,
    armor: 12,
    mr: 12,
    speed: 4,
} as const

export const info = {
    ad_critic_chance: 0.9, // 10% top -> critic
    ad_misses_chance: 0.1, // 10% low -> misses
    ad_hit_range: [0.8, 1.4], // 80% - 140% ad
    ap_critic_chance: 0.6, // 40% top -> critic
    ap_misses_chance: 0.25, // 25% low -> misses
    ap_hit_range: [0.3, 2], // 30% - 200% ap
    heal_range: [0.2, 0.3], // 20% - 30% of damage received
} as const

export const names = ['Pablo', 'Miguel', 'Paco', 'Jose', 'Berto', 'Juan', 'Ricardo', 'Manolo', 'Pepe', '']
