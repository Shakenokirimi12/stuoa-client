import { ChakraProvider, Img, Box, VStack, Button } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'

const InstructionWindow = () => {
  const [showState, setShowState] = useState('icon')
  const [videoId, setVideoId] = useState('_5_1')
  const [instructionState, setInstructionState] = useState('lastQuestion')
  const videoRef = useRef(null)

  // Function to update videoId and optionally perform other actions
  const updateVideo = (lastQuestionCount, lastToClear) => {
    setVideoId(`_${lastQuestionCount}_${lastToClear}`)
    setShowState('video') // Ensure that the video is set to be shown
  }

  // Handle video playback when videoId changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play()
    }
  }, [videoId])

  // Handle state change when countdown video ends
  const onCountDownEnded = () => {
    // Add logic for what happens when the countdown video ends
  }

  // Conditional rendering based on showState
  return (
    <ChakraProvider>
      {showState === 'icon' ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Img
            src="http://192.168.1.237:3030/api/client/getFile/icon.png"
            maxWidth="100%"
            maxHeight="100%"
            objectFit="contain"
          />
          <Button onClick={() => updateVideo('5', '2')}>Start video</Button>
        </Box>
      ) : showState === 'video' ? (
        <VStack>
          <Box display="flex" justifyContent="center" alignItems="center" height="75vh">
            {instructionState === 'lastQuestion' ? (
              <>
                <video ref={videoRef} width="100%" height="100%" autoPlay>
                  <source
                    src={`http://192.168.1.237:3030/api/client/getFile/last${videoId}.mp4`}
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
                  src={`http://192.168.1.237:3030/api/client/getFile/correct.mp4`}
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
                <source
                  src={`http://192.168.1.237:3030/api/client/getFile/wrong.mp4`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            )}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" height="25vh">
            <video width="100%" height="100%" autoPlay onEnded={onCountDownEnded}>
              <source
                src="http://192.168.1.237:3030/api/client/getFile/countdown.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      ) : (
        <VStack>
          <Box display="flex" justifyContent="center" alignItems="center" height="75vh">
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              autoPlay
              onEnded={() => setShowState('icon')}
            >
              <source
                src={`http://192.168.1.237:3030/api/client/getFile/exit_right.mp4`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" height="25vh">
            <video width="100%" height="100%" autoPlay>
              <source
                src="http://192.168.1.237:3030/api/client/getFile/countdown.mp4"
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
