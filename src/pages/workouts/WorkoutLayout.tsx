import { Outlet } from 'react-router-dom'
import { WorkoutSessionProvider } from '@/context/WorkoutSessionContext'

export default function WorkoutLayout() {
  return (
    <WorkoutSessionProvider>
      <Outlet />
    </WorkoutSessionProvider>
  )
}
