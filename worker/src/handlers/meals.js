export async function handleScanPlate(request, env, userId) {
  const body = await env.readJson(request)
  if (!body?.imageBase64) return env.errorResponse('imageBase64 required', 400, request, env.ctx)

  const sizeKb = Math.round((body.imageBase64.length * 3) / 4 / 1024)
  const visionKey = env.OPENAI_API_KEY || env.WORKERS_AI_TOKEN

  if (visionKey && env.OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Estimate this meal. Reply JSON only: {"mealName","calories","proteinG","carbsG","fatG","note"}'
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:${body.mimeType || 'image/jpeg'};base64,${body.imageBase64}` }
                }
              ]
            }
          ],
          max_tokens: 300
        })
      })
      const json = await res.json()
      const text = json.choices?.[0]?.message?.content
      if (text) {
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
        return env.jsonResponse({ analysis: parsed }, { status: 200 }, request, env.ctx)
      }
    } catch (e) {
      console.error('vision scan failed', e)
    }
  }

  const calories = 320 + Math.min(280, sizeKb * 8)
  return env.jsonResponse(
    {
      analysis: {
        mealName: 'Detected meal plate',
        calories,
        proteinG: Math.round(calories * 0.25) / 4,
        carbsG: Math.round(calories * 0.45) / 4,
        fatG: Math.round(calories * 0.3) / 9,
        note: visionKey
          ? 'Vision model unavailable — showing heuristic estimate. Check worker logs.'
          : 'Add OPENAI_API_KEY to your worker for real AI calorie tracking from photos.'
      }
    },
    { status: 200 },
    request,
    env.ctx
  )
}
