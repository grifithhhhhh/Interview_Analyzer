const Candidate = require('../models/Candidate')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const generateQuestions = async (req, res) => {
  try {
    const { candidateId } = req.body

    // Step 1: Find the candidate
    const candidate = await Candidate.findById(candidateId)
    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate not found' })
    }

    // Step 2: Send to Groq
    const prompt = `
      You are an expert technical interviewer.
      Generate 8 interview questions for a ${candidate.jobRole} position.
      
      Based on this candidate's resume:
      ${candidate.resumeText}

      Return ONLY a valid JSON object, no extra text, no markdown, no code fences.
      Mix of: 4 technical, 2 behavioral, 2 situational questions.

      Return exactly this structure:
      {
        "questions": [
          {
            "text": "question here",
            "type": "technical" or "behavioral" or "situational",
            "difficulty": "easy" or "medium" or "hard"
          }
        ]
      }
    `

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical interviewer. Return valid JSON only, no extra text, no markdown, no code fences.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    // Step 3: Parse response
    const raw = response.choices[0].message.content
    const cleaned = raw.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    // Step 4: Save questions to candidate
    candidate.questions = parsed.questions
    await candidate.save()

    res.status(200).json({ success: true, questions: parsed.questions })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = { generateQuestions }