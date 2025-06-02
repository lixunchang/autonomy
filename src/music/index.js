import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, message, Slider, Popover } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  StepForwardOutlined, 
  StepBackwardOutlined,
  RetweetOutlined,
  SoundOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  SwapOutlined,
  PictureOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  CloudSyncOutlined  // 导入随机播放图标
} from '@ant-design/icons';
import styles from './index.less';

const { remote } = window.require('electron');
const fs = window.require('fs');
const path = window.require('path');

// 添加支持的音频格式
const SUPPORTED_FORMATS = ['.mp3', '.wav', '.ogg', '.m4a'];
const IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

const PlayMode = {
  ORDER: 'ORDER',
  SINGLE: 'SINGLE',
  RANDOM: 'RANDOM'
};

const Music = () => {
  const [musicList, setMusicList] = useState([]);
  const [currentMusic, setCurrentMusic] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(100);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playMode, setPlayMode] = useState(PlayMode.ORDER);
  const [imageList, setImageList] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [lastMusicDir, setLastMusicDir] = useState('');
  const [lastImageDir, setLastImageDir] = useState('');
  const audioRef = useRef(null);

  const getAllAudioFiles = (dirPath) => {
    let results = [];
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results = results.concat(getAllAudioFiles(filePath));
      } else {
        const ext = path.extname(filePath).toLowerCase();
        if (SUPPORTED_FORMATS.includes(ext)) {
          results.push({
            path: filePath,
            name: path.basename(filePath),
            id: path.basename(filePath)
          });
        }
      }
    });
    
    return results;
  };

  const getAllImageFiles = (dirPath) => {
    let results = [];
    try {
      const files = fs.readdirSync(dirPath);
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          results = results.concat(getAllImageFiles(filePath));
        } else {
          const ext = path.extname(filePath).toLowerCase();
          if (IMAGE_FORMATS.includes(ext)) {
            results.push({
              path: filePath,
              name: path.basename(filePath),
              id: path.basename(filePath)
            });
          }
        }
      });
    } catch (error) {
      console.error('读取图片文件失败:', error);
    }
    return results;
  };

  // 加载上次的文件夹内容
  useEffect(() => {
    const musicDir = localStorage.getItem('lastMusicDir');
    const imageDir = localStorage.getItem('lastImageDir');
    const lastMusicIndex = parseInt(localStorage.getItem('lastMusicIndex') || '0');
    const lastImageIndex = parseInt(localStorage.getItem('lastImageIndex') || '0');
    
    if (musicDir) {
      setLastMusicDir(musicDir);
      const musicFiles = getAllAudioFiles(musicDir);
      if (musicFiles.length > 0) {
        setMusicList(musicFiles);
        // 播放上次的音乐
        playMusic(musicFiles[Math.min(lastMusicIndex, musicFiles.length - 1)]);
      }
    }
    
    if (imageDir) {
      setLastImageDir(imageDir);
      const imageFiles = getAllImageFiles(imageDir);
      if (imageFiles.length > 0) {
        setImageList(imageFiles);
        // 恢复上次的图片索引
        setCurrentImage(Math.min(lastImageIndex, imageFiles.length - 1));
        setIsAutoPlay(true);
      }
    }
  }, []);

  // 记录当前音乐索引
  useEffect(() => {
    if (currentMusic && musicList.length > 0) {
      const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
      if (currentIndex !== -1) {
        localStorage.setItem('lastMusicIndex', currentIndex.toString());
      }
    }
  }, [currentMusic?.id]);

  // 记录当前图片索引
  useEffect(() => {
    if (imageList.length > 0) {
      localStorage.setItem('lastImageIndex', currentImage.toString());
    }
  }, [currentImage]);

  const importMusic = () => {
    remote.dialog.showOpenDialog({
      title: '请选择音乐文件夹',
      properties: ['openDirectory'],
      defaultPath: lastMusicDir
    }).then(({ filePaths }) => {
      if (filePaths && filePaths.length > 0) {
        const dirPath = filePaths[0];
        localStorage.setItem('lastMusicDir', dirPath);
        setLastMusicDir(dirPath);
        
        const musicFiles = getAllAudioFiles(dirPath);
        if (musicFiles.length > 0) {
          setMusicList(prev => {
            const newList = [...prev, ...musicFiles];
            // 如果当前没有播放音乐,自动播放第一首
            if (!currentMusic) {
              playMusic(newList[0]);
            }
            return newList;
          });
          message.success(`成功导入 ${musicFiles.length} 个音频文件`);
        } else {
          message.warning('未找到音频文件');
        }
      }
    });
  };

  const importImages = () => {
    remote.dialog.showOpenDialog({
      title: '请选择图片文件夹',
      properties: ['openDirectory'],
      defaultPath: lastImageDir
    }).then(({ filePaths }) => {
      if (filePaths && filePaths.length > 0) {
        const dirPath = filePaths[0];
        localStorage.setItem('lastImageDir', dirPath);
        setLastImageDir(dirPath);
        
        const imageFiles = getAllImageFiles(dirPath);
        if (imageFiles.length > 0) {
          setImageList(prev => [...prev, ...imageFiles]);
          setIsAutoPlay(true);
          message.success(`成功导入 ${imageFiles.length} 张图片`);
        } else {
          message.warning('未找到图片文件');
        }
      }
    });
  };

  const playMusic = (music) => {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(music.path)) {
        message.error('音频文件不存在');
        return;
      }

      setCurrentMusic(music);
      setIsPlaying(true);
      // 将本地文件路径转换为 URL
      audioRef.current.src = `file://${music.path}`;
      
      const playPromise = audioRef.current.play();
      if (playPromise) {
        playPromise.catch(error => {
          console.error('播放失败:', error);
          message.error('音频播放失败');
          setIsPlaying(false);
        });
      }
    } catch (error) {
      console.error('播放出错:', error);
      message.error('音频加载失败');
      setIsPlaying(false);
    }
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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
  };

  const handleProgressChange = (value) => {
    const time = (value / 100) * duration;
    audioRef.current.currentTime = time;
    setProgress(value);
  };

  const handleVolumeChange = (value) => {
    if (!audioRef.current) return;
    const volumeValue = value / 100;
    audioRef.current.volume = volumeValue;
    setVolume(value);
  };

  const handleModeChange = () => {
    const modes = Object.values(PlayMode);
    const currentIndex = modes.indexOf(playMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setPlayMode(nextMode);
  };

  const playNext = () => {
    if(!currentMusic || musicList.length === 0) return;
    
    let nextIndex;
    switch(playMode) {
      case PlayMode.SINGLE:
        nextIndex = musicList.findIndex(m => m.id === currentMusic.id);
        break;
      case PlayMode.RANDOM:
        nextIndex = Math.floor(Math.random() * musicList.length);
        break;
      default:
        const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
        nextIndex = (currentIndex + 1) % musicList.length;
    }
    playMusic(musicList[nextIndex]);
  };

  const playPrev = () => {
    if(!currentMusic || musicList.length === 0) return;
    const currentIndex = musicList.findIndex(m => m.id === currentMusic.id);
    const prevIndex = (currentIndex - 1 + musicList.length) % musicList.length;
    playMusic(musicList[prevIndex]);
  };

  useEffect(() => {
    let timer;
    if (isAutoPlay && imageList.length > 0) {
      timer = setInterval(() => {
        setCurrentImage(prev => (prev + 1) % imageList.length);
      }, 5000); // 每5秒切换一次图片
    }
    return () => timer && clearInterval(timer);
  }, [isAutoPlay, imageList.length]);

  const clearPlaylist = () => {
    setMusicList([]);
    setCurrentMusic(null);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);
    setCurrentTime(0);
    audioRef.current.src = '';
    audioRef.current.load();
    setShowPlaylist(false);
    localStorage.removeItem('lastMusicIndex');
  };

  return (
    <div className={styles.MusicGallery}>
      {showPlaylist && (
        <div className={styles.playlistOverlay} onClick={() => setShowPlaylist(false)}>
          <div className={styles.playlistContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.playlistHeader}>
              <span>播放列表 ({musicList.length})</span>
              <Button 
                type="text" 
                icon={<DeleteOutlined />}
                onClick={clearPlaylist}
                className={styles.clearBtn}
              >
                清空
              </Button>
            </div>
            <div className={styles.playlist}>
              {musicList.map((music, index) => (
                <div 
                  key={music.id}
                  className={`${styles.playlistItem} ${currentMusic?.id === music.id ? styles.playing : ''}`}
                  onClick={() => playMusic(music)}
                >
                  {currentMusic?.id === music.id && <SoundOutlined />}
                  <span>{music.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className={styles.imageContainer}>
        {imageList.length > 0 ? (
          <img 
            src={`file://${imageList[currentImage].path}`} 
            alt={imageList[currentImage].name}
            className={styles.galleryImage}
          />
        ) : (
          <div className={styles.emptyState} onClick={importImages}>
            <PictureOutlined style={{fontSize: 34}}/>
            <div>点击选择图片</div>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.playerInfo}>
          <div className={styles.progressBar}>
            <Slider 
              value={progress} 
              onChange={handleProgressChange}
              className={styles.slider}
              tooltip={{ formatter: null }}  // 隐藏悬浮提示
              step={0.1}  // 增加精度
            />
            <span className={styles.time}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className={styles.playerControls}>
            <div className={styles.leftControls}>
              <Button 
                type="text" 
                icon={<UnorderedListOutlined />}
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={styles.controlIcon}
                style={{ border: 'none', padding: 0, color: 'inherit' }}
              />
              <div 
                className={`${styles.musicInfo} ${!currentMusic ? styles.empty : ''}`}
                onClick={() => {
                  if (!currentMusic) {
                    importMusic();
                  }
                }}
              >
                {currentMusic?.name || '点击选择音乐'}
              </div>
            </div>
            <div className={styles.buttons}>
              <StepBackwardOutlined className={styles.controlIcon} onClick={playPrev} />
              {isPlaying ? 
                <PauseCircleOutlined className={styles.controlIcon} onClick={togglePlay} /> :
                <PlayCircleOutlined className={styles.controlIcon} onClick={togglePlay} />
              }
              <StepForwardOutlined className={styles.controlIcon} onClick={playNext} />
            </div>
            
            <div className={styles.volume}>
              <SoundOutlined />
              <Slider 
                min={0}
                max={100}
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                tooltip={{formatter: (value) => `${value}%`}}
              />
              <Button 
                type="text" 
                icon={
                  playMode === PlayMode.SINGLE ? <RetweetOutlined /> :
                  playMode === PlayMode.RANDOM ? <CloudSyncOutlined /> :
                  <SwapOutlined />
                }
                onClick={handleModeChange}
                className={`${styles.controlIcon} ${styles.listButton}`}
                style={{ border: 'none', padding: 0, color: 'inherit' }}
              />
            </div>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onEnded={playNext}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current.duration)}
        onError={(e) => {
          console.error('音频错误:', e);
          // 只有在存在当前音乐时才提示错误
          if (currentMusic) {
            message.error('音频加载失败');
            setIsPlaying(false);
          }
        }}
      />
    </div>
  );
};

export default Music;
