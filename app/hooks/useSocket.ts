import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

export function useSocket(mesaId: string | undefined) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!mesaId) return

    const socket = io(SOCKET_URL, { autoConnect: true })
    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('mesa:join', mesaId)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    return () => {
      socket.emit('mesa:leave', mesaId)
      socket.disconnect()
      socketRef.current = null
    }
  }, [mesaId])

  return { socket: socketRef.current, isConnected }
}
