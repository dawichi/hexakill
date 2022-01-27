import React from 'react'

const ActionButton = ({ title, onclick }) => {
    const colors = {
        attack: 'bg-red-600',
        skillshot: 'bg-lime-600',
        ultimate: 'bg-cyan-600',
        defend: 'bg-yellow-600',
    }
    return (
        <div className='flex p-10 justify-center items-center'>
            <button
                className={'h-16 w-48 rounded text-white text-xl transform motion-safe:hover:scale-110 ' + colors[title]}
                onClick={onclick}
            >
                {title}
            </button>
        </div>
    )
}

export default ActionButton
