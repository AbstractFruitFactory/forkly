import { json } from '@sveltejs/kit'
import { Resend } from 'resend'
import { RESEND_API_KEY } from '$env/static/private'
import type { RequestHandler } from './$types'

const resend = new Resend(RESEND_API_KEY)

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { text, email } = await request.json()

		// Validate input
		if (!text || typeof text !== 'string' || text.trim().length === 0) {
			return json({ error: 'Feedback text is required' }, { status: 400 })
		}

		if (text.length > 2000) {
			return json({ error: 'Feedback text is too long (max 2000 characters)' }, { status: 400 })
		}

		if (email && typeof email === 'string') {
			const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
			if (!emailRegex.test(email)) {
				return json({ error: 'Invalid email format' }, { status: 400 })
			}
		}

		// Create email content
		const emailContent = `
			<h2>New Feedback Received</h2>
			<p><strong>Feedback:</strong></p>
			<p>${text.replace(/\n/g, '<br>')}</p>
			${email ? `<p><strong>From:</strong> ${email}</p>` : '<p><strong>From:</strong> Anonymous</p>'}
			<p><strong>Date:</strong> ${new Date().toISOString()}</p>
		`

		// Send email
		const result = await resend.emails.send({
			from: 'Forkly Feedback <no-reply@forkly.me>',
			to: 'feedback@forkly.me',
			subject: 'New Feedback - Forkly',
			html: emailContent
		})

		if (result.error) {
			console.error('Resend error:', result.error)
			return json({ error: 'Failed to send feedback' }, { status: 500 })
		}

		return json({ success: true })
	} catch (error) {
		console.error('Feedback API error:', error)
		return json({ error: 'Internal server error' }, { status: 500 })
	}
} 