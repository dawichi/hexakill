import { ActionButton } from 'components'

const ActionMenu = ({ player }) => {
    return (
        <div className='bg-yellow-100 justify-center items-center'>
            <div className='flex flex-col-2'>
                <div className='grid grid-cols-2'>
                    <ActionButton title='attack' onclick={player.attack} />
                    <ActionButton title='skillshot' onclick={player.skillshot} />
                    <ActionButton title='ultimate' onclick={player.ultimate} />
                    <ActionButton title='defend' onclick={player.defend} />
                    <div className='col-span-2 flex p-6 justify-center items-center '>
                        <button className='h-16 w-48 rounded text-white text-xl bg-zinc-800 transform motion-safe:hover:scale-110'>
                            Quit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActionMenu
