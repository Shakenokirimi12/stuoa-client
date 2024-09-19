import { ChakraProvider, Img, Box, VStack } from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';

const InstructionWindow = () => {
  const [showState, setShowState] = useState('icon');
  const [videoId, setVideoId] = useState();
  const [instructionState, setInstructionState] = useState('lastQuestion');
  const videoRef = useRef(null);

  // Function to update videoId and optionally perform other actions
  const updateVideo = (lastQuestionCount, lastToClear, isFirst) => {
    if (isFirst) {
      setVideoId(`_${lastQuestionCount}_${lastToClear}_start`);
    } else {
      setVideoId(`_${lastQuestionCount}_${lastToClear}`);
    }
    setShowState('instruction'); // Ensure that the video is set to be shown
    setInstructionState('lastQuestion'); //? 残問題数表示を表示
  };

  // Handle video playback when videoId or instructionState changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [videoId, instructionState, showState]);

  const [serverIP, setServerIP] = useState('');
  const [exitPosition, setExitPosition] = useState('right');

  useEffect(() => {
    const fetchServerIP = async () => {
      const ip = await window.globalVariableHandler.getSharedData('server_IP');
      setServerIP(ip);
      const exit = await window.globalVariableHandler.getSharedData('exitPosition');
      setExitPosition(exit);
    };
    fetchServerIP();
  }, []);

  // Handle state change when countdown video ends
  const onCountDownEnded = async () => {
    window.remoteFunctionHandler.executeFunction('QuestionWindow', 'clearWindow');
    window.remoteFunctionHandler.executeFunction('AnswerWindow', 'setToBlank');
    await window.globalVariableHandler.setSharedData('isCleared', false);
    await window.remoteFunctionHandler.executeFunction('InstructionWindow', `playEnding`);
  };

  const startOrUpdateChallenge = async (isFirst) => {
    let currentLastQuestion =
      await window.globalVariableHandler.getSharedData('currentLastQuestion');
    let currentLastQuestionToClear = await window.globalVariableHandler.getSharedData(
      'currentLastQuestionToClear'
    );
    updateVideo(currentLastQuestion, currentLastQuestionToClear, isFirst); //? 残問題数表示の数値を設定
    await window.remoteFunctionHandler.executeFunction('QuestionWindow', 'showQuestion');
  };

  const playOpening = () => {
    setShowState('opening');
  };

  const playEnding = (isCleared) => {
    if (isCleared) {
      setShowState('ending_cleared');
    } else {
      setShowState('ending_failed');
    }
  };

  const playExitInstruction = () => {
    setShowState('exitinstruction');
  };

  const sendDataToServer = async () => {
    let gameResult = await window.globalVariableHandler.getSharedData('isCleared');
    let data;
    if (gameResult) {
      data = {
        result: 'Cleared'
      };
    } else {
      data = {
        result: 'Failed'
      };
    }
    const roomId = await window.globalVariableHandler.getSharedData('roomId');
    const response = await fetch(`http://${serverIP}/api/client/finish/${roomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const resultData = await response.json();
    if (resultData.success) {
      console.log('Success:', resultData.message);
    } else {
      console.error('Error:', resultData.message);
    }
  };

  window.remoteFunctionHandler.onInvokeFunction(async (functionName) => {
    if (functionName === 'PlayCorrectMovie') {
      setInstructionState('correct');
    } else if (functionName === 'PlayWrongMovie') {
      setInstructionState('wrong');
    } else if (functionName === 'playOpening') {
      playOpening();
    } else if (functionName === 'playEnding') {
      await sendDataToServer();
      const isCleared = await window.globalVariableHandler.getSharedData('isCleared');
      playEnding(isCleared);
    } else if (functionName === 'playExitInstruction') {
      playExitInstruction();
    }
  });

  const resetAll = async () => {
    setShowState('icon');
    await window.remoteFunctionHandler.executeFunction('AnswerWindow', 'waitForStaffControl');
  };

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
                    videoRef.current.pause();
                    videoRef.current.currentTime = videoRef.current.duration - 0.1; // 最後のフレームで停止
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
              onEnded={async () => await startOrUpdateChallenge(true)}
            >
              <source src={`http://${serverIP}/api/client/getFile/opening.mp4`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      ) : showState === 'ending_cleared' ? (
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
              <source
                src={`http://${serverIP}/api/client/getFile/ending_cleared.mp4`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </Box>
        </VStack>
      ) : showState === 'ending_failed' ? (
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
              <source
                src={`http://${serverIP}/api/client/getFile/ending_failed.mp4`}
                type="video/mp4"
              />
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
                onEnded={async () => {
                  await resetAll();
                }}
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
  );
};

export default InstructionWindow;
