import Image from 'next/image'

const StatsTable = ({ entity }) => {
    const icons = {
        ad: 'sword',
        ap: 'fire-symbol',
        armor: 'shield',
        mr: 'round-shield',
        speed: 'player-dodge',
    }

    const health_width = ((entity.health - entity.dmgRecieved) / entity.health) * 100

    const colorHpBar = (hp_width: number) => {
        if (hp_width < 11) return 'bg-red-600'
        if (hp_width > 10 && hp_width < 31) return 'bg-yellow-600'
        return 'bg-green-600'
    }

    return (
        <section className='bg-zinc-900 shadow p-2 m-2 rounded relative'>
			<div className='h-full flex flex-col items-center justify-between'>
				<h2 className='text-xl'>
					{entity.name} - lv {entity.level}
				</h2>
				<div className='relative h-32 w-32'>
					<Image src={`/images/${entity.image}/idle.gif`} alt={'a'} layout='fill' />
				</div>
				<div className='w-full flex flex-col items-center mb-5'>
					<p className='flex justify-center items-center'>
						{entity.health - entity.dmgRecieved} / {entity.health}{' '}
						<i className='ra ra-hearts text-red-600'></i>
					</p>
					<div className='bg-zinc-600/75 rounded-xl w-4/5 '>
						<div className={`${colorHpBar(health_width)} rounded-xl h-3`} style={{ width: `${health_width}%` }}></div>
					</div>
				</div>
			</div>
            <div className='absolute top-0 left-0 m-5 rounded '>
                {Object.keys(icons).map((stat, idx) => (
                    <p key={idx} className='rounded py-1 px-3'>
                        <i className={'ra ra-' + icons[stat]}></i> {entity[stat]}
                    </p>
                ))}
            </div>
        </section>
    )
}

export default StatsTable
