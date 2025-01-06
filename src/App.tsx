import { useState, useEffect, useRef } from 'react'
import styled from '@emotion/styled'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface DeploymentLog {
  id: number;
  agent: string;
  steps: string[];
  currentStep: number;
  showDeployed: boolean;
  stats?: {
    fte: number;
    savings: number;
  };
}

interface Line {
  id: number;
  x: number;
  y: number;
  length: number;
  rotation: number;
  speed: number;
}

const Container = styled.div`
  height: 100vh;
  background: #000;
  color: #fff;
  font-family: system-ui, -apple-system, sans-serif;
  position: relative;
  overflow: hidden;
`

const Header = styled.header`
  padding: 2rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`

const Logo = styled.img`
  width: 160px;
  height: 74px;
  opacity: 1;

  @media (max-width: 768px) {
    width: 120px;
    height: 55px;
  }
`

const CTAContainer = styled(motion.div)`
  position: relative;
  display: flex;
  align-items: center;
`

const CTAInput = styled(motion.input)`
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 4px;
  outline: none;
  width: 100%;
  text-overflow: ellipsis;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 2.5rem 0.5rem 1rem;
    font-size: 0.8125rem;
  }
`

const SubmitIcon = styled(motion.button)`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 36px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  z-index: 2;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`

const CTAButton = styled(motion.div)`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  
  @media (max-width: 768px) {
    font-size: 0.8125rem;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.5);
  }
`

const Content = styled.main`
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100vh;
  padding-top: 0;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
`

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem;
  position: relative;
  z-index: 2;
  padding-top: 75px;

  @media (max-width: 768px) {
    padding: 2rem;
    padding-top: 120px;
    text-align: left;
  }
`

const TaglineContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 0;

  @media (max-width: 768px) {
    text-align: left;
  }
`

const TaglineText = styled.div`
  display: block;
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }

  &.with-button {
    display: flex;
    align-items: center;
    gap: 0rem;
  }
`

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem 4rem;
  position: relative;
  z-index: 2;
  height: 100%;
  overflow: hidden;
  padding-top: 150px;

  @media (max-width: 768px) {
    padding: 1rem;
    padding-top: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: auto;
  }
`

const AnimatedBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
`

const Line = styled(motion.div)`
  position: absolute;
  width: 100px;
  height: 2px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform-origin: left center;
`

const TerminalWindow = styled.div`
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 2rem;
  font-family: 'Courier New', monospace;
  color: rgba(255, 255, 255, 0.9);
  width: 100%;
  height: 90vh;
  max-width: 700px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
    height: 60vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
`

const TerminalContent = styled.div`
  flex: 1;
  overflow-y: scroll;
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
  -ms-overflow-style: none;  /* Hide scrollbar for IE and Edge */
  scrollbar-width: none;  /* Hide scrollbar for Firefox */
  
  &::-webkit-scrollbar {
    display: none;  /* Hide scrollbar for Chrome, Safari and Opera */
  }
`

const TerminalHeader = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`

const TerminalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '>';
    color: #00ff00;
  }
`

const TerminalPrompt = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.7;
`

const PromptText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
`

const BlinkingCursor = styled.span`
  display: inline-block;
  color: #00ff00;
  animation: blink 1s step-end infinite;
  font-weight: normal;
  margin-left: 0.25rem;

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`

const TrainButton = styled(motion.button)`
  background: transparent;
  color: #00ff00;
  border: none;
  padding: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  cursor: pointer;
  position: relative;
  
  &::before {
    content: '$';
    color: #00ff00;
    margin-right: 0.5rem;
    opacity: 0.7;
  }
  
  &::after {
    content: '';
    position: absolute;
    left: 1rem;
    right: 0;
    bottom: 0.3rem;
    height: 1px;
    background: #00ff00;
    transform: scaleX(0);
    transition: transform 0.2s ease;
    transform-origin: left;
  }
  
  &:hover {
    &::after {
      transform: scaleX(1);
    }
  }
`

const LogEntry = styled(motion.div)`
  margin-bottom: 2.5rem;
  font-size: 1rem;
  opacity: 0.8;
  &:first-child {
    margin-top: 1rem;
  }
`

const TrainingStep = styled(motion.div)`
  margin-left: 1.5rem;
  margin-top: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  white-space: nowrap;

  @media (max-width: 768px) {
    font-size: 0.7rem;
  }

  &::before {
    content: '>';
    color: rgba(0, 255, 0, 0.5);
    margin-right: 0.75rem;
  }
`

const DeployedStatus = styled(motion.div)`
  color: #00ff00;
  margin-top: 1.5rem;
  margin-left: 1.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  margin-right: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-left: 1rem;
    margin-right: 0.5rem;
    gap: 0.5rem;
  }

  span.separator {
    color: rgba(255, 255, 255, 0.7);
    font-weight: normal;
  }

  span.stats {
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: normal;
    font-weight: normal;
  }
`

const WaitlistMessage = styled(motion.div)`
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  
  &::before {
    content: '>';
    color: #00ff00;
    margin-right: 0.75rem;
  }
`

const PromptInput = styled.input`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
  padding: 0;
  margin: 0;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`

const GradientButton = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  padding: 0 1.5rem;
  height: 2.75rem;
  margin-top: 4px;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  margin-left: 1rem;
  white-space: nowrap;
  background: linear-gradient(
    115deg,
    #3FC78A 0%,
    #2EAF76 15%,
    #1A7A4E 30%,
    #45E0A0 45%,
    #3FC78A 60%,
    #4AE8A8 75%,
    #2EAF76 90%,
    #1A7A4E 100%
  );
  background-size: 300% 300%;
  animation: gradient-animation 8s ease infinite;
  z-index: 10;
  transform-origin: center;
  position: relative;
  
  @media (max-width: 768px) {
    height: 2rem;
    padding: 0 1.25rem;
    font-size: 0.9375rem;
    margin-left: 0.75rem;
  }

  &::after {
    content: '→';
    font-size: 1.1rem;
    margin-left: 0.25rem;

    @media (max-width: 768px) {
      font-size: 0.9375rem;
    }
  }

  @keyframes gradient-animation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  &:hover {
    opacity: 0.9;
  }
`

const SubTagline = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    justify-content: flex-start;
    font-size: 0.8125rem;
    margin-top: 0.75rem;
  }

  em {
    color: rgba(255, 255, 255, 0.8);
    font-style: italic;
    font-weight: normal;
  }

  &::before {
    content: '/';
    color: #3FC78A;
    margin-right: 0.5rem;
    opacity: 0.8;
  }
`

function generateAgentLog() {
  const agents = [
    'Marketing Specialist',
    'Financial Analyst',
    'Sales Development Representative',
    'Executive Assistant',
    'Research Analyst',
    'Customer Support Agent',
    'Content Strategist',
    'Data Scientist',
    'HR Coordinator',
    'Business Development Manager',
    'Legal Assistant',
    'Operations Manager',
    'Product Manager',
    'Social Media Strategist',
    'Market Research Analyst'
  ]

  const trainingSteps = [
    'Initializing neural networks...',
    'Loading industry-specific data...',
    'Optimizing decision matrices...',
    'Calibrating response patterns...',
    'Fine-tuning communication protocols...',
    'Analyzing historical performance...',
    'Integrating best practices...',
    'Validating output quality...',
    'Running simulation tests...',
    'Synchronizing with existing systems...',
    'Training on domain knowledge...',
    'Adapting to company policies...',
    'Learning from past interactions...',
    'Optimizing workflow patterns...',
    'Calibrating decision thresholds...'
  ]

  const agent = agents[Math.floor(Math.random() * agents.length)]
  const steps = Array(3).fill(null).map(() => 
    trainingSteps[Math.floor(Math.random() * trainingSteps.length)]
  )
  
  // Generate FTE first
  const fte = -(Math.floor(Math.random() * 3) + 1)  // Random between -1 and -3
  // Calculate savings based on FTE (using absolute value of FTE)
  const baseSavings = Math.floor(Math.random() * (120 - 70 + 1) + 70)
  const savings = baseSavings * Math.abs(fte)

  // Use a timestamp in milliseconds for unique, descending IDs
  return { 
    agent, 
    steps, 
    id: -Date.now(), // Negative to ensure newer items have smaller numbers
    stats: { fte, savings }
  }
}

function App() {
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([])
  const [showWaitlist, setShowWaitlist] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [isJobDescriptionSubmitted, setIsJobDescriptionSubmitted] = useState(false)
  const [showHeaderEmail, setShowHeaderEmail] = useState(false)
  const [headerEmail, setHeaderEmail] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const headerEmailRef = useRef<HTMLInputElement>(null)
  const [lines, setLines] = useState<Line[]>([])
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 20, stiffness: 40 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  // Generate initial static agents
  const initialAgents: DeploymentLog[] = [
    {
      agent: 'Marketing Specialist',
      steps: [
        'Validating output quality...',
        'Calibrating response patterns...',
        'Synchronizing with existing systems...'
      ],
      id: -1,
      currentStep: 2,
      showDeployed: true,
      stats: { fte: -2, savings: 206 }
    },
    {
      agent: 'Social Media Strategist',
      steps: [
        'Training on domain knowledge...',
        'Integrating best practices...',
        'Optimizing workflow patterns...'
      ],
      id: -2,
      currentStep: 2,
      showDeployed: true,
      stats: { fte: -1, savings: 83 }
    }
  ]

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let isCurrentlyDeploying = false;
    
    const addNewAgent = () => {
      if (isCurrentlyDeploying) return;
      isCurrentlyDeploying = true;
      const newLog = generateAgentLog()
      setDeploymentLogs(prev => [{
        ...newLog,
        currentStep: -1,
        showDeployed: false,
        steps: []
      }, ...prev])
      timeout = setTimeout(addNextStep, 1500)
    }

    const addNextStep = () => {
      setDeploymentLogs(prev => {
        const newLogs = [...prev]
        if (newLogs[0] && newLogs[0].steps.length < 3) {
          const allSteps = generateAgentLog().steps
          newLogs[0] = {
            ...newLogs[0],
            steps: [...(newLogs[0].steps || []), allSteps[newLogs[0].steps.length]],
            currentStep: newLogs[0].steps.length
          }
          timeout = setTimeout(addNextStep, 2000)
        } else if (newLogs[0] && !newLogs[0].showDeployed) {
          newLogs[0] = {
            ...newLogs[0],
            showDeployed: true
          }
          isCurrentlyDeploying = false;
          timeout = setTimeout(addNewAgent, 3000)
        }
        return newLogs
      })
    }

    // Start the cycle immediately with shorter initial delay
    timeout = setTimeout(addNewAgent, 3000)

    return () => {
      clearTimeout(timeout)
      isCurrentlyDeploying = false
    }
  }, [])

  // Scroll to top when new content is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0
    }
  }, [deploymentLogs])

  useEffect(() => {
    // Generate initial lines in a spread out pattern
    const newLines = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      length: 150 + Math.random() * 200,  // Longer lines
      rotation: Math.random() * 360,
      speed: 0.2 + Math.random() * 0.3,  // Slower base speed
    }))
    setLines(newLines)

    const handleMouseMove = (e: MouseEvent) => {
      const mouseSpeed = Math.sqrt(
        Math.pow(e.movementX, 2) + Math.pow(e.movementY, 2)
      )
      const speedMultiplier = Math.min(mouseSpeed / 5, 4)  // Cap the speed multiplier
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
      setLines(prevLines => 
        prevLines.map(line => ({
          ...line,
          speed: (0.2 + Math.random() * 0.3) * (1 + speedMultiplier)
        }))
      )
    }

    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const handleTrainClick = () => {
    const newLog = generateAgentLog()
    setDeploymentLogs(prev => [{ 
      ...newLog, 
      currentStep: -1,
      showDeployed: false 
    }, ...prev])
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setShowWaitlist(true)
      }
    }

    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [])

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!isJobDescriptionSubmitted) {
        setIsJobDescriptionSubmitted(true)
        setShowWaitlist(true)
        setJobDescription(e.currentTarget.value)
      } else {
        setEmailInput(e.currentTarget.value)
      }
    }
  }

  const [isExpanded, setIsExpanded] = useState(false)
  
  const handleSubmit = () => {
    if (headerEmail) {
      console.log('Submitted email:', headerEmail)
      setHeaderEmail('')
      setIsExpanded(false)
    }
  }

  const handleHeaderEmailSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && headerEmail) {
      handleSubmit()
    }
  }

  return (
    <Container>
      <Header>
        <Logo src="WHITENOBACKGROUNDST.svg" alt="Synthetic Teams" />
        <CTAButton
          animate={{
            width: isExpanded ? (window.innerWidth <= 768 ? 200 : 240) : 140,
          }}
          transition={{ duration: 0.3 }}
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          {!isExpanded ? (
            <motion.div
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              Request Access
            </motion.div>
          ) : (
            <CTAContainer>
              <CTAInput
                autoFocus
                placeholder="Enter email"
                value={headerEmail}
                onChange={(e) => setHeaderEmail(e.target.value)}
                onKeyPress={handleHeaderEmailSubmit}
              />
              <SubmitIcon onClick={handleSubmit}>→</SubmitIcon>
            </CTAContainer>
          )}
        </CTAButton>
      </Header>
      <Content>
        <LeftSection>
          <TaglineContainer>
            <TaglineText>Deploy the Hybrid</TaglineText>
            <TaglineText>Workforce of the</TaglineText>
            <TaglineText className="with-button">
              Future
              <GradientButton
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const subject = encodeURIComponent("Application");
                  const body = encodeURIComponent("I am the top 0.1% in [INSERT WHAT], here's proof: [INSERT PROOF]");
                  window.location.href = `mailto:jobs@syntheticteams.com?subject=${subject}&body=${body}`;
                }}
              >
                Apply Today
              </GradientButton>
            </TaglineText>
          </TaglineContainer>
          <SubTagline>
            hiring <em>human</em> engineers and ml researchers
          </SubTagline>
        </LeftSection>
        <RightSection>
          <TerminalWindow>
            <TerminalHeader>
              <TerminalTitle>
                Agents Training Log
              </TerminalTitle>
              <TerminalPrompt>
                <PromptText>
                  $ <PromptInput
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    onKeyPress={handleInputKeyPress}
                    placeholder="type your job description to train your own"
                    spellCheck="false"
                  />
                  <BlinkingCursor>_</BlinkingCursor>
                </PromptText>
                {showWaitlist && (
                  <WaitlistMessage
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <PromptInput
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={handleInputKeyPress}
                      placeholder="type your email to join the waitlist"
                      spellCheck="false"
                      autoFocus
                    />
                    <BlinkingCursor>_</BlinkingCursor>
                  </WaitlistMessage>
                )}
              </TerminalPrompt>
            </TerminalHeader>
            <TerminalContent ref={terminalRef}>
              {deploymentLogs.map((log) => (
                <LogEntry key={log.id}>
                  <motion.div
                    initial={{ color: '#00ff00', opacity: 0 }}
                    animate={{ color: 'rgba(255, 255, 255, 0.9)', opacity: 1 }}
                    transition={{ duration: 1 }}
                  >
                    {log.agent}
                  </motion.div>
                  {log.steps.map((step, index) => (
                    <TrainingStep
                      key={`${log.id}-${index}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ 
                        opacity: log.currentStep >= index ? 1 : 0,
                        x: log.currentStep >= index ? 0 : -10
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {step}
                    </TrainingStep>
                  ))}
                  {log.showDeployed && (
                    <DeployedStatus
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      DEPLOYED <span className="separator">|</span> <span className="stats">{`{ FTE: ${log.stats?.fte}, SAVINGS: +$${log.stats?.savings}K/YR }`}</span>
                    </DeployedStatus>
                  )}
                </LogEntry>
              ))}
              {/* Render static initial agents after dynamic ones */}
              {initialAgents.map((log) => (
                <LogEntry key={log.id}>
                  <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ color: 'rgba(255, 255, 255, 0.9)', opacity: 1 }}
                  >
                    {log.agent}
                  </motion.div>
                  {log.steps.map((step, index) => (
                    <TrainingStep
                      key={`${log.id}-${index}`}
                      initial={{ opacity: 1, x: 0 }}
                    >
                      {step}
                    </TrainingStep>
                  ))}
                  <DeployedStatus
                    initial={{ opacity: 1 }}
                  >
                    DEPLOYED <span className="separator">|</span> <span className="stats">{`{ FTE: ${log.stats?.fte}, SAVINGS: +$${log.stats?.savings}K/YR }`}</span>
                  </DeployedStatus>
                </LogEntry>
              ))}
            </TerminalContent>
          </TerminalWindow>
        </RightSection>
      </Content>
      <AnimatedBackground>
        {lines.map((line) => (
          <Line
            key={line.id}
            initial={{
              x: line.x,
              y: line.y,
              rotate: line.rotation,
              width: line.length,
            }}
            animate={{
              x: line.x + springX.get() * line.speed * 0.3,
              y: line.y + springY.get() * line.speed * 0.3,
              rotate: line.rotation + (springX.get() - springY.get()) * 0.05,
              opacity: [0.15, 0.3, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
            style={{
              width: line.length,
            }}
          />
        ))}
      </AnimatedBackground>
    </Container>
  )
}

export default App
