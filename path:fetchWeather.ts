import fetch from 'node-fetch';

const apiKey = 'YOUR_API_KEY'; // 여기에 API 키를 넣어주세요.
const city = 'Seoul'; // 대표님께서 알고 싶은 도시를 여기에 넣으세요.
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

async function getWeather() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`현재 ${city}의 날씨는 ${data.weather[0].description}이며, 기온은 ${data.main.temp}도에요.`);
  } catch (error) {
    console.error('날씨 정보를 가져오는데 실패했어요:', error);
  }
}

getWeather();