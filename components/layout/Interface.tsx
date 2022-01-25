const Interface = () => {
    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: YOUR DATA */}
            <div className='bg-red-200'>player stats</div>
            {/* CENTER: MOVES */}
            <div className='bg-yellow-100'>Attack</div>
            {/* RIGHT: OPTIONS */}
            <div className='bg-blue-100'>Options</div>
        </div>
    )
}

export default Interface
