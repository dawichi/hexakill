import { GameContext } from "hooks/gameContext"
import { useContext } from "react"
import Image from "next/image"


const PlayerView = ({ player }) => {
	

    return (
        <div className='bg-red-200/50'>
			<div className="relative h-32 w-32">
				<Image src={player.image} alt={player.name} layout="fill"/>
			</div>
			
        </div>
    )
}

export default PlayerView
