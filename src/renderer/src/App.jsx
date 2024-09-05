import { HashRouter, Routes, Route } from 'react-router-dom'
import ControlPanel from './components/controlpanel'
import AnswerWindow from './components/AnswerWindow'
import QuestionWindow from './components/QuestionWindow'
import InstructionWindow from './components/InstructionWindow'
import ConnectionChecker from './components/ConnectionChecker'
function App() {
  return (
    <HashRouter>
      <Routes basename={window.location.pathname}>
        <Route path="/" element={<ControlPanel />} />
        <Route path="ans" element={<AnswerWindow />} />
        <Route path="inst" element={<InstructionWindow />} />
        <Route path="ques" element={<QuestionWindow />} />
        <Route path="connection_checker" element={<ConnectionChecker />} />
      </Routes>
    </HashRouter>
  )
}

export default App
