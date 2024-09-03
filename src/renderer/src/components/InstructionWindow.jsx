import { ChakraProvider, Img, Box, VStack } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'

const InstructionWindow = () => {
  const [showState, setShowState] = useState('icon')
  const [videoId, setVideoId] = useState('_5_5')
  const [instructionState, setInstructionState] = useState('lastQuestion')
  const videoRef = useRef(null)

  // Function to update videoId and optionally perform other actions
  const updateVideo = (lastQuestionCount, lastToClear) => {
    setVideoId(`_${lastQuestionCount}_${lastToClear}`)
    setShowState('video') // Ensure that the video is set to be shown
  }

  // Handle video playback when videoId or instructionState changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play()
    }
  }, [videoId, instructionState])

  const [serverIP, setServerIP] = useState('')

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP')
      setServerIP(ip)
    }
    fetchServerIP()
  }, [])

  // Handle state change when countdown video ends
  const onCountDownEnded = () => {
    // Add logic for what happens when the countdown video ends
  }

  const onAnswerSubmitted = (correct) => {
    if (correct) {
      setInstructionState('correct')
    } else {
      setInstructionState('wrong')
    }
  }

  //! for debbuging
  // Add a keydown event listener when showState is 'video'
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'a') {
        onAnswerSubmitted(true)
      } else if (event.key === 'b') {
        onAnswerSubmitted(false)
      } else if (event.key === 'c') {
        updateVideo('5', '5')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
  }, [showState])
  //! for debbuging

  // Conditional rendering based on showState
  return (
    <ChakraProvider>
      {showState === 'icon' ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Img
            src={`http://${serverIP}/api/client/getFile/icon.png`}
            maxWidth="100%"
            maxHeight="100%"
            objectFit="contain"
          />
        </Box>
      ) : showState === 'video' ? (
        <VStack>
          <Box display="flex" justifyContent="center" alignItems="center" height="75vh">
            {instructionState === 'lastQuestion' ? (
              <>
                <video ref={videoRef} width="100%" height="100%" autoPlay>
                  <source
                    src={`http://${serverIP}/api/client/getFile/last${videoId}.mp4`}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </>
            ) : instructionState === 'correct' ? (
              <video
                ref={videoRef}
                width="100%"
                height="100%"
                autoPlay
                onEnded={() => setInstructionState('lastQuestion')}
              >
                <source
                  src={`http://${serverIP}/api/client/getFile/correct.mp4`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            ) : (
              <video
                ref={videoRef}
                width="100%"
                height="100%"
                autoPlay
                onEnded={() => setInstructionState('lastQuestion')}
              >
                <source src={`http://${serverIP}/api/client/getFile/wrong.mp4`} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" height="25vh">
            <video width="100%" height="100%" autoPlay onEnded={onCountDownEnded}>
              <source
                src={`http://${serverIP}/api/client/getFile/countdown.mp4`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      ) : (
        <VStack>
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              autoPlay
              onEnded={() => setShowState('icon')}
            >
              <source
                src={`http://${serverIP}/api/client/getFile/exit_right.mp4`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      )}
    </ChakraProvider>
  )
}

export default InstructionWindow
