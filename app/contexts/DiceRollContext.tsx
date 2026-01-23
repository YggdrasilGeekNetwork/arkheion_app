import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

type DiceRoll = {
  id: string
  label: string
  roll: number
  modifier: number
  total: number
  timestamp: number
  diceSides: number
}

type DiceRollContextType = {
  rolls: DiceRoll[]
  addRoll: (label: string, modifier: number, diceSides?: number) => DiceRoll
  clearRolls: () => void
}

const DiceRollContext = createContext<DiceRollContextType | undefined>(undefined)

export const DiceRollProvider = ({ children }: { children: ReactNode }) => {
  const [rolls, setRolls] = useState<DiceRoll[]>([])

  const addRoll = useCallback((label: string, modifier: number, diceSides: number = 20): DiceRoll => {
    const roll = Math.floor(Math.random() * diceSides) + 1
    const total = roll + modifier
    const newRoll: DiceRoll = {
      id: `${Date.now()}-${Math.random()}`,
      label,
      roll,
      modifier,
      total,
      timestamp: Date.now(),
      diceSides,
    }

    setRolls((prev) => [...prev, newRoll])

    // Remove after 5 seconds
    setTimeout(() => {
      setRolls((prev) => prev.filter((r) => r.id !== newRoll.id))
    }, 5000)

    return newRoll
  }, [])

  const clearRolls = useCallback(() => {
    setRolls([])
  }, [])

  return (
    <DiceRollContext.Provider value={{ rolls, addRoll, clearRolls }}>
      {children}
    </DiceRollContext.Provider>
  )
}

export const useDiceRoll = () => {
  const context = useContext(DiceRollContext)
  if (!context) {
    throw new Error('useDiceRoll must be used within DiceRollProvider')
  }
  return context
}
