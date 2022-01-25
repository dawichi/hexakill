import React from 'react'

// TODO: why the types in context, <type> doesn't work ._.
export const GameContext = React.createContext({
    context: {},
    setContext: (context: any) => context,
})
