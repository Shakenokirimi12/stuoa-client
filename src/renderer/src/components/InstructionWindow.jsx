import { ChakraProvider, Img, Box, VStack } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'

const InstructionWindow = () => {
  const [showState, setShowState] = useState('icon')
  const [videoId, setVideoId] = useState()
  const [instructionState, setInstructionState] = useState('lastQuestion')
  const videoRef = useRef(null)

  // Function to update videoId and optionally perform other actions
  const updateVideo = (lastQuestionCount, lastToClear, isFirst) => {
    if (isFirst) {
      setVideoId(`_${lastQuestionCount}_${lastToClear}_start`)
    } else {
      setVideoId(`_${lastQuestionCount}_${lastToClear}`)
    }
    setShowState('instruction') // Ensure that the video is set to be shown
  }

  // Handle video playback when videoId or instructionState changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load()
      videoRef.current.play()
    }
  }, [videoId, instructionState])

  const [serverIP, setServerIP] = useState('')
  const [exitPosition, setExitPosition] = useState('right')

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP')
      setServerIP(ip)
      const exit = await window.globalVariableHandler.getSharedData('exitPosition')
      setExitPosition(exit)
    }
    fetchServerIP()
  }, [])

  // Handle state change when countdown video ends
  const onCountDownEnded = () => {
    // Add logic for what happens when the countdown video ends
  }

  const startOrUpdateChallenge = async (isFirst) => {
    let currentLastQuestion =
      await window.globalVariableHandler.getSharedData('currentLastQuestion')
    let currentLastQuestionToClear = await window.globalVariableHandler.getSharedData(
      'currentLastQuestionToClear'
    )
    updateVideo(currentLastQuestion, currentLastQuestionToClear, isFirst) //? 残問題数表示の数値を設定
    setShowState('instruction')
    setInstructionState('lastQuestion') //? 残問題数表示を表示
    window.remoteFunctionHandler.executeFunction('QuestionWindow', 'showQuestion')
  }

  const playOpening = () => {
    setShowState('opening')
  }

  const playEnding = () => {
    setShowState('ending')
  }

  const playExitInstruction = () => {
    setShowState('exitinstruction')
  }

  window.remoteFunctionHandler.onInvokeFunction(async (functionName) => {
    if (functionName === 'PlayCorrectMovie') {
      setInstructionState('correct')
    } else if (functionName === 'PlayWrongMovie') {
      setInstructionState('wrong')
    } else if (functionName === 'playOpening') {
      playOpening()
    } else if (functionName === 'playEnding') {
      playEnding()
    } else if (functionName === 'playExitInstruction') {
      playExitInstruction()
      setInstructionState('icon')
      window.remoteFunctionHandler.executeFunction('AnswerWindow', 'waitForStaffControl')
    }
  })
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
      ) : showState === 'instruction' ? (
        <VStack>
          <Box display="flex" justifyContent="center" alignItems="center" height="75vh">
            {instructionState === 'lastQuestion' ? (
              <>
                <video
                  ref={videoRef}
                  width="100%"
                  height="100%"
                  autoPlay
                  onEnded={() => {
                    videoRef.current.pause()
                    videoRef.current.currentTime = videoRef.current.duration - 0.1 // 最後のフレームで停止
                  }}
                >
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
                onEnded={async () => await startOrUpdateChallenge(false)}
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
                onEnded={async () => await startOrUpdateChallenge(false)}
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
      ) : showState === 'opening' ? (
        <VStack>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            width={'100vw'}
          >
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              autoPlay
              onEnded={() => startOrUpdateChallenge(false)}
            >
              <source src={`http://${serverIP}/api/client/getFile/opening.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      ) : showState === 'ending' ? (
        <VStack>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
            width={'100vw'}
          >
            <video
              ref={videoRef}
              width="100%"
              height="100%"
              autoPlay
              onEnded={() => playExitInstruction()}
            >
              <source src={`http://${serverIP}/api/client/getFile/opening.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      ) : (
        showState === 'exitinstruction' && (
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
                  src={`http://${serverIP}/api/client/getFile/exit_${exitPosition}.mp4`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </Box>
          </VStack>
        )
      )}
    </ChakraProvider>
  )
}

export default InstructionWindow
