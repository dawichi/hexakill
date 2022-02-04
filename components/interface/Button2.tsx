import React, { MouseEventHandler } from 'react'

interface ButtonProps {
    onClick: MouseEventHandler<HTMLButtonElement>
    style?: string
    className?: string
    children: string
}
const Button2 = ({ onClick, style, className, children }: ButtonProps) => {
    const styles = {
        indigo: 'from-indigo-500 to-indigo-900 hover:from-indigo-700 hover:to-indigo-900',
        red: 'from-red-500 to-red-900 hover:from-red-700 hover:to-red-900',
        amber: 'from-amber-500 to-amber-900 hover:from-amber-700 hover:to-amber-900',
    }

    return (
        <button
            onClick={onClick}
            className={`font-bold tracking-wider text-xl p-3 mb-2 rounded-xl bg-gradient-to-br ${
                style ? styles[style] : styles.indigo
            } ${className}`}
        >
            {children}
        </button>
    )
}

export default Button2