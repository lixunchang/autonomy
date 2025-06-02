/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
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
        if(!bookBody?.[current]){
          const {data, info, images} = await fileHelper.readPdfPage(pdf, current);
          const {result} = combinePdfTextToRichText(data, info, images);
          
          const newBody = {
            ...bookBody,
            [current]: result
          };
          console.log('result=====>', current, newBody);
          onChange(id, newBody, {info:{...info, current}});
        }
      }
      isLoaded&&pdf&&initPdf();
  }, [id, current, isLoaded]);

  console.log('idid', id, activeFile, current, bookBody?.[current])
  return (
    <div className={styles.Book}>
      <div className={styles.slateBook}>
        {
          bookBody?.[current]&&
          <Editor id={id} page={current} value={bookBody?.[current]} onChange={handleContentChange} isLoaded={isLoaded}/>
        }
      </div>
        <div className={styles.pagination}>
          <div className={styles.pageButton} onClick={() => current > 1 && onPageChange(current - 1)}>
            上一页
          </div>
          <div className={styles.pageInfo}>
            {current} / {info&&info.size}
          </div>
          <div className={styles.pageButton} onClick={() => current < info.size && onPageChange(current + 1)}>
            下一页
          </div>
        </div>
    </div>
  );
};

export default Book;
