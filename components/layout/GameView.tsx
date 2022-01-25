const GameView = () => {
    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: ENEMY DATA */}
            <div className='bg-green-200/50'>enemy stats</div>
            {/* CENTER: YOU */}
            <div className='bg-red-200/50'>TU</div>
            {/* RIGHT: ENEMIE */}
            <div className='bg-blue-200/50'>EL OTRO WEY</div>
        </div>
    )
}

export default GameView
