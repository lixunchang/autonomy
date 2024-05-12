/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Pagination } from 'antd';
import styles from './index.less';
// import { getSaveLocation } from '../utils/helper';
// import Editor from '../components/CKEditor'; 
import Editor from '../components/SlateEditor'; 
import fileHelper from '../utils/fileHelper';
import { combinePdfTextToRichText } from './utils';


const Book = ({ activeFile, onChange }) => {
  let { id, body, path, pdf, info, isLoaded = false } = activeFile;
  console.log('bodybody', info, isLoaded)
  const bookBody = JSON.parse(body||'{}');
  const [current, setCurrent] = useState(info?.current||1);
  // const [images, setImages] = useState([]);
  // const [activeId, setActiveId]=useState(id);
  // const [data, setData] = useState('');
  useEffect(()=>{
    setCurrent(info?.current||1)
  },[isLoaded])
  const handleContentChange = (data) => {
    if (data !== body) {
      onChange(id, {...bookBody, [current]: data});
    }
  };
  const onPageChange = (current) => {
    console.log('idid:Page: ', current);
    setCurrent(current)
    if(isLoaded){
      onChange(id, bookBody, {info:{...info, current}})
    }
  };
  useEffect(() => {
      async function initPdf(){
        console.log('readPdfinit', current, bookBody)
        if(!bookBody?.[current]){
          const {data, info, images} = await fileHelper.readPdfPage(pdf, current);
          // setImages(images)
          console.log('page-data==>', data, info, images)
          const {result} = combinePdfTextToRichText(data, info, images);
          const newBody = {
              ...bookBody,
              [current]: result
          };
          onChange(id, newBody, {info:{...info, current}})
        }
      }
      isLoaded&&pdf&&initPdf();
  }, [id, current, isLoaded]);

  console.log('idid', id, activeFile, current, bookBody?.[current])
  return (
    <div className={styles.Book}>
      {
        bookBody?.[current]&& //Object.keys(bookBody||{})?.length>0&&
        <Editor id={id} page={current} value={bookBody?.[current]} onChange={handleContentChange} isLoaded={isLoaded}/>
      }
      {
        info?.size&&
        <Pagination
         locale={'zhCN'} 
         size='small' 
         showQuickJumper 
         showSizeChanger={false} 
         current={current} 
         total={info?.size} 
         pageSize={1}
         onChange={onPageChange}
        />
      }
    </div>
  );
};

export default Book;
