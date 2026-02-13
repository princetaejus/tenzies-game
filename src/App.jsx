import { useState, useRef, useEffect } from "react"
import Die from "./component/Die"
import { nanoid } from "nanoid"
import Confetti from "react-confetti"

export default function App() {
    const [dice, setDice] = useState(() => generateAllNewDice())
    const [rollCount, setRollCount] = useState(0)
    const [time, setTime] = useState(0)
    const [bestScore, setBestScore] = useState(() => {
        const saved = localStorage.getItem('tenziesBestScore')
        return saved ? JSON.parse(saved) : { rolls: Infinity, time: Infinity }
    })
    
    const buttonRef = useRef(null)
    const timerRef = useRef(null)

    const gameWon = dice.every(die => die.isHeld) &&
        dice.every(die => die.value === dice[0].value)
    
    // Focus button when game is won
    useEffect(() => {
        if (gameWon) {
            buttonRef.current.focus()
            
            // Stop timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
            
            // Check if new best score
            if (rollCount < bestScore.rolls || 
                (rollCount === bestScore.rolls && time < bestScore.time)) {
                const newBest = { rolls: rollCount, time: time }
                setBestScore(newBest)
                localStorage.setItem('tenziesBestScore', JSON.stringify(newBest))
            }
        }
    }, [gameWon])
    
    // Timer effect
    useEffect(() => {
        if (!gameWon && rollCount > 0) {
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1)
            }, 1000)
        }
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [gameWon, rollCount])

    function generateAllNewDice() {
        return new Array(10)
            .fill(0)
            .map(() => ({
                value: Math.ceil(Math.random() * 6),
                isHeld: false,
                id: nanoid()
            }))
    }
    
    function rollDice() {
        if (!gameWon) {
            setDice(oldDice => oldDice.map(die =>
                die.isHeld ?
                    die :
                    { ...die, value: Math.ceil(Math.random() * 6) }
            ))
            setRollCount(prev => prev + 1)
        } else {
            // Reset game
            setDice(generateAllNewDice())
            setRollCount(0)
            setTime(0)
        }
    }

    function hold(id) {
        setDice(oldDice => oldDice.map(die =>
            die.id === id ?
                { ...die, isHeld: !die.isHeld } :
                die
        ))
    }

    const diceElements = dice.map(dieObj => (
        <Die
            key={dieObj.id}
            value={dieObj.value}
            isHeld={dieObj.isHeld}
            hold={() => hold(dieObj.id)}
        />
    ))

    return (
        <main>
            {gameWon && <Confetti />}
            
            <div aria-live="polite" className="sr-only">
                {gameWon && (
                    <p>
                        Congratulations! You won in {rollCount} rolls and {time} seconds! 
                        Press "New Game" to start again.
                    </p>
                )}
            </div>
            
            <h1 className="title">Tenzies</h1>
            <p className="instructions">
                Roll until all dice are the same. Click each die to freeze it at its 
                current value between rolls.
            </p>
            
            {/* Stats Display */}
            <div className="stats-container">
                {rollCount > 0 && !gameWon && (
                    <div className="current-stats">
                        <p className="stat">
                            <span className="stat-label">Rolls:</span> 
                            <span className="stat-value">{rollCount}</span>
                        </p>
                        <p className="stat">
                            <span className="stat-label">Time:</span> 
                            <span className="stat-value">{time}s</span>
                        </p>
                    </div>
                )}
                
                {bestScore.rolls !== Infinity && (
                    <div className="best-score">
                        <p className="stat best">
                            <span className="stat-label">🏆 Best:</span> 
                            <span className="stat-value">
                                {bestScore.rolls} rolls in {bestScore.time}s
                            </span>
                        </p>
                    </div>
                )}
            </div>
            
            <div className="dice-container">
                {diceElements}
            </div>
            
            <button 
                ref={buttonRef} 
                className="roll-dice" 
                onClick={rollDice}
            >
                {gameWon ? "New Game" : "Roll"}
            </button>
            
            {gameWon && (
                <div className="win-message">
                    <p>🎉 You won in <strong>{rollCount}</strong> rolls 
                       and <strong>{time}</strong> seconds!</p>
                    {rollCount === bestScore.rolls && time === bestScore.time && (
                        <p className="new-record">✨ New Record! ✨</p>
                    )}
                </div>
            )}
        </main>
    )
}