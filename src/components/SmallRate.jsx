import React from "react";
import styles from './SmallRate.less';



const SmallRate =({value=0,count=4, style})=>{
  const data =[];
  for(let i =count;i>0;i--){
    data.push(i);
  }

  return <div className={styles.SmallRate} style={style}>
    {data.map(it=>{
      return <div style={{width: it*3}} className={`${styles.line} ${it<=value?styles.active:''}`}/>
    })}
  </div>
}

export default SmallRate;