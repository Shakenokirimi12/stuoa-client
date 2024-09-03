import {
  ChakraProvider,
  Button,
  Box,
  VStack,
  Heading,
  Select,
  HStack,
  Input
} from '@chakra-ui/react'
import { useState } from 'react'

const ControlPanel = () => {
  const [serverIP, setServerIP] = useState('192.168.1.237:3030')
  const [instructionWindowDisplay, setInstructionWindowDisplay] = useState('Display 1')
  const [answerWindowDisplay, setAnswerWindowDisplay] = useState('Display 1')
  const [questionWindowDisplay, setQuestionWindowDisplay] = useState('Display 1')

  const openInstructionWindow = () => window.myAPI.openInstructionWindow(instructionWindowDisplay)
  const openAnswerWindow = () => window.myAPI.openAnswerWindow(answerWindowDisplay)
  const openQuestionWindow = () => window.myAPI.openQuestionWindow(questionWindowDisplay)
  const showScreenNumbers = () => window.myAPI.showScreenNumbers()
  const showConnectionChecker = () => window.myAPI.showConnectionChecker()
  const registerServerIP = async () => {
    console.log('Settng sever ip..')
    try {
      await window.globalVariableHandler.setSharedData('server_IP', serverIP)
    } catch (error) {
      console.error('Error updating server IP:', error)
    }
    const fetchServerIP = async () => {
      try {
        const ip = await window.globalVariableHandler.getSharedData('server_IP')
        console.log(ip)
      } catch (error) {
        console.error('Failed to fetch server IP:', error)
      }
    }
    fetchServerIP()
  }

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
                onChange={(e) => setServerIP(e.target.value)}
              />
              <Button colorScheme="blue" size="lg" variant="solid" onClick={registerServerIP}>
                Set Server IP
              </Button>
            </HStack>
            <Button colorScheme="blue" size="lg" variant="solid" onClick={showConnectionChecker}>
              Check Server Connection
            </Button>
            <HStack w="full">
              <Button colorScheme="teal" size="lg" variant="solid" onClick={openInstructionWindow}>
                Open Instruction Window
              </Button>
              <Select
                value={instructionWindowDisplay}
                onChange={(e) => setInstructionWindowDisplay(e.target.value)}
              >
                <option value="Display 1">Display 1</option>
                <option value="Display 2">Display 2</option>
                <option value="Display 3">Display 3</option>
                <option value="Display 4">Display 4</option>
              </Select>
            </HStack>

            <HStack w="full">
              <Button colorScheme="teal" size="lg" variant="solid" onClick={openAnswerWindow}>
                Open Answer Window
              </Button>
              <Select
                value={answerWindowDisplay}
                onChange={(e) => setAnswerWindowDisplay(e.target.value)}
              >
                <option value="Display 1">Display 1</option>
                <option value="Display 2">Display 2</option>
                <option value="Display 3">Display 3</option>
                <option value="Display 4">Display 4</option>
              </Select>
            </HStack>

            <HStack w="full">
              <Button colorScheme="teal" size="lg" variant="solid" onClick={openQuestionWindow}>
                Open Question Window
              </Button>
              <Select
                value={questionWindowDisplay}
                onChange={(e) => setQuestionWindowDisplay(e.target.value)}
              >
                <option value="Display 1">Display 1</option>
                <option value="Display 2">Display 2</option>
                <option value="Display 3">Display 3</option>
                <option value="Display 4">Display 4</option>
              </Select>
            </HStack>

            <Button colorScheme="orange" size="lg" variant="solid" onClick={showScreenNumbers}>
              Show Screen Numbers
            </Button>
          </VStack>
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default ControlPanel
