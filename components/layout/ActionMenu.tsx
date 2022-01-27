import { ActionButton } from 'components'

const ActionMenu = ({ player }) => {
    return (
        <div className='bg-yellow-100 justify-center items-center'>
            <div className='flex flex-col-2'>
                <div className='grid grid-cols-2'>
                    <ActionButton title='attack' onclick={player.attack} />
                    <ActionButton title='defend' onclick={player.defend} />
                    <ActionButton title='skillshot' onclick={player.skillshot} />
                    <ActionButton title='ultimate' onclick={player.ultimate} />
                </div>
            </div>
        </div>
    )
}

export default ActionMenu
