import type { BaseEntityModel } from '$lib/models'
import { info } from '$lib/models/config'
import utils from './utils.service'

/**
 * Utils for tooltips
 */
export const tooltips = {
    /**
     * ## Get the tooltip for a given stat
     */
    getStatTooltip: (stat: string, entity: BaseEntityModel): Array<string> => {
        const { ad_critic_chance, ad_misses_chance, ad_hit_range, ap_critic_chance, ap_misses_chance, ap_hit_range, heal_range } = info
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
                speed: ['Decides the order of the turns'],
                potions: [`Heal range: ${heal_range[0] * 100}% - ${heal_range[1] * 100}% of damage received`],
                gold: ['When you defeat an enemy, you get its gold', 'Can be used to buy potions and items'],
            }[stat] ?? []
        )
    },
}

export default tooltips
