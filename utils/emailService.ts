class EmailService {
  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode }),
      })

      const data = await response.json()
      
      if (data.success) {
        if (data.demoMode) {
          // Show the verification code to the user for demo purposes
          alert(`DEMO MODE - Email not configured!\n\nYour verification code is: ${verificationCode}\n\nIn production, this would be sent to: ${email}`)
        }
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error sending verification email:', error)
      return false
    }
  }
}

export const emailService = new EmailService()
