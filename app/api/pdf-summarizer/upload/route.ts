import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000'
console.log('Using backend URL:', BACKEND_URL)

export async function POST(request: NextRequest) {
  try {
    console.log('PDF upload request received')
    
    // Test backend connectivity first
    try {
      console.log('Attempting to connect to backend at:', `${BACKEND_URL}/health`)
      const healthCheck = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout and other options for Windows compatibility
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })
      console.log('Backend health check status:', healthCheck.status)
      if (!healthCheck.ok) {
        throw new Error(`Backend health check failed with status: ${healthCheck.status}`)
      }
    } catch (healthError) {
      console.error('Backend health check failed:', healthError)
      return NextResponse.json(
        { error: `Backend server is not reachable: ${healthError instanceof Error ? healthError.message : 'Unknown error'}` },
        { status: 503 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File

    console.log('File received:', file ? `${file.name} (${file.size} bytes)` : 'No file')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Create new FormData for backend
    const backendFormData = new FormData()
    backendFormData.append('file', file)

    console.log('Forwarding to backend:', `${BACKEND_URL}/pdf-summarizer/upload`)
    
    // Forward request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/pdf-summarizer/upload`, {
      method: 'POST',
      body: backendFormData,
    })

    console.log('Backend response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.log('Backend error:', errorData)
      return NextResponse.json(
        { error: errorData.detail || 'Failed to process PDF' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('PDF upload error:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
