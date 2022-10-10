import type { BaseEntity } from '$lib/models'
import utils from './utils.service'

/**
 * Utils for tooltips
 */
export const tooltips = {
    /**
     * ## Get the tooltip for a given stat
     */
    getStatTooltip: (stat: string, entity: BaseEntity): Array<string> => {
        const { ad_critic_chance, ad_misses_chance, ad_hit_range, ap_critic_chance, ap_misses_chance, ap_hit_range, heal_range } = entity.data
        return (
            {
                ad: [
                    `${Math.ceil((1 - ad_critic_chance) * 100)}% chance to do a critical hit`,
                    `${ad_misses_chance * 100}% chance to miss`,
                    `Hit range: ${ad_hit_range[0] * 100}% - ${ad_hit_range[1] * 100}% of AD`,
                ],
                ap: [
                    `${(1 - ap_critic_chance) * 100}% chance to do a critical hit`,
                    `${ap_misses_chance * 100}% chance to miss`,
                    `Hit range: ${ap_hit_range[0] * 100}% - ${ap_hit_range[1] * 100}% of AP`,
                ],
                armor: [`${utils.calcDmgReductionPercent(entity.armor)}% attacks damage reduction`],
                mr: [`${utils.calcDmgReductionPercent(entity.mr)}% magics damage reduction`],
                potions: [`Heal range: ${heal_range[0] * 100}% - ${heal_range[1] * 100}% of damage received`],
            }[stat] ?? []
        )
    },
}

export default tooltips
