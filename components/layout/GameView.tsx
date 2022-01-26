import { useState } from 'react'

const GameView = ({ player }) => {
    const health_width = ((player.health - player.dmgRecieved) / player.health) * 100
    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: ENEMY DATA */}
            <div className='bg-green-200/50'>enemy stats</div>
            {/* CENTER: YOU */}
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
            {/* RIGHT: ENEMIE */}
            <div className='bg-blue-200/50'>
                <span>EL OTRO WEY</span>
            </div>
        </div>
    )
}

export default GameView
