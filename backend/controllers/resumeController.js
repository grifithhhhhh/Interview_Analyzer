const Candidate = require('../models/Candidate')
const pdfParse = require('pdf-parse')
const Groq = require('groq-sdk')

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const analyzeResume = async (req, res) => {
  try {
    // Step 1: Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer)
    const resumeText = pdfData.text

    // Step 2: Send to Groq
    const prompt = `
      You are an expert HR recruiter. Analyze this resume and return ONLY a valid JSON object, no extra text, no markdown.

      Return exactly this structure:
      {
        "candidate_name": "string",
        "overall_score": number between 0 and 10,
        "experience_years": number,
        "education": "string",
        "skills": ["string"],
        "strengths": ["string"],
        "weaknesses": ["string"],
        "summary": "2-3 sentence summary",
        "recommended_roles": ["string"]
      }

      Resume:
      ${resumeText}
    `

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR recruiter. Return valid JSON only, no extra text, no markdown, no code fences.'
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
    const analysis = JSON.parse(cleaned)

    // Step 4: Save to MongoDB
    const candidate = await Candidate.create({
      name: analysis.candidate_name,
      email: req.body.email || '',
       jobRole: analysis.recommended_roles?.[0] || 'Not specified', 
       resumeText,
      resumeAnalysis: {
        overall_score: parseFloat(analysis.overall_score) || 0,
        experience_years: analysis.experience_years,
        education: analysis.education,
        skills: analysis.skills,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        summary: analysis.summary,
        recommended_roles: analysis.recommended_roles
      }
    })

    res.status(201).json({ success: true, candidate })

  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
}

module.exports = { analyzeResume }