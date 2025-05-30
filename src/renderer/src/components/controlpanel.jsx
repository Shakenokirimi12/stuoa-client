import {
  ChakraProvider,
  Button,
  Box,
  VStack,
  Heading,
  HStack,
  Input,
  Select
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const ControlPanel = () => {
  const [serverIP, setServerIP] = useState('192.168.1.237:3030');
  const [instructionWindowDisplay, setInstructionWindowDisplay] = useState('Display 1');
  const [answerWindowDisplay, setAnswerWindowDisplay] = useState('Display 1');
  const [questionWindowDisplay, setQuestionWindowDisplay] = useState('Display 1');
  const [isServerSet, setIsServerSet] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [exitPosition, setExitPosition] = useState('right');
  const [roomId, setRoomId] = useState('A');

  const openInstructionWindow = () => window.myAPI.openInstructionWindow(instructionWindowDisplay);
  const openAnswerWindow = () => {
    const setGlobalValue = async () => {
      await window.globalVariableHandler.setSharedData('exitPosition', exitPosition);
      await window.globalVariableHandler.setSharedData('roomId', roomId);
    };
    setGlobalValue();
    window.myAPI.openAnswerWindow(answerWindowDisplay);
  };
  const openQuestionWindow = () => window.myAPI.openQuestionWindow(questionWindowDisplay);

  const showConnectionChecker = async () => {
    try {
      await window.myAPI.showConnectionChecker();
      setIsConnected(true); // Assuming connection check is successful
    } catch (error) {
      console.error('Failed to check server connection:', error);
    }
  };

  const registerServerIP = async () => {
    console.log('Setting server IP...');
    try {
      await window.globalVariableHandler.setSharedData('server_IP', serverIP);
      setIsServerSet(true);
    } catch (error) {
      console.error('Error updating server IP:', error);
    }
  };

  useEffect(() => {
    const setGlobalValue = async () => {
      await window.globalVariableHandler.setSharedData('exitPosition', exitPosition);
    };
    setGlobalValue();
  }, [exitPosition, isConnected]);

  useEffect(() => {
    const setGlobalValue = async () => {
      await window.globalVariableHandler.setSharedData('roomId', roomId);
    };
    setGlobalValue();
  }, [roomId, isConnected, isServerSet]);

  const setFullScreen = async () => {
    try {
      const result = await window.windowController.setFullScreen();
      console.log('Full screen result:', result);
    } catch (error) {
      console.error('Error setting fullscreen:', error);
    }
  };

  return (
    <ChakraProvider>
      <Box p={6} maxW="md" mx="auto">
        <VStack spacing={6} align="center">
          <Heading as="h1" size="lg" mb={4}>
            Save the UoA Client App
          </Heading>
          <Heading as="h2" size="md" color="gray.600">
            Control Panel
          </Heading>
          <VStack spacing={4} w="full">
            <HStack>
              <Input
                placeholder="Enter Server IP"
                value={serverIP}
                id="serverip"
                onChange={(e) => {
                  setServerIP(e.target.value);
                }}
              />
              <Button
                colorScheme="blue"
                size="lg"
                variant="solid"
                onClick={() =>
                  registerServerIP().then(() => {
                    showConnectionChecker();
                  })
                }
              >
                Set Server IP
              </Button>
            </HStack>
            <HStack>
              <Box w={'150px'}>出口の位置</Box>
              <Select
                value={exitPosition}
                onChange={(e) => setExitPosition(e.target.value)}
                disabled={!isConnected}
              >
                <option value="right">右側</option>
                <option value="left">左側</option>
              </Select>
            </HStack>
            <HStack>
              <Box w={'150px'}>ルームコード</Box>
              <Select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={!isConnected}
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </Select>
            </HStack>
            <HStack w="80%">
              <Button
                colorScheme="teal"
                size="lg"
                variant="solid"
                onClick={openInstructionWindow}
                isDisabled={!isConnected}
                w={'500px'}
              >
                Open Instruction Window
              </Button>
            </HStack>

            <HStack w="80%">
              <Button
                colorScheme="teal"
                size="lg"
                variant="solid"
                onClick={openQuestionWindow}
                isDisabled={!isConnected}
                w={'500px'}
              >
                Open Question Window
              </Button>
            </HStack>

            <HStack w="80%">
              <Button
                colorScheme="teal"
                size="lg"
                variant="solid"
                onClick={openAnswerWindow}
                isDisabled={!isConnected}
                w={'500px'}
              >
                Open Answer Window
              </Button>
            </HStack>
            <HStack w="80%">
              <Button
                colorScheme="teal"
                size="lg"
                variant="solid"
                onClick={() => setFullScreen()}
                isDisabled={!isConnected}
                w={'500px'}
              >
                全画面化
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </ChakraProvider>
  );
};

export default ControlPanel;
