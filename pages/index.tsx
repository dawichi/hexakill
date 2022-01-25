import { useContext, useState } from 'react'
import { DisplayInfo, GameView, Interface, MusicToggle, Welcome } from 'components'
import { GameContext } from 'hooks/gameContext'


export default function Index() {
    // Consume context
    const { context, setContext } = useContext(GameContext)

    // Currently displaying messages for the player
    const [alerting, setAlerting] = useState(false)

    if (!context) {
        return <Welcome />
    }

    // TODO: if (loading) return <Loader />

    // <Base gameState={context} setGameState={setContext}/>

    return (
        <div className='bg-zinc-900 h-screen py-20 relative'>
            <h1 className='absolute top-0 left-0 text-white text-3xl p-5 text-center w-full'>Hexakill !</h1>
            <div className='absolute top-0 right-10 text-white text-2xl'>
                <MusicToggle />
            </div>

            <div className='relative container m-auto h-full bg-zinc-700 grid grid-rows-2'>
                <GameView />
                <Interface />
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
