import { createContext, useContext, type ReactNode } from 'react'
import { useSocket } from '~/hooks/useSocket'
import type { Socket } from 'socket.io-client'

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({
  mesaId,
  children,
}: {
  mesaId: string | undefined
  children: ReactNode
}) {
  const { socket, isConnected } = useSocket(mesaId)

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  return useContext(SocketContext)
}
