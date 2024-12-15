import React from "react";
import styles from './SmallRate.less';
import { StarFilled } from '@ant-design/icons';



const SmallRate =({value=0,count=4, style})=>{
  // const data =[];
  // for(let i =count;i>0;i--){
  //   data.push(i);
  // }

  return <div className={`${styles.SmallRate} ${styles['star_'+value]}`} style={style}>
    <StarFilled />
    {/* {Array.from(new Array(value)).map((_, it)=>{
      return <div key={it} className={`${styles.line} ${styles.active}`}/>
    })} */}
  </div>
}

export default SmallRate;