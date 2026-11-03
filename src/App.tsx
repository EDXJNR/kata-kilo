import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import RequireAuth from '@/components/RequireAuth'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import BodyOverview from '@/pages/body/Overview'
import BodyTrends from '@/pages/body/Trends'
import WorkoutLayout from '@/pages/workouts/WorkoutLayout'
import WorkoutOverview from '@/pages/workouts/Overview'
import WorkoutLibrary from '@/pages/workouts/Library'
import WorkoutPlans from '@/pages/workouts/Plans'
import WorkoutBuilder from '@/pages/workouts/Builder'
import WorkoutTrain from '@/pages/workouts/Train'
import WorkoutProgress from '@/pages/workouts/Progress'
import WorkoutCoach from '@/pages/workouts/Coach'
import WorkoutPlanner from '@/pages/workouts/Planner'
import BuddyPage from '@/pages/buddy/Buddy'
import SquadActivityPage from '@/pages/buddy/SquadActivity'
import RouteTrack from '@/pages/routes/Track'
import RouteHistory from '@/pages/routes/History'
import EatHub from '@/pages/meals/EatHub'
import CalorieScanPage from '@/pages/meals/CalorieScan'
import AwardsPage from '@/pages/awards/Awards'
import AwardsAllPage from '@/pages/awards/AwardsAll'
import SleepHub from '@/pages/sleep/SleepHub'
import SleepHistory from '@/pages/sleep/History'
import ProfileAccount from '@/pages/profile/Account'
import ProfileStats from '@/pages/profile/Stats'
import HabitsPage from '@/pages/habits/Habits'
import MorePage from '@/pages/More'
import RingHistoryPage from '@/pages/activity/RingHistory'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="activity/rings" element={<RingHistoryPage />} />

        <Route path="body">
          <Route index element={<BodyOverview />} />
          <Route path="trends" element={<BodyTrends />} />
        </Route>

        <Route path="workouts" element={<WorkoutLayout />}>
          <Route index element={<WorkoutOverview />} />
          <Route path="hub" element={<WorkoutOverview />} />
          <Route path="library" element={<WorkoutLibrary />} />
          <Route path="plans" element={<WorkoutPlans />} />
          <Route path="builder" element={<WorkoutBuilder />} />
          <Route path="train" element={<WorkoutTrain />} />
          <Route path="progress" element={<WorkoutProgress />} />
          <Route path="coach" element={<WorkoutCoach />} />
          <Route path="planner" element={<WorkoutPlanner />} />
        </Route>

        <Route path="more" element={<MorePage />} />
        <Route path="buddy" element={<BuddyPage />} />
        <Route path="buddy/squad-activity" element={<SquadActivityPage />} />
        <Route path="habits" element={<HabitsPage />} />

        <Route path="routes">
          <Route index element={<Navigate to="track" replace />} />
          <Route path="track" element={<RouteTrack />} />
          <Route path="history" element={<RouteHistory />} />
        </Route>

        <Route path="meals">
          <Route index element={<EatHub />} />
          <Route path="scan" element={<CalorieScanPage />} />
        </Route>
        <Route path="nutrition/*" element={<Navigate to="/meals" replace />} />
        <Route path="awards" element={<AwardsPage />} />
        <Route path="awards/all" element={<AwardsAllPage />} />

        <Route path="sleep">
          <Route index element={<SleepHub />} />
          <Route path="track" element={<Navigate to="/sleep" replace />} />
          <Route path="history" element={<SleepHistory />} />
        </Route>

        <Route path="profile">
          <Route index element={<ProfileAccount />} />
          <Route path="stats" element={<ProfileStats />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
