import React, {useRef, useState} from "react";
import TetrisField from "../TetrisField/TetrisField";
import {Transition} from "react-transition-group";
import config from "../config.json";
import Popup from "../popup/Popup";

export default (props) => {
    const [toggle, setToggle] = useState(true)
    const [temp, rerender] = useState(true) //using this state only to rerender component
    const gameOver = useRef(false)
    const scoreTable = useRef()
    const devMode = config.devMode
    let value = null;
    let setValue = null;
    let arr = []
    let currentFigure = 0
    let figurePos = {
        x: 0,
        y: 0,
        angle: 0,
        reset: function () {
            this.x = 0
            this.y = 0
        }
    }
    let childRendered = true
    const log = (value) => {
        if (devMode)
            console.log(value)
    }

    const onChildMount = (dataFromChild) => {
        childRendered = true
        value = dataFromChild[0];
        setValue = (value) => {
            childRendered = false
            dataFromChild[1](value)
        };

        if (!value) {
            for (let row = -2; row < 20; row++) {
                arr[row] = [];
                for (let col = 0; col < 10; col++) {
                    arr[row][col] = 0;
                }
            }
            setValue(arr)
        }
    };


    const loopId = setInterval(() => {
        if (!gameOver.current) {
            tick()

        }
    }, 1000)


    function tick() {
        if (!childRendered)
            return false
        if (!currentFigure) {
            currentFigure = figures[Math.trunc(Math.random() * figures.length)]
            addFigure()
        } else
            moveDown()


    }

    const getValue = () => {
        const arr = []
        for (let row = -2; row < 20; row++) {
            arr[row] = [];
            for (let col = 0; col < 10; col++) {
                arr[row][col] = value[row][col];
            }
        }
        return arr
    }


    const addFigure = () => {
        log('adding new figure, it is', currentFigure, 'now field is', value)
        const field = getValue()
        log('был', value, 'стал', field)
        const places = 10 - currentFigure[0].length
        const start = Math.trunc(Math.random() * (places + 1))
        figurePos.x = start
        figurePos.y = -2
        for (let i = 0; i < currentFigure.length; i++) {
            for (let j = 0; j < currentFigure[0].length; j++) {
                if ((field[i - 2][start + j] === 0) && (currentFigure[i][j] === 1)) {
                    field[i - 2][start + j] = 2
                }
            }
        }
        log('%c123', 'color:yellow');
        setValue(field)
    }


    const moveDown = () => {
        log(figurePos.x, figurePos.y)
        const field = getValue()

        const checkFigure = () => {
            for (let row = field.length - 1; row >= -2; row--) {
                for (let col = field[0].length - 1; col >= 0; col--) {
                    if (field[row][col] === 2 && (!field[row + 1] || field[row + 1][col] === 1)) {
                        return false
                    }
                }
            }
            return true
        }


        if (checkFigure()) {
            for (let row = field.length - 1; row >= -2; row--) {
                for (let col = field[0].length - 1; col >= 0; col--) {
                    if (field[row][col] === 2) {
                        field[row + 1][col] = 2
                        field[row][col] = 0

                    }
                }
            }
            figurePos.y++
        }
        if (!checkFigure()) {
            log('removing figure')
            log(Number(scoreTable.current.innerText.split(' ')[1]), 'это вот')
            scoreTable.current.innerText = 'Score: ' + (Number(scoreTable.current.innerText.split(' ')[1]) + 1)
            currentFigure = 0
            for (let row = field.length - 1; row >= -2; row--) {
                for (let col = field[0].length - 1; col >= 0; col--) {
                    if (field[row][col] === 2)
                        field[row][col] = 1
                }
            }
            figurePos.reset()
            log('removed,field is', field)

            if (field[-1].includes(1) || field[-2].includes(1)) {
                gameOver.current = true
                log('game over')
                clearInterval(loopId)
                window.removeEventListener('keydown', keyPressHandler, false)
                rerender(!temp)
                return 0
            }

            setTimeout(tick)
        }
        setValue(checkClear(field))
    }


    const figures = [
        [[0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]],

        [[0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]],

        [[0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]],

        [[1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]],

        [[1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]],

        [[1, 1],
            [1, 1]],

        [[0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0]],
    ]


    let y = document.documentElement.clientHeight
    const cellSize = y / 25
    const style = {
        height: cellSize * 20,
        width: cellSize * 10
    }

    const checkClear = (field) => {
        for (let row = 0; row < field.length; row++) {
            if (field[row].every(elem => elem === 1)) {
                log('надо удалить ряд', row)
                for (let i = row; i > -2; i--) {
                    field[i] = field[i - 1]
                }
            }

        }
        return field
    }


    function rotate() {
        let tempFigure = currentFigure[0].map((val, index) => currentFigure.map(row => row[index]).reverse())
        log(tempFigure)
        const field = getValue()
        for (let row = field.length - 1; row >= -2; row--) {
            for (let col = field[0].length - 1; col >= 0; col--) {
                if (field[row][col] === 2)
                    field[row][col] = 0
            }
        }
        log('checking from', figurePos.x, figurePos.y, 'to', figurePos.x + tempFigure.length - 1, figurePos.y + tempFigure.length - 1)
        for (let row = figurePos.y; row < figurePos.y + tempFigure.length; row++) {
            for (let col = figurePos.x; col < figurePos.x + tempFigure.length; col++) {
                if ((!field[row]) || (field[row][col] !== 0))
                    return false
            }
        }

        for (let row = figurePos.y; row < figurePos.y + tempFigure.length; row++) {
            for (let col = figurePos.x; col < figurePos.x + tempFigure.length; col++) {
                field[row][col] = tempFigure[row - figurePos.y][col - figurePos.x] * 2
            }
        }
        currentFigure = tempFigure
        setValue(field)
        return true
    }


    const close = () => {
        window.removeEventListener('keydown', keyPressHandler, false)
        clearInterval(loopId)
        setToggle(!toggle)
    }

    function MoveSide(Side) {
        if (!value || gameOver.current || !currentFigure || !childRendered)
            return false

        const dir = Side === 'left' ? -1 : 1
        log('value сейчас', value)
        const field = getValue()
        log('для движения получили', field)
        for (let row = field.length - 1; row >= -2; row--) {
            for (let col = field[0].length - 1; col >= 0; col--) {
                if (field[row][col] === 2 && !((field[row][col + dir] === 0) || (field[row][col + dir] === 2))) {
                    return false
                }
            }
        }
        switch (Side) {
            case 'left':
                for (let row = -2; row < field.length; row++) {
                    for (let col = 0; col < field[0].length; col++) {
                        if (field[row][col] === 2) {
                            field[row][col - 1] = 2
                            field[row][col] = 0
                        }
                    }
                }
                figurePos.x--
                setValue(field)
                break
            case 'right':
                for (let row = field.length - 1; row >= -2; row--) {
                    for (let col = field[0].length - 1; col >= 0; col--) {
                        if (field[row][col] === 2) {
                            field[row][col + 1] = 2
                            field[row][col] = 0
                        }
                    }
                }
                figurePos.x++
                setValue(field)
                break
            default:
        }
    }

    function keyPressHandler(event) {
        if ((event.key === 'ArrowUp') && (currentFigure))
            log('rotate', rotate())
        if (event.key === 'ArrowDown') {
            if (currentFigure && !gameOver.current && childRendered)
                moveDown()
        }
        if (event.key === 'ArrowLeft') {
            MoveSide('left')
        }
        if (event.key === 'ArrowRight') {
            MoveSide('right')

        }
    }

    const restart = () => {
        log('restarting')
        scoreTable.current.innerText = 'Score: 0'
        for (let row = -2; row < 20; row++) {
            arr[row] = [];
            for (let col = 0; col < 10; col++) {
                arr[row][col] = 0;
            }
        }
        setValue(arr)
        currentFigure = 0
        figurePos.reset()
        gameOver.current = false
        window.removeEventListener('keydown', keyPressHandler, false)
        clearInterval(loopId)
        rerender(!temp)
    }
    window.addEventListener('keydown', keyPressHandler, false)

    let popupProps = {
        restart: restart,
        exit: close,
        score: gameOver.current && Number(scoreTable.current.innerText.split(' ')[1]),
        from: "tetris"
    }

    return (
        <Transition in={toggle} timeout={690} unmountOnExit onExited={() => {
            window.removeEventListener('keydown', keyPressHandler, false)
            clearInterval(loopId)
            props.goBack()
        }}>
            {state =>
                <div className={`tetris ${state}`}>
                    <div className='tetris-wrapper' style={style}>
                        <h1 style={{color: 'white', margin: 0}} ref={scoreTable} className={'scoreText'}>Score: 0</h1>
                        <TetrisField cellSize={cellSize} onMount={onChildMount}>

                        </TetrisField>
                        <button className='back-btn' onClick={close}> </button>

                        {gameOver.current ?
                            <Popup args={popupProps}> </Popup>
                            : null}
                    </div>
                </div>}
        </Transition>)
}