/* eslint-disable react/style-prop-object */
import React from 'react';
import './index.css';

const isDev = window.require('electron-is-dev');
const Store = window.require('electron-store');

const Splash =()=>{

  const splashStorage = new Store({
    name: isDev ? 'Splashs_dev' : 'Splashs',
  });
  console.log('===>', splashStorage);
  const birthday = splashStorage.get('birthday')||"1995/05/20";
  const lifeStart = splashStorage.get('lifeStart')||"0";
  const lifeEnd = splashStorage.get('lifeEnd')||"80";
  const careerStart = splashStorage.get('careerStart')||"25";
  const careerEnd = splashStorage.get('careerEnd')||"45";
  const aduitStart = splashStorage.get('aduitStart')||"18";
  const aduitEnd = splashStorage.get('aduitEnd')||"80";
  const birthdate = new Date(birthday);
  const cur = new Date();
  const diff = cur - birthdate; // This is the difference in milliseconds
  const age = (diff/31557600000).toFixed(2); // Divide by 1000*60*60*24*365.25 //Math.floor
  const diff18 = diff - 18*1000*60*60*24*365;
  const diff25 = diff - 25*1000*60*60*24*365;
  // document.querySelector('.age').innerHTML = age;
  const careerDays = Math.floor(diff25/1000/60/60/24);
  const careerProgress = Math.min(Math.abs(((age - 25)*100 / 20).toFixed(2)), 100);
  // document.querySelector('.careerWidth').style.width = careerProgress + '%';
  // document.querySelector('.careerProgress').innerHTML = careerProgress;
  // document.querySelector('.careerDays').innerHTML = careerDays + '天';
  // document.querySelector('.careerStart').innerHTML = careerStart;
  // document.querySelector('.careerEnd').innerHTML = careerEnd;
  const aduitDays = Math.floor(diff18/1000/60/60/24);
  const aduitProgress = Math.min(Math.abs(((age - 18)*100 / 62).toFixed(2)), 100);
  // document.querySelector('.aduitWidth').style.width = aduitProgress + '%';
  // document.querySelector('.aduitProgress').innerHTML = aduitProgress;
  // document.querySelector('.aduitDays').innerHTML = aduitDays + '天';
  // document.querySelector('.aduitStart').innerHTML = aduitStart;
  // document.querySelector('.aduitEnd').innerHTML = aduitEnd;
  const lifeDays = Math.floor(diff/1000/60/60/24);
  const lifeProgress = Math.min(Math.abs((age*100 / 80).toFixed(2)), 100);
  // document.querySelector('.lifeWidth').style.width = lifeProgress + '%';
  // document.querySelector('.lifeProgress').innerHTML = lifeProgress;
  // document.querySelector('.lifeDays').innerHTML = lifeDays + '天';
  // document.querySelector('.lifeStart').innerHTML = lifeStart;
  // document.querySelector('.lifeEnd').innerHTML = lifeEnd;

  return (
    <div className="loading-container">
      <h1 style={{textAlign: 'center', marginTop: 0, color: 'red',}}><span className="age">{age}</span>岁</h1>
      <h3 style2={{textAlign: 'center'}}>生命进度...<span className="lifeDays">{lifeDays}天</span></h3>
      <div className="loading-bar">
        <div className="amount green lifeWidth"  style={{
          width: lifeProgress + '%'
        }}>
          <div className="loaded">
          <span className="lifeProgress">{lifeProgress}</span>%
          </div>
          <div className="lines"></div>
        </div>
        <span className="start lifeStart">{lifeStart}</span>
        <span className="end lifeEnd">{lifeEnd}</span>
      </div>
      <h3 style2={{textAlign: 'center'}}>成年进度...<span className="aduitDays">{aduitDays}天</span></h3>
      <div className="loading-bar">
        <div className="amount blue aduitWidth"  style={{
          width: aduitProgress + '%'
        }}>
          <div className="loaded">
            <span className="aduitProgress">{aduitProgress}</span>%
          </div>
          <div className="lines"></div>
        </div>
        <span className="start aduitStart">{aduitStart}</span>
        <span className="end aduitEnd">{aduitEnd}</span>
      </div>
      <h3 style2={{textAlign: 'center'}}>事业年限...<span className="careerDays">{careerDays}天</span> </h3>
      <div className="loading-bar">
        <div className="amount red careerWidth" style={{
          width: careerProgress + '%'
        }}>
          <div className="loaded">
            <span className="careerProgress">{careerProgress}</span>%
          </div>
          <div className="lines"></div>
        </div>
        <span className="start careerStart">{careerStart}</span>
        <span className="end careerEnd">{careerEnd}</span>
      </div>
    </div>
  )
}


export default Splash;