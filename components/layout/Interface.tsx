import {DisplayStats} from "components"

const Interface = ({player}) => {
    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: YOUR DATA */}
                <DisplayStats player={player}/>
            {/* CENTER: MOVES */}
            <div className='bg-yellow-100'>Attack</div>
            {/* RIGHT: OPTIONS */}
            <div className='bg-blue-100'>Options</div>
        </div>
    )
}

export default Interface
