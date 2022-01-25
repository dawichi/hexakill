const Interface = () => {
    return (
        <div className='grid grid-cols-2'>
            {/* LEFT COLUMN: DATA */}
            <div className='bg-red-200'>player stats</div>
            {/* RIGHT COLUMN: ACTIONS */}
            <div className='bg-yellow-100 gap-4 grid grid-cols-2 p-4'>
                <div className='bg-blue-100'>Attack</div>
                <div className='bg-blue-100'>Options</div>
            </div>
        </div>
    )
}

export default Interface

const actions = [
    {
        title: 'Attack',
        defend: 'Defend',
    },
]
