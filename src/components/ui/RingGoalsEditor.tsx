import { useState } from 'react'
import { FieldLabel, PrimaryButton, TextField } from '@/components/ui/FieldInput'
import type { RingGoals } from '@/lib/ring-goals'

export default function RingGoalsEditor({
  goals,
  onSave,
  saving
}: {
  goals: RingGoals
  onSave: (g: RingGoals) => void | Promise<void>
  saving?: boolean
}) {
  const [move, setMove] = useState(String(goals.move))
  const [train, setTrain] = useState(String(goals.train))
  const [distance, setDistance] = useState(String(goals.distance))

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div>
        <FieldLabel>Move (kcal)</FieldLabel>
        <TextField type="number" value={move} onChange={(e) => setMove(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Train (min)</FieldLabel>
        <TextField type="number" value={train} onChange={(e) => setTrain(e.target.value)} />
      </div>
      <div>
        <FieldLabel>Distance (km)</FieldLabel>
        <TextField type="number" step="0.1" value={distance} onChange={(e) => setDistance(e.target.value)} />
      </div>
      <div className="sm:col-span-3">
        <PrimaryButton
          loading={saving}
          onClick={() =>
            onSave({
              move: Number(move) || 500,
              train: Number(train) || 30,
              distance: Number(distance) || 5
            })
          }
        >
          Save ring goals
        </PrimaryButton>
      </div>
    </div>
  )
}
