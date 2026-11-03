import { EXERCISE_VIDEOS } from '@/data/exercise-videos'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Exercise = {
  id: string
  name: string
  muscle: string
  equipment: string
  difficulty: Difficulty
  /** Set in exercise-videos.ts when you add your demos */
  videoId?: string | null
  noEquipment?: boolean
  instructions: string[]
  mistakes: string[]
}

export const EXERCISES: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscle: 'Chest, Triceps',
    equipment: 'Barbell, Bench',
    difficulty: 'intermediate',
    videoId: 'rT7DgCr-3pg',
    instructions: [
      'Lie flat with feet planted and eyes under the bar.',
      'Grip slightly wider than shoulders, unrack with straight wrists.',
      'Lower to mid-chest with control, elbows ~45°.',
      'Drive up explosively without bouncing off the chest.'
    ],
    mistakes: ['Flaring elbows 90°', 'Bouncing the bar', 'Lifting hips off the bench']
  },
  {
    id: 'squat',
    name: 'Back Squat',
    muscle: 'Quads, Glutes',
    equipment: 'Barbell, Rack',
    difficulty: 'intermediate',
    videoId: 'aclHkVaku9U',
    instructions: [
      'Bar on upper traps, brace core, feet shoulder-width.',
      'Sit hips back and down keeping chest up.',
      'Depth: hip crease below knee if mobility allows.',
      'Drive through mid-foot to stand.'
    ],
    mistakes: ['Knees caving in', 'Good-morning squat', 'Heels rising']
  },
  {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    muscle: 'Hamstrings, Back',
    equipment: 'Barbell',
    difficulty: 'intermediate',
    videoId: 'op9kVnS2076',
    instructions: [
      'Bar over mid-foot, shins close to bar.',
      'Hinge and grip, flatten back, pull slack.',
      'Push floor away, bar stays close to legs.',
      'Lock hips and knees together at top.'
    ],
    mistakes: ['Rounded lower back', 'Bar drifting forward', 'Hyperextending at lockout']
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    muscle: 'Lats, Biceps',
    equipment: 'Pull-up Bar',
    difficulty: 'intermediate',
    videoId: 'eGo4IYlbE5g',
    instructions: [
      'Hang with shoulders engaged (not passive).',
      'Pull elbows down and back to ribcage.',
      'Chin clears bar without neck craning.',
      'Lower under control to full extension.'
    ],
    mistakes: ['Kipping excessively', 'Half reps', 'Shrugging shoulders up']
  },
  {
    id: 'push-up',
    name: 'Push-Up',
    muscle: 'Chest, Core',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    videoId: 'IODxDxX7oi4',
    instructions: [
      'Plank position, hands under shoulders.',
      'Lower chest to floor, elbows track back.',
      'Keep body rigid — no sagging hips.',
      'Press up to full lockout.'
    ],
    mistakes: ['Hips dropping', 'Elbows flaring wide', 'Short range of motion']
  },
  {
    id: 'shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscle: 'Shoulders',
    equipment: 'Dumbbells',
    difficulty: 'beginner',
    videoId: 'qEwKCR5JCog',
    instructions: [
      'Dumbbells at shoulder height, core braced.',
      'Press overhead without arching lower back.',
      'Biceps finish near ears at top.',
      'Lower with control to shoulders.'
    ],
    mistakes: ['Excessive back lean', 'Pressing in front of body', 'Incomplete lockout']
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift',
    muscle: 'Hamstrings, Glutes',
    equipment: 'Barbell or Dumbbells',
    difficulty: 'intermediate',
    videoId: '2SHsk9AzD0Y',
    instructions: [
      'Soft knees, bar at hips.',
      'Hinge pushing hips back, bar slides down thighs.',
      'Feel stretch in hamstrings, neutral spine.',
      'Drive hips forward to return.'
    ],
    mistakes: ['Squatting instead of hinging', 'Rounding back', 'Bar too far from legs']
  },
  {
    id: 'lunge',
    name: 'Walking Lunge',
    muscle: 'Quads, Glutes',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    videoId: 'L8fvypPrzzs',
    instructions: [
      'Step forward into a long stride.',
      'Back knee drops toward floor, torso upright.',
      'Front knee tracks over ankle.',
      'Push through front heel to next step.'
    ],
    mistakes: ['Short steps', 'Front knee collapsing inward', 'Leaning forward']
  },
  {
    id: 'plank',
    name: 'Plank',
    muscle: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    videoId: 'ASdvN_XEl_c',
    instructions: [
      'Forearms and toes, body in straight line.',
      'Squeeze glutes, brace abs.',
      'Don\'t let hips sag or pike up.',
      'Breathe steadily throughout hold.'
    ],
    mistakes: ['Hips too high or low', 'Holding breath', 'Looking up straining neck']
  },
  {
    id: 'curl',
    name: 'Dumbbell Bicep Curl',
    muscle: 'Biceps',
    equipment: 'Dumbbells',
    difficulty: 'beginner',
    videoId: 'ykJmrZ5v0Oo',
    instructions: [
      'Elbows pinned at sides.',
      'Curl without swinging torso.',
      'Squeeze at top, control the negative.',
      'Full extension at bottom.'
    ],
    mistakes: ['Using momentum', 'Elbows drifting forward', 'Partial reps']
  },
  {
    id: 'dip',
    name: 'Tricep Dip',
    muscle: 'Triceps, Chest',
    equipment: 'Parallel Bars or Bench',
    difficulty: 'intermediate',
    videoId: '6kALZikXxNw',
    instructions: [
      'Support on bars, shoulders down.',
      'Lower until upper arms ~parallel to floor.',
      'Keep elbows tracking back.',
      'Press up to lockout.'
    ],
    mistakes: ['Shrugging shoulders', 'Going too deep with poor mobility', 'Flaring elbows']
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscle: 'Lats',
    equipment: 'Cable Machine',
    difficulty: 'beginner',
    videoId: 'CAwf7n6Luuc',
    instructions: [
      'Grip bar wide, slight lean back.',
      'Pull bar to upper chest driving elbows down.',
      'Squeeze lats at bottom.',
      'Return slowly without shrugging.'
    ],
    mistakes: ['Pulling behind neck', 'Using momentum', 'Incomplete stretch at top']
  },
  {
    id: 'leg-press',
    name: 'Leg Press',
    muscle: 'Quads, Glutes',
    equipment: 'Machine',
    difficulty: 'beginner',
    videoId: 'IZxyjW7MPZQ',
    instructions: [
      'Feet mid-platform, lower back flat on pad.',
      'Lower until ~90° knee bend.',
      'Drive through heels, don\'t lock knees harshly.',
      'Keep knees tracking over toes.'
    ],
    mistakes: ['Butt lifting off seat', 'Locking knees', 'Feet too high/low']
  },
  {
    id: 'kb-swing',
    name: 'Kettlebell Swing',
    muscle: 'Glutes, Cardio',
    equipment: 'Kettlebell',
    difficulty: 'intermediate',
    videoId: 'YSxHifyIrrs',
    instructions: [
      'Hinge back, kettlebell between legs.',
      'Snap hips forward — arms are pendulum.',
      'Swing to chest height with glute squeeze.',
      'Let bell fall back into next hinge.'
    ],
    mistakes: ['Squatting the swing', 'Using arms to lift', 'Overextending at top']
  },
  {
    id: 'burpee',
    name: 'Burpee',
    muscle: 'Full Body, Cardio',
    equipment: 'Bodyweight',
    difficulty: 'intermediate',
    noEquipment: true,
    videoId: 'auBLPXO8F9w',
    instructions: [
      'Drop to hands, jump feet back to plank.',
      'Optional push-up, then feet forward.',
      'Explosive jump with hands overhead.',
      'Land softly and repeat.'
    ],
    mistakes: ['Skipping full plank', 'Landing stiff-legged', 'Rushing form breakdown']
  },
  {
    id: 'hip-thrust',
    name: 'Barbell Hip Thrust',
    muscle: 'Glutes',
    equipment: 'Barbell, Bench',
    difficulty: 'intermediate',
    videoId: 'LM8XHLYJoHs',
    instructions: [
      'Upper back on bench, bar over hips.',
      'Feet flat, knees ~90° at top.',
      'Drive hips up squeezing glutes.',
      'Lower under control without dropping.'
    ],
    mistakes: ['Hyperextending lower back', 'Pushing through toes', 'Incomplete lockout']
  },
  {
    id: 'cable-fly',
    name: 'Cable Chest Fly',
    muscle: 'Chest',
    equipment: 'Cable Machine',
    difficulty: 'beginner',
    videoId: 'Iwe6AmxVfzY',
    instructions: [
      'Cables at shoulder height, slight forward lean.',
      'Arms wide with soft elbow bend.',
      'Sweep hands together in hugging motion.',
      'Control the stretch on the way back.'
    ],
    mistakes: ['Straightening arms fully', 'Using too much weight', 'Shrugging shoulders']
  },
  {
    id: 'face-pull',
    name: 'Face Pull',
    muscle: 'Rear Delts, Upper Back',
    equipment: 'Cable, Rope',
    difficulty: 'beginner',
    videoId: 'rep-qVOAyqg',
    instructions: [
      'Rope at face height, pull toward forehead.',
      'Externally rotate at end — show your guns.',
      'Squeeze shoulder blades together.',
      'Return slowly maintaining tension.'
    ],
    mistakes: ['Pulling to chest not face', 'Using too heavy weight', 'No external rotation']
  },
  {
    id: 'bodyweight-squat',
    name: 'Bodyweight Squat',
    muscle: 'Quads, Glutes',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    instructions: [
      'Feet shoulder-width, toes slightly out.',
      'Sit hips back and down, chest up.',
      'Thighs parallel to floor or as deep as comfortable.',
      'Drive through heels to stand.'
    ],
    mistakes: ['Knees caving', 'Heels lifting', 'Rounding lower back']
  },
  {
    id: 'glute-bridge',
    name: 'Glute Bridge',
    muscle: 'Glutes, Hamstrings',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    instructions: [
      'Lie on back, knees bent, feet flat.',
      'Drive hips up squeezing glutes at top.',
      'Pause briefly, lower without dropping.',
      'Keep ribs down — don\'t over-arch.'
    ],
    mistakes: ['Pushing through toes', 'Hyperextending back', 'Rushing reps']
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climber',
    muscle: 'Core, Cardio',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    instructions: [
      'High plank, hands under shoulders.',
      'Drive knees toward chest alternately.',
      'Keep hips level — don\'t bounce up.',
      'Maintain steady breathing.'
    ],
    mistakes: ['Hips too high', 'Incomplete range', 'Sagging core']
  },
  {
    id: 'jumping-jack',
    name: 'Jumping Jack',
    muscle: 'Full Body, Cardio',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    instructions: [
      'Start feet together, arms at sides.',
      'Jump feet wide while raising arms overhead.',
      'Jump back to start softly.',
      'Keep a rhythm you can sustain.'
    ],
    mistakes: ['Landing stiff-legged', 'Half arm range', 'Going too fast too soon']
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    muscle: 'Quads',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    instructions: [
      'Back flat against wall, slide down to ~90° knees.',
      'Thighs parallel to floor, knees over ankles.',
      'Hold position, breathe steadily.',
      'Press through heels if legs shake.'
    ],
    mistakes: ['Knees past toes', 'Hands on thighs cheating', 'Hips too high']
  },
  {
    id: 'superman',
    name: 'Superman Hold',
    muscle: 'Lower Back, Glutes',
    equipment: 'Bodyweight',
    difficulty: 'beginner',
    noEquipment: true,
    instructions: [
      'Lie face down, arms extended forward.',
      'Lift arms, chest, and legs off floor.',
      'Squeeze glutes and hold 2–3 seconds.',
      'Lower with control.'
    ],
    mistakes: ['Jerking up', 'Looking up straining neck', 'Holding breath']
  }
]

export function getExercise(id: string) {
  return EXERCISES.find((e) => e.id === id)
}

export function isNoEquipment(exercise: Exercise): boolean {
  if (exercise.noEquipment != null) return exercise.noEquipment
  return /^bodyweight$/i.test(exercise.equipment.trim())
}

export function getNoEquipmentExercises() {
  return EXERCISES.filter(isNoEquipment)
}

export function resolveExerciseVideoId(exercise: Exercise): string | null {
  const override = EXERCISE_VIDEOS[exercise.id]
  if (override) return override
  return exercise.videoId ?? null
}

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  beginner: '#22d3ee',
  intermediate: '#fbbf24',
  advanced: '#ff6b6b'
}
