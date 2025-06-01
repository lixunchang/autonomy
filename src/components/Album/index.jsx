import React, { useState, useEffect, useRef } from 'react';
import { Image, Row, Col, Button, Upload, message, Segmented, Input, Modal, Popconfirm, Slider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PictureOutlined, FolderOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import fileHelper from '../../utils/fileHelper';
import styles from './index.less'; // 引入样式文件
const { join } = window.require('path');

const Album = ({ activeFile, onChange }) => {
  const [mode, setMode] = useState('albums'); // 'albums' 或 'all'
  const [visible, setVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);  // 添加这行
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [aspect, setAspect] = useState(null); // 添加宽高比状态
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (activeFile.body) {
      try {
        const data = JSON.parse(activeFile.body);
        setImages(data.images || []);
        setAlbums(data.albums || []);
      } catch(e) {
        setImages([]);
        setAlbums([]);
      }
    }
  }, [activeFile.body]);

  const saveData = async (newImages, newAlbums) => {
    // 保存到 activeFile
    onChange(activeFile.id, {
      images: newImages || images,
      albums: newAlbums || albums
    });
    
    // 保存每个相册的数据到相应文件夹
    const albumsPath = join(activeFile.path, '../albums');
    await fileHelper.writeFile(join(albumsPath, 'albums.json'), newAlbums || albums);
  };

  const handleCreateAlbum = async () => {
    if (!newAlbumName) return;
    const albumPath = join(activeFile.path, '../albums', newAlbumName);
    
    // 创建相册文件夹
    await fileHelper.mkdirIfNotExists(albumPath);
    
    const newAlbum = {
      id: Date.now(),
      name: newAlbumName,
      path: albumPath,
      images: []
    };
    const newAlbums = [...albums, newAlbum];
    await saveData(images, newAlbums);
    setAlbums(newAlbums);
    setIsModalVisible(false);
    setNewAlbumName('');
  };

  const handleDeleteAlbum = (albumId) => {
    const newAlbums = albums.filter(album => album.id !== albumId);
    setAlbums(newAlbums);
    saveData(images, newAlbums);
    if (currentAlbum?.id === albumId) {
      setCurrentAlbum(null);
    }
  };

  const handleUpload = async (file) => {
    try {
      const files = Array.isArray(file) ? file : [file];
      const uploadPromises = files.map(async (singleFile) => {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        reader.readAsDataURL(singleFile);
        
        const base64Data = await base64Promise;
        const fileName = `${Date.now()}_${singleFile.name}`;
        
        let imagePath;
        if (currentAlbum) {
          imagePath = join(activeFile.path, '../albums', currentAlbum.name);
        } else {
          imagePath = join(activeFile.path, 'default');
        }
        
        await fileHelper.writeImage(imagePath, fileName, base64Data);
        
        return {
          id: Date.now() + Math.random(),
          name: singleFile.name,
          url: join(imagePath, fileName)
        };
      });

      const newImages = await Promise.all(uploadPromises);

      if (currentAlbum) {
        const updatedAlbums = albums.map(album => {
          if (album.id === currentAlbum.id) {
            return {
              ...album,
              images: [...album.images, ...newImages]
            };
          }
          return album;
        });
        await saveData(images, updatedAlbums);
        setAlbums(updatedAlbums);
        setCurrentAlbum({
          ...currentAlbum,
          images: [...currentAlbum.images, ...newImages]
        });
      } else {
        const allNewImages = [...images, ...newImages];
        await saveData(allNewImages, albums);
        setImages(allNewImages);
      }
      
      return false;
    } catch (error) {
      console.error('Upload error:', error);
      message.error('上传失败：' + error.message);
      return false;
    }
  };

  const handleDelete = async (imageId) => {
    if (currentAlbum) {
      // 从相册中删除照片
      const updatedAlbums = albums.map(album => {
        if (album.id === currentAlbum.id) {
          return {
            ...album,
            images: album.images.filter(img => img.id !== imageId)
          };
        }
        return album;
      });
      
      setAlbums(updatedAlbums);
      setCurrentAlbum({
        ...currentAlbum,
        images: currentAlbum.images.filter(img => img.id !== imageId)
      });
      await saveData(images, updatedAlbums);
    } else {
      // 从全局照片中删除
      const newImages = images.filter(img => img.id !== imageId);
      setImages(newImages);
      await saveData(newImages, albums);
    }
  };

  const getAllPhotos = () => {
    return albums.reduce((allImages, album) => {
      return [...allImages, ...album.images];
    }, []);
  };

  const renderHeader = () => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginBottom: currentAlbum ? 16 : 0,
        gap: 16  // 添加间距
      }}>
        {currentAlbum ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                type="text"
                icon={<ArrowLeftOutlined />} 
                onClick={() => setCurrentAlbum(null)}
              />
              <span style={{ fontSize: 16, marginLeft: 8, fontWeight: 500 }}>{currentAlbum.name}</span>
            </div>
            <span style={{ color: '#666' }}>{currentAlbum.images.length} 张</span>
          </div>
        ) : (
          <>
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                {
                  value: 'albums',
                  icon: <FolderOutlined />,
                },
                {
                  value: 'all',
                  icon: <PictureOutlined />,
                },
              ]}
            />
            <span style={{ color: '#666' }}>
              {mode === 'albums' 
                ? `${albums.length} 个相册，${getAllPhotos().length} 张照片` 
                : `${getAllPhotos().length} 张照片`}
            </span>
          </>
        )}
      </div>
    </div>
  );

  const renderAlbums = () => (
    <Row gutter={[16, 16]}>
      {albums.map(album => (
        <Col key={album.id} span={6}>
          <div className="album-card" 
            style={{
              position: 'relative',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => setCurrentAlbum(album)}
          >
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FolderOutlined style={{ color: '#fff', fontSize: 14 }} />
            </div>
            {album.images[0] ? (
              <Image
                preview={false}
                src={'file://' + album.images[0].url}
                style={{ height: '200px', width: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderOutlined style={{ fontSize: '48px', color: '#999' }} />
              </div>
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px',
              background: 'rgba(0,0,0,0.45)',
              color: '#fff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{album.name}</span>
                <Popconfirm
                  title="删除相册"
                  description="确定要删除这个相册吗？相册内的照片将会被删除"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDeleteAlbum(album.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="删除"
                  cancelText="取消"
                  okType="danger"
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                >
                  <Button
                    type="text"
                    icon={<DeleteOutlined />}
                    style={{color: '#fff'}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
              <div style={{ fontSize: '12px' }}>{album.images.length} 张照片</div>
            </div>
          </div>
        </Col>
      ))}
      <Col span={6}>
        <div 
          className="album-card" 
          style={{
            position: 'relative',
            border: '1px dashed #d9d9d9',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            height: '202px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999'
          }}
          onClick={() => setIsModalVisible(true)}
        >
          <PlusOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
          <div>新建相册</div>
        </div>
      </Col>
    </Row>
  );

  const displayImages = currentAlbum 
    ? currentAlbum.images 
    : (mode === 'all' ? getAllPhotos() : images);

  const renderContent = () => {
    if (mode === 'albums' && !currentAlbum) {
      return renderAlbums();
    }
    
    return (
      <Row gutter={[16, 16]}>
        {mode !== 'all' && (
          <Col span={6}>
            <Upload
              className={styles['upload-button']}
              listType="picture-card"
              showUploadList={false}
              multiple
              beforeUpload={(file, fileList) => {
                handleUpload(fileList);
                return false;
              }}
            >
              <PlusOutlined style={{ fontSize: '32px', marginBottom: '8px', color: '#bfbfbf' }} />
              <div style={{ color: '#bfbfbf' }}>上传图片</div>
            </Upload>
          </Col>
        )}
        {displayImages.map(image => (
          <Col key={image.id} span={6}>
            <div className="album-card" style={{
              position: 'relative',
              border: '1px solid #d9d9d9',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <Image
                preview={{ visible: false }}
                src={'file://'+image.url}
                style={{ objectFit: 'cover', height: '200px', width: '100%' }}
                onClick={() => {
                  setCurrentImage(image);
                  setVisible(true);
                }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '8px',
                background: 'rgba(0,0,0,0.45)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  style={{color: '#fff'}}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCropImage(image);
                    setCropModalVisible(true);
                  }}
                />
                <Popconfirm
                  title="确定要删除吗？"
                  description="确定要删除这张照片吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(image.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="删除"
                  cancelText="取消"
                  okType="danger"
                  placement="bottomRight"
                  arrow={{ pointAtCenter: true }}
                >
                  <Button 
                    type="text" 
                    icon={<DeleteOutlined />} 
                    style={{color: '#fff'}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Popconfirm>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    );
  };

  const handleCrop = async () => {
    if (!imgRef.current || !completedCrop) return;

    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    const base64Data = canvas.toDataURL('image/jpeg');
    const fileName = `${Date.now()}_cropped.jpg`;
    const imagePath = cropImage.url.substring(0, cropImage.url.lastIndexOf('/'));
    
    try {
      await fileHelper.writeImage(imagePath, fileName, base64Data);
      
      const newImage = {
        id: Date.now(),
        name: fileName,
        url: join(imagePath, fileName)
      };

      if (currentAlbum) {
        const updatedAlbums = albums.map(album => {
          if (album.id === currentAlbum.id) {
            return {
              ...album,
              images: album.images.map(img => 
                img.id === cropImage.id ? newImage : img
              )
            };
          }
          return album;
        });
        setAlbums(updatedAlbums);
        setCurrentAlbum({
          ...currentAlbum,
          images: currentAlbum.images.map(img => 
            img.id === cropImage.id ? newImage : img
          )
        });
        await saveData(images, updatedAlbums);
      } else {
        const newImages = images.map(img => 
          img.id === cropImage.id ? newImage : img
        );
        setImages(newImages);
        await saveData(newImages, albums);
      }

      setCropModalVisible(false);
      message.success('裁剪成功');
    } catch (error) {
      message.error('裁剪失败：' + error.message);
    }
  };

  const aspectRatios = [
    { label: '自由', value: null },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16/9 },
    { label: '9:16', value: 9/16 },
    { label: '4:3', value: 4/3 },
  ];

  const centerCropArea = (ratio = null) => {
    if (!ratio) {
      return {
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25
      };
    }

    if (!imgRef.current || !imageLoaded) {
      return null;
    }
    // debugger
    const image = imgRef.current;
    const imageWidth = image.naturalWidth;
    const imageHeight = image.naturalHeight;
    const imageAspect = imageWidth / imageHeight;

    let width = 50;
    let height = 50;

    if (ratio < 1) {
      // 如果目标比例比图片更宽，以高度为基准
      height = 50;
      width = height * ratio / imageAspect; //width = rate*(height*imageHeight)/imageWidth
    } else {
      // 如果目标比例比图片更窄，以宽度为基准
      width = 50;
      height = (width / ratio) * imageAspect; // (width*imageWidth) / (ratio*imageHeight); //// 50*imageWidth)/(16/9)/imageHeight
    }

    return {
      unit: '%',
      width,
      height,
      x: (100 - width) / 2,
      y: (100 - height) / 2
    };
  };

  const handleAspectChange = (ratio) => {
    setAspect(ratio);
    const newCrop = centerCropArea(ratio);
    if (newCrop) {
      setCrop(newCrop);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    if (aspect) {
      const newCrop = centerCropArea(aspect);
      if (newCrop) {
        setCrop(newCrop);
      }
    }
  };

  return (
    <div style={{ height: '100%', padding: '20px', overflow: 'auto', backgroundColor: '#fff' }}>
      {renderHeader()}
      {renderContent()}
      
      <Modal
        title="新建相册"
        okText="创建"
        cancelText="取消"
        open={isModalVisible}
        onOk={handleCreateAlbum}
        onCancel={() => {
          setIsModalVisible(false);
          setNewAlbumName('');
        }}
      >
        <Input
          placeholder="请输入相册名称"
          value={newAlbumName}
          onChange={e => setNewAlbumName(e.target.value)}
        />
      </Modal>
      
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup 
          preview={{
            visible,
            onVisibleChange: vis => setVisible(vis),
            current: currentImage ? displayImages.findIndex(img => img.id === currentImage.id) : 0
          }}
        >
          {displayImages.map(image => (
            <Image key={image.id} src={'file://' + image.url} />
          ))}
        </Image.PreviewGroup>
      </div>

      <Modal
        title="裁剪图片"
        open={cropModalVisible}
        onOk={handleCrop}
        onCancel={() => {
          setCropModalVisible(false);
          setCropImage(null);
          setCrop({
            unit: '%',
            width: 50,
            height: 50,
            x: 25,
            y: 25
          });
          setAspect(null);
          setImageLoaded(false);
        }}
        width={800}
        okText="确认"
        cancelText="取消"
      >
        {cropImage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Segmented
              options={aspectRatios}
              value={aspect}
              onChange={handleAspectChange}
              style={{ width: 'fit-content', margin: '0 auto' }}
            />
            <ReactCrop
              crop={crop}
              onChange={(c, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              keepSelection
              style={{ maxWidth: '100%' }}
              className={styles["custom-crop-area"]}
            >
              <img
                alt=""
                ref={imgRef}
                src={'file://' + cropImage.url}
                style={{ maxHeight: '60vh', maxWidth: '100%' }}
                onLoad={handleImageLoad}
              />
            </ReactCrop>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Album;
