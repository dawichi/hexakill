const GameView = () => {
    return (
        <div className='grid grid-cols-2'>
            {/* LEFT COLUMN: DATA */}
            <div className='bg-green-200/50'>enemy stats</div>
            {/* RIGHT COLUMN: ACTIONS */}
            <div className='bg-blue-200/50'>enemy view</div>
        </div>
    )
}

export default GameView
