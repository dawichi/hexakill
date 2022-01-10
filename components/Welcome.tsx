/* eslint-disable @next/next/no-img-element */
import React from 'react'

const Welcome = ({ setFirstRender, setMenuVisibility, menuVisibility, title_class, animation, start }) => {
    return (
        <div className='bg-gray-800 h-screen'>
            <div className='h-100 flex justify-center align-items-center flex-col'>
                <img className='block w-20 mb-5' src='https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg' alt='Hexastats' />
                <button
                    onClick={() => {
                        setFirstRender(false)
                        setMenuVisibility(!menuVisibility)
                    }}
                    className={title_class + ' cursor-pointer from-purple-500 to-indigo-500 mb-2 hover:from-purple-800 hover:to-indigo-800'}
                >
                    Welcome to Hexakill!
                </button>
                <ul className={title_class + animation + ' from-blue-500 to-violet-800'}>
                    <li onClick={() => start(false)} className='cursor-pointer p-2'>
                        <i className='bi bi-arrow-right'></i> New game
                    </li>
                    <li onClick={() => start(true)} className='cursor-pointer p-2'>
                        <i className='bi bi-arrow-right'></i> Continue saved game
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Welcome
