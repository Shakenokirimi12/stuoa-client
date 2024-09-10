import { Button, ChakraProvider, Flex, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import KanaKeyboard from './HiraganaKeyboard';
import AlphabetKeyboard from './AlphabetKeyboard';
import postError from '../fetcher/errorReporter';
import NumberInput from './NumberInput';

const AnswerWindow = () => {
  const [roomId, setRoomId] = useState('');
  const [errorOccured, setErrorState] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [keyboardMode, setKeyboardMode] = useState(null);

  const [serverIP, setServerIP] = useState('');

  useEffect(() => {
    const fetchServerIP = async () => {
      try {
        const ip = await window.globalVariableHandler.getSharedData('server_IP');
        setServerIP(ip);
        const code = await window.globalVariableHandler.getSharedData('roomId');
        setRoomId(code);
      } catch (error) {
        console.error('Failed to fetch server IP:', error);
      }
    };

    fetchServerIP();
  }, []);

  const fetchRoomData = async () => {
    try {
      const response = await fetch(`http://${serverIP}/api/client/currentroom/${roomId}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.length === 0) {
        setErrorState(true);
        setErrorMessage('受付未完了エラーが発生しました。係員が参ります。しばらくお待ちください。');
        try {
          await postError('受付処理未完了エラー', roomId);
        } catch (error) {
          setErrorMessage(
            '受付処理未完了エラーが発生しました。エラーを送信できませんでした。係員をお呼びください。<br/> error:' +
              error
          );
        }
      } else {
        setErrorState(false);
        await window.globalVariableHandler.setSharedData(
          'currentGroupDifficulty',
          data[0].Difficulty
        );
        await window.globalVariableHandler.setSharedData('currentGroupName', data[0].GroupName);
        await window.globalVariableHandler.setSharedData('currentGroupId', data[0].GroupId);
        let questionCount, clearQuestionCount;
        if (data[0].Difficulty == 4) {
          questionCount = 1;
          clearQuestionCount = 1;
        } else if (data[0].Difficulty == 3) {
          questionCount = 6;
          clearQuestionCount = 5;
        } else if (data[0].Difficulty == 2) {
          questionCount = 7;
          clearQuestionCount = 5;
        } else if (data[0].Difficulty == 1) {
          questionCount = 7;
          clearQuestionCount = 4;
        }
        await window.globalVariableHandler.setSharedData('currentLastQuestion', questionCount);
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestionToClear',
          clearQuestionCount
        );
        window.remoteFunctionHandler.executeFunction('InstructionWindow', 'playOpening');
        setKeyboardMode('blank');
      }
    } catch (error) {
      console.error('Failed to fetch room data:', error);
      setErrorState(true);
      setErrorMessage('データの取得に失敗しました。もう一度お試しください。' + error);
    }
  };

  const handleSubmissionComplete = () => {
    setKeyboardMode('blank');
  };

  window.remoteFunctionHandler.onInvokeFunction(async (functionName) => {
    try {
      if (functionName === 'showKeyboard') {
        const currentKeyboardType = await window.globalVariableHandler.getSharedData(
          'currentQuestionAnswerType'
        );
        console.log('called!', currentKeyboardType);
        setKeyboardMode(currentKeyboardType);
      }
      if (functionName === 'waitForStaffControl') {
        console.log('called: waitForStaffControl');
        setKeyboardMode(null);
      }
    } catch (error) {
      console.error('Error invoking function:', error);
    }
  });

  const handleSubmit = async (submittedAnswer) => {
    window.remoteFunctionHandler.executeFunction('QuestionWindow', 'clearWindow');
    let ans = await window.globalVariableHandler.getSharedData('currentQuestionAnswer');

    let currentQuestionId = await window.globalVariableHandler.getSharedData('currentQuestionId');
    let currentGroupId = await window.globalVariableHandler.getSharedData('currentGroupId');
    let result = ans === submittedAnswer ? 'Correct' : 'Wrong';

    const data = {
      GroupId: currentGroupId,
      QuestionId: currentQuestionId,
      Result: result,
      ChallengerAnswer: submittedAnswer
    };

    try {
      const response = await fetch(`http://${serverIP}/api/client/answer/register`, {
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
    } catch (error) {
      console.error('Network error:', error);
    }

    let currentLastQuestionToClear = await window.globalVariableHandler.getSharedData(
      'currentLastQuestionToClear'
    );
    let currentLastQuestion =
      await window.globalVariableHandler.getSharedData('currentLastQuestion');

    if (result === 'Correct') {
      if (currentLastQuestionToClear === 1) {
        await window.globalVariableHandler.setSharedData('isCleared', true);
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `playEnding`);
      } else {
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestionToClear',
          currentLastQuestionToClear - 1
        );
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestion',
          currentLastQuestion - 1
        );
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `PlayCorrectMovie`);
      }
    } else {
      if (currentLastQuestion === currentLastQuestionToClear) {
        await window.globalVariableHandler.setSharedData('isCleared', false);
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `playEnding`);
      } else {
        await window.globalVariableHandler.setSharedData(
          'currentLastQuestion',
          currentLastQuestion - 1
        );
        window.remoteFunctionHandler.executeFunction('InstructionWindow', `PlayWrongMovie`);
      }
    }
  };

  return (
    <ChakraProvider>
      <Flex
        height="100vh"
        width="100vw"
        alignItems="center"
        justifyContent="center"
        padding="4"
        bg="gray.100"
      >
        {(keyboardMode === 'waitingForStaffControl' || keyboardMode === null) && (
          <VStack>
            <Button
              size="sm"
              width="100px"
              height="100px"
              colorScheme="gray"
              borderRadius="md"
              onClick={() => setKeyboardMode('startButton')}
              position="absolute"
              top="10px"
              left="10px"
            ></Button>
          </VStack>
        )}
        {keyboardMode === 'startButton' && (
          <VStack>
            <Button
              size="lg"
              fontSize="2xl"
              width="300px"
              height="100px"
              colorScheme="blue"
              borderRadius="md"
              _hover={{ bg: 'blue.600' }}
              onClick={fetchRoomData}
            >
              ログイン
            </Button>
            {errorOccured && (
              <Text color="red.500" dangerouslySetInnerHTML={{ __html: errorMessage }} />
            )}
          </VStack>
        )}

        {keyboardMode === 'hiragana' && (
          <KanaKeyboard
            onSubmitComplete={handleSubmissionComplete}
            onAnswerSubmitted={handleSubmit}
          />
        )}
        {keyboardMode === 'alphabet' && (
          <AlphabetKeyboard
            onSubmitComplete={handleSubmissionComplete}
            onAnswerSubmitted={handleSubmit}
          />
        )}

        {keyboardMode === 'number' && (
          <NumberInput
            onSubmitComplete={handleSubmissionComplete}
            onAnswerSubmitted={handleSubmit}
          />
        )}

        {keyboardMode === 'blank' && <Flex height="100%" width="100%" bg="white" />}
      </Flex>
    </ChakraProvider>
  );
};

export default AnswerWindow;
