import {DisplayStats} from "components"
import { useState } from "react"
import ActionButton from "components/interface/ActionButton"

const Interface = ({ player }) => {
    const [resetHTML, setResetHTML] = useState(false)

    const UpLevel = () => (
        <button
            className='bg-zinc-800 text-white rounded-xl'
            onClick={() => {
                player.upLevel()
                setResetHTML(!resetHTML)
            }}
        >
            <i className='bi bi-arrow-up'></i> UP LEVEL
        </button>
    )

    const DealDmg = () => (
        <button
            className='bg-zinc-800 text-white rounded-xl'
            onClick={() => {
                player.getDamage(100)
                setResetHTML(!resetHTML)
            }}
        >
            <i className='bi bi-emoji-angry'></i> MAKE 100 DMG
        </button>
    )

    return (
        <div className='grid grid-cols-3'>
            {/* LEFT: YOUR DATA */}
            <div>
                <DisplayStats player={player} />
                <div className='m-5 p-4 grid grid-cols-3 gap-4 bg-yellow-200/75'>
                    <UpLevel />
                    <DealDmg />
                </div>
            </div>
            {/* CENTER: MOVES */}
            <div className='bg-yellow-100 justify-center items-center'>
				<div className='flex flex-col-2'>
					<div className='grid grid-cols-2'>
						<ActionButton title='attack' onclick={player.attack}/>
						<ActionButton title='skillshot'  onclick={player.skillshot}/>
						<ActionButton title='ultimate'  onclick={ player.ultimate}/>
						<ActionButton title='defend'  onclick={player.defend}/>
						<div className="col-span-2 flex p-6 justify-center items-center ">
							<button className='h-16 w-48 rounded text-white text-xl bg-zinc-800 transform motion-safe:hover:scale-110'> 
								Quit
							</button>
						</div>
					</div>
				</div>
			</div>
            {/* RIGHT: OPTIONS */}
            <div className='bg-blue-100'>Options</div>
        </div>
    )
}

export default Interface
