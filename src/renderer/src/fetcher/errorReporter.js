const postError = async (errorMessage, errorLocation) => {
  try {
    const serverIP = await window.globalVariableHandler.getSharedData('server_IP')
    const response = await fetch(`http://${serverIP}/api/client/errorReport`, {
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
