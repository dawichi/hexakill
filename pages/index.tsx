import { useContext, useState } from 'react'
import { DisplayInfo, DisplayStats, PlayerView, MusicToggle, Welcome, OptionMenu, ActionButton, ActionMenu } from 'components'
import { GameContext } from 'hooks/gameContext'
import Alex from 'characters/Alex/Alex'
import Bruno from 'characters/Bruno/Bruno'

export default function Index() {

	const [resetHTML, setResetHTML] = useState(false)

    // Consume context
    const { context, setContext } = useContext(GameContext)

    // Currently displaying messages for the player
    const [alerting, setAlerting] = useState(false)

    if (!context) {
        return <Welcome />
    }

    // TODO: if (loading) return <Loader />

    // <Base gameState={context} setGameState={setContext}/>

    const player_1 = new Alex('David Lvl')
    const player_2 = new Bruno('Bruno Lvl')

    return (
        <div className='bg-zinc-900 h-screen py-20 relative'>
            <h1 className='absolute top-0 left-0 text-white text-3xl p-5 text-center w-full'>Hexakill !</h1>
            <div className='absolute top-0 right-10 text-white text-2xl'>
                <MusicToggle />
            </div>

            <div className='relative container m-auto h-full bg-zinc-700 grid grid-rows-2'>
                <div className='grid grid-cols-3'>
                    <DisplayStats player={player_2} />
                    <PlayerView player={player_2} />
                    <OptionMenu />
                </div>
                <div className='grid grid-cols-3'>
                    <DisplayStats player={player_1} />
                    <PlayerView player={player_1} />
                    <ActionMenu player={player_1} />
                </div>

                {alerting && (
                    <div className='absolute top-0 left-0 h-full w-full'>
                        <div className='flex justify-center items-end h-1/2'>
                            <DisplayInfo title='A weno' text='Info super  super importante' />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
