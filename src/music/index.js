import React, { useState, useRef } from 'react';
import { Input, Button, message } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, StepBackwardOutlined } from '@ant-design/icons';
import styles from './index.less';

const { remote } = window.require('electron');
const path = window.require('path');

const Music = () => {
  const [musicList, setMusicList] = useState([]);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const importMusic = () => {
    remote.dialog.showOpenDialog({
      title: '选择音乐文件',
      filters: [
        { name: '音频文件', extensions: ['mp3', 'wav', 'ogg', 'm4a'] }
      ],
      properties: ['openFile', 'multiSelections']
    }).then(({ filePaths }) => {
      if(filePaths && filePaths.length > 0) {
        const newMusicList = filePaths.map(filePath => ({
          path: filePath,
          name: path.basename(filePath),
          id: path.basename(filePath)
        }));
        setMusicList([...musicList, ...newMusicList]);
      }
    });
  };

  const playMusic = (music) => {
    setCurrentMusic(music);
    setIsPlaying(true);
    audioRef.current.src = music.path;
    audioRef.current.play();
  };

  const togglePlay = () => {
    if(!currentMusic) {
      message.warning('请先选择音乐');
      return;
    }
    if(isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if(!currentMusic || musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
    const nextIndex = (currentIndex + 1) % musicList.length;
    playMusic(musicList[nextIndex]);
  };

  const playPrev = () => {
    if(!currentMusic || musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    playMusic(musicList[prevIndex]);
  };

  return (
    <div className={styles.Music}>
      <div className={styles.controls}>
        <Button type="primary" onClick={importMusic}>
          导入音乐
        </Button>
        <div className={styles.playerControls}>
          <StepBackwardOutlined className={styles.controlIcon} onClick={playPrev} />
          {isPlaying ? 
            <PauseCircleOutlined className={styles.controlIcon} onClick={togglePlay} /> :
            <PlayCircleOutlined className={styles.controlIcon} onClick={togglePlay} />
          }
          <StepForwardOutlined className={styles.controlIcon} onClick={playNext} />
        </div>
        <div className={styles.nowPlaying}>
          当前播放: {currentMusic?.name || '未选择音乐'}
        </div>
      </div>
      
      <div className={styles.musicList}>
        {musicList.map(music => (
          <div 
            key={music.id}
            className={`${styles.musicItem} ${currentMusic?.id === music.id ? styles.active : ''}`}
            onClick={() => playMusic(music)}
          >
            {music.name}
          </div>
        ))}
      </div>

      <audio 
        ref={audioRef}
        onEnded={playNext}
      />
    </div>
  );
};

export default Music;
