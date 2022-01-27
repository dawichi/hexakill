import { useState } from 'react'
import { StatsTable } from 'components'

const PlayerView = ({ player }) => {
    const health_width = ((player.health - player.dmgRecieved) / player.health) * 100
    return (
        <div className='bg-red-200/50'>
            <div className='p-5 bg-zinc-600'>
                <div className='bg-zinc-700'>
                    <div className='bg-green-600' style={{ width: `${health_width}%` }}>
                        {player.health - player.dmgRecieved}/{player.health}
                        <i className='ra ra-hearts text-red-600'></i>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlayerView
