import React from 'react'

const DisplayInfo = ({title, text}) => {
	return (
		<div className='flex justify-center items-center'>
			<div className='bg-blue-100 w-96 auto border border-zinc-800 p-6 rounded shadow' role='alert'>
				<strong className='font-bold'>{title}</strong>
				<p>{text}</p>
			</div>
		</div>
	)
}

export default DisplayInfo
