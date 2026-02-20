import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

io.on('connection', (socket) => {
  console.log(`[socket] connected: ${socket.id}`)

  // Join/leave mesa rooms
  socket.on('mesa:join', (mesaId: string) => {
    socket.join(mesaId)
    console.log(`[socket] ${socket.id} joined mesa ${mesaId}`)
  })

  socket.on('mesa:leave', (mesaId: string) => {
    socket.leave(mesaId)
    console.log(`[socket] ${socket.id} left mesa ${mesaId}`)
  })

  // DM -> Players: combat started
  socket.on('combat:start', (payload) => {
    socket.to(payload.mesaId).emit('combat:start', payload)
  })

  // DM -> Players: combat ended
  socket.on('combat:end', (payload) => {
    socket.to(payload.mesaId).emit('combat:end', payload)
  })

  // DM -> Players: request initiative rolls
  socket.on('initiative:request', (payload) => {
    socket.to(payload.mesaId).emit('initiative:request', payload)
  })

  // Player -> DM: initiative roll result
  socket.on('initiative:roll', (payload) => {
    socket.to(payload.mesaId).emit('initiative:roll', payload)
  })

  // DM -> Players: turn changed
  socket.on('turn:change', (payload) => {
    socket.to(payload.mesaId).emit('turn:change', payload)
  })

  // Player -> DM: turn ended
  socket.on('turn:end', (payload) => {
    socket.to(payload.mesaId).emit('turn:end', payload)
  })

  // Player -> DM: request current combat state (for late joiners)
  socket.on('combat:sync:request', (payload) => {
    socket.to(payload.mesaId).emit('combat:sync:request', payload)
  })

  // DM -> Player: conditions applied to a character
  socket.on('character:conditions:update', (payload) => {
    socket.to(payload.mesaId).emit('character:conditions:update', payload)
  })

  // Player -> DM: available actions changed
  socket.on('character:action:update', (payload) => {
    socket.to(payload.mesaId).emit('character:action:update', payload)
  })

  // DM -> Player: initiative value updated manually
  socket.on('character:initiative:update', (payload) => {
    socket.to(payload.mesaId).emit('character:initiative:update', payload)
  })

  // Generic character update relay
  socket.on('character:update', (payload) => {
    socket.to(payload.mesaId).emit('character:update', payload)
  })

  socket.on('disconnect', () => {
    console.log(`[socket] disconnected: ${socket.id}`)
  })
})

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`[socket] Socket.io server running on port ${PORT}`)
})
