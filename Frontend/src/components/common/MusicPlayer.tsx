import React, { useRef, useState } from 'react';
import { IconButton } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import bgMusic from '../../assets/bg-music.mp3';

const MusicPlayer: React.FC = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const toggleMusic = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <>
            <IconButton
                onClick={toggleMusic}
                sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    },
                }}
            >
                {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <audio ref={audioRef} src={bgMusic} loop />
        </>
    );
};

export default MusicPlayer;
