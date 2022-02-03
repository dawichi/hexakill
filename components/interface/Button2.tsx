import React, { MouseEventHandler } from 'react'

interface ButtonProps {
	onClick: MouseEventHandler<HTMLButtonElement>,
	className?: string,
	children: string,
} 
const Button2 = ({onClick, className, children}: ButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={`font-bold tracking-wider text-xl p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 mb-2 hover:from-purple-800 hover:to-indigo-800 ${className}`}
        >
            {children}
        </button>
    )
}

export default Button2
