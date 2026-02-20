import React, { useRef, useEffect } from 'react';

const Game = ({ gameState, setGameState, score, setScore, highScore, character, theme }) => {
    const canvasRef = useRef(null);
    const requestRef = useRef();

    // Game constants (Refs to avoid re-renders)
    const stats = useRef({
        frame: 0,
        birdY: 350,
        birdVelocity: 0,
        birdRotation: 0,
        pipes: [],
        lastScore: 0
    });

    const GRAVITY = 0.25;
    const JUMP_STRENGTH = -5.5;
    const PIPE_WIDTH = 60;
    const PIPE_GAP = 160;
    const PIPE_SPAWN_INTERVAL = 100;
    const BIRD_SIZE = 34;

    const handleJump = () => {
        if (gameState !== 'PLAYING') return;
        stats.current.birdVelocity = JUMP_STRENGTH;
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-player-jumping-in-a-video-game-2043.mp3').play().catch(() => { });
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.code === 'Space' || e.code === 'ArrowUp') && gameState === 'PLAYING') {
                handleJump();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState]);

    const update = () => {
        const s = stats.current;
        s.frame++;

        // Physics
        s.birdVelocity += GRAVITY;
        s.birdY += s.birdVelocity;
        s.birdRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, s.birdVelocity * 0.1));

        // Collision
        if (s.birdY + BIRD_SIZE / 2 > 700 || s.birdY - BIRD_SIZE / 2 < 0) {
            return gameOver();
        }

        // Pipes
        if (s.frame % PIPE_SPAWN_INTERVAL === 0) {
            const minH = 50;
            const maxH = 700 - PIPE_GAP - minH;
            const topHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
            s.pipes.push({ x: 400, topHeight, passed: false });
        }

        s.pipes.forEach((pipe, index) => {
            const speed = 2 + Math.floor(s.lastScore / 10) * 0.5;
            pipe.x -= speed;

            // Score
            if (!pipe.passed && pipe.x + PIPE_WIDTH < 100) {
                pipe.passed = true;
                s.lastScore++;
                setScore(s.lastScore);
                new Audio('https://assets.mixkit.co/sfx/preview/mixkit-video-game-faint-click-2052.mp3').play().catch(() => { });
            }

            // Collision
            const birdX = 100;
            const r = BIRD_SIZE / 2 - 5;
            if (
                birdX + r > pipe.x &&
                birdX - r < pipe.x + PIPE_WIDTH &&
                (s.birdY - r < pipe.topHeight || s.birdY + r > pipe.topHeight + PIPE_GAP)
            ) {
                return gameOver();
            }

            if (pipe.x + PIPE_WIDTH < 0) s.pipes.splice(index, 1);
        });
    };

    const draw = (ctx) => {
        const s = stats.current;
        ctx.clearRect(0, 0, 400, 700);

        // Pipes
        s.pipes.forEach(pipe => {
            const isNight = theme === 'night';
            ctx.fillStyle = isNight ? '#27ae60' : '#2ecc71';
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
            ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, 700);

            ctx.fillStyle = isNight ? '#219150' : '#27ae60';
            ctx.fillRect(pipe.x - 2, pipe.topHeight - 20, PIPE_WIDTH + 4, 20);
            ctx.fillRect(pipe.x - 2, pipe.topHeight + PIPE_GAP, PIPE_WIDTH + 4, 20);
        });

        // Bird
        ctx.save();
        ctx.translate(100, s.birdY);
        ctx.rotate(s.birdRotation);
        ctx.font = `${BIRD_SIZE}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(character, 0, 0);
        ctx.restore();
    };

    const gameOver = () => {
        setGameState('GAME_OVER');
        new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-retro-changing-tab-206.mp3').play().catch(() => { });
        return false;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const loop = () => {
            if (gameState === 'PLAYING') {
                update();
                draw(ctx);
                requestRef.current = requestAnimationFrame(loop);
            } else {
                draw(ctx);
            }
        };

        if (gameState === 'START') {
            stats.current = { frame: 0, birdY: 350, birdVelocity: 0, birdRotation: 0, pipes: [], lastScore: 0 };
            setScore(0);
        }

        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [gameState, character, theme]);

    return <canvas ref={canvasRef} width={400} height={700} onPointerDown={handleJump} />;
};

export default Game;
