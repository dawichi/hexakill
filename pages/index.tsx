import React, { useContext, useEffect, useState } from 'react'
import { Base, Layout, Welcome } from 'components'
import { GameContext } from 'hooks/gameContext'

export default function Index() {
    const { context, setContext } = useContext(GameContext)

	if (!context) {
        return <Welcome />
    }


    // TODO: if (loading) return <Loader />


    return (
        <div>
            {/* <Base gameState={context} setGameState={setContext}/> */}
			<Layout/>
        </div>
    )
}