import React, { useState } from 'react';
import { Image, Row, Col, Button } from 'antd';
import { PlusOutlined, EditOutlined, WallpaperOutlined } from '@ant-design/icons';

const Album = ({ files = [] }) => {
  const [visible, setVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);

  return (
    <div className="album-container">
      <Row gutter={[16, 16]}>
        {files.map(file => (
          <Col key={file.id} span={6}>
            <div className="album-card">
              <Image
                preview={{ visible: false }}
                src={file.url}
                onClick={() => {
                  setCurrentImage(file);
                  setVisible(true);
                }}
              />
              <div className="album-card-actions">
                <Button icon={<EditOutlined />} />
                <Button icon={<WallpaperOutlined />} />
              </div>
            </div>
          </Col>
        ))}
      </Row>
      
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup 
          preview={{
            visible,
            onVisibleChange: vis => setVisible(vis)
          }}
        >
          {files.map(file => (
            <Image key={file.id} src={file.url} />
          ))}
        </Image.PreviewGroup>
      </div>
    </div>
  );
};

export default Album;
