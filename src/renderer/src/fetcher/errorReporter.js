const postError = async (errorMessage, errorLocation) => {
  try {
    const response = await fetch(`http://192.168.1.237:3030/api/client/errorReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: errorMessage, location: errorLocation }) // Fix typo here
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
  } catch (error) {
    throw new Error(error)
  }
}

export default postError
