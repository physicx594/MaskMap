//設定一個地圖，綁在#map上，
//定位 center 座標及 zoom 縮放大小(0~18 數字越小，縮越小)
var map = L.map("map", {
  // center: [25.0634467, 121.590849],
  zoom: 15,
});

//你要用誰的圖資
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}", {
  foo: "bar",
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
}).addTo(map);

//連線
fetch(
  "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
)
  .then((res) => {
    return res.json();
  })
  .then((res) => {
    var data = res.features;
    fetchData(data);
    mapInformation(data);
    // 臺北市的資料
    const storeData = data.filter((value) =>
      value.properties.address.match(selectedCity)
    );
    console.log(data);
    upDataTown(data);
    upDataCounty(data);
    upDataSidebar(storeData);
    upDataMap(storeData[0]);
  })
  .catch((err) => {
    console.log("抓不到資料");
  });

const markers = new L.MarkerClusterGroup().addTo(map);
const ok = document.querySelector(".navRigrt p");
const sideWeek = document.querySelector(".sideWeek");
const sideDate = document.querySelector(".sideDate");
const sideId = document.querySelector(".sideId");
const selectCity = document.querySelector(".selectCity");
const selectTown = document.querySelector(".selectTown");
const sideCard = document.querySelector(".sideCard");
const search = document.querySelector(".search");
let selectedCity = "臺北市";
let selectedLocation = "全部地區";

const upDataMap = (firstOneData) => {
  const lat = firstOneData.geometry.coordinates[1];
  const lng = firstOneData.geometry.coordinates[0];
  var adultMaskColor = (() => {
    if (firstOneData.properties.mask_adult === 0) {
      return "maskNone";
    } else return "maskAdult";
  })();
  var childMaskColor = (() => {
    if (firstOneData.properties.mask_child === 0) {
      return "maskNone";
    } else return "maskChild";
  })();
  const iconColor = (() => {
    if (firstOneData.properties.mask_adult > 0 && firstOneData.properties.mask_child > 0) {
      return new L.Icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }
    if (
      firstOneData.properties.mask_adult === 0 &&
      firstOneData.properties.mask_child === 0
    ) {
      return new L.Icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    }
    return new L.Icon({
      iconUrl:
        "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  })();


  map.setView([lat, lng], 16);
  L.marker([lat, lng], {
    icon: iconColor,
  })
    .addTo(map)
    .bindPopup(
      `<p style="font-size: 16px; font-weight: bold;
        ">${firstOneData.properties.name}</p>
        <p>${firstOneData.properties.address}</p>
        <p>${firstOneData.properties.phone}</p>
        <p>${firstOneData.properties.note}</p>
        <p>更新時間 : ${firstOneData.properties.updated}</p>
        <div class="maskNum">
        <div class="${adultMaskColor}">成人 <span>${firstOneData.properties.mask_adult}</span></div>
        <div class="${childMaskColor}">兒童 ${firstOneData.properties.mask_child}</div>
        </div>`
    )
    .openPopup();
};

const upDataCounty = (importData) => {
  let cityArr = [];
  importData.filter((value) => {
    if (value.properties.county != selectedCity && value.properties.county)
      cityArr.push(value.properties.county);
  });
  const cityData = cityArr.filter((item, index, arr) => {
    return arr.indexOf(item) === index;
  });

  let str = `<option value="${selectedCity}">${selectedCity}</option>`;
  cityData.forEach((value) => {
    str += `
    <option value="${value}">
    ${value}</option>`;
  });
  selectCity.innerHTML = str;
};

const upDataSidebar = (importData) => {
  let str = "";
  importData.forEach((value) => {
    // 數量顏色
    var adultMaskColor = (() => {
      if (value.properties.mask_adult === 0) {
        return "maskNone";
      } else return "maskAdult";
    })();
    var childMaskColor = (() => {
      if (value.properties.mask_child === 0) {
        return "maskNone";
      } else return "maskChild";
    })();
    str += `<li >
    <div class="cardTop">
      <h1>${value.properties.name}</h1>
      <a class="clickMe fas fa-map-marker-alt fa-2x"
      data-id = "${value.properties.id}"></a>
    </div>
    <p>${value.properties.address}</p>
    <p>${value.properties.phone}</p>
    <p>${value.properties.note}</p>
    <p>更新時間 : ${value.properties.updated}</p>
    <div class="maskNum">
    <div class="${adultMaskColor}">成人 <span>${value.properties.mask_adult}</span></div>
    <div class="${childMaskColor}">兒童 ${value.properties.mask_child}</div>
</div>
</li>`;
  });
  sideCard.innerHTML = str;
};
const upDataTown = (importData) => {
  let townArr = [];
  importData.filter((value) => {
    if (value.properties.county === selectedCity)
      townArr.push(value.properties.town);
  });
  const townData = townArr.filter((item, index, arr) => {
    return arr.indexOf(item) === index;
  });

  let str = `<option value="${selectedLocation}">${selectedLocation}</option>`;
  townData.forEach((value) => {
    str += `
    <option value='${value}'>
    ${value}</option>
    `;
  });
  selectTown.innerHTML = str;
};

// 資料互動
function fetchData(data) {
  // city 選單
  function changeCity(e) {
    selectedCity = e.target.value;
    const townData = data.filter((value) => {
      return value.properties.county === selectedCity;
    });
    const storeData = data.filter((value) => {
      return value.properties.address.match(selectedCity);
    });
    upDataTown(townData);
    upDataMap(townData[0]);
    if (storeData.length === 0) {
      alert("查無資料");
    } else {
      upDataSidebar(storeData);
      upDataMap(storeData[0]);
    }
  }
  // town 選單
  function changeTown(e) {
    if (e.target.value === "全部地區") {
      const storeData = data.filter(
        (value) => value.properties.county === selectCity.value
      );
      upDataSidebar(storeData);
      upDataMap(storeData[0]);
    } else {
      const locationName = selectCity.value + e.target.value;
      const storeData = data.filter((value) =>
        value.properties.address.match(locationName)
      );
      upDataSidebar(storeData);
      upDataMap(storeData[0]);
    }
  }
  // address 搜尋
  function searchAddress(e) {
    const storeData = data.filter((value) =>
      value.properties.address.match(search.value)
    );
    if (event.keyCode === 13) {
      if (search.value.length == 0 || search.value == " ") {
        alert("請輸入正確");
        return;
      } else if (storeData.length == 0) {
        alert("查無資料");
        return;
      } else {
        upDataSidebar(storeData);
        upDataMap(storeData[0]);
      }
    }
  }
  // 點擊移動至店家
  function moveMap(e) {
    if (e.target.nodeName === "A") {
      const clickData = data.filter(
        (value) => e.target.dataset.id === value.properties.id
      );
      upDataMap(clickData[0]);
    }
  }

  sideCard.addEventListener("click", moveMap);
  selectCity.addEventListener("change", changeCity);
  selectTown.addEventListener("change", changeTown);
  search.addEventListener("keyup", searchAddress);
}

// 地圖 店家資訊
function mapInformation(data) {
  data.filter((value) => {
    // 數量顏色
    var adultMaskColor = (() => {
      if (value.properties.mask_adult === 0) {
        return "maskNone";
      } else return "maskAdult";
    })();
    var childMaskColor = (() => {
      if (value.properties.mask_child === 0) {
        return "maskNone";
      } else return "maskChild";
    })();

    const iconColor = (() => {
      if (value.properties.mask_adult > 0 && value.properties.mask_child > 0) {
        return new L.Icon({
          iconUrl:
            "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
      }
      if (
        value.properties.mask_adult === 0 &&
        value.properties.mask_child === 0
      ) {
        return new L.Icon({
          iconUrl:
            "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });
      }
      return new L.Icon({
        iconUrl:
          "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });
    })();

    markers.addLayer(
      L.marker([value.geometry.coordinates[1], value.geometry.coordinates[0]], {
        icon: iconColor,
      }).bindPopup(
        `<p style="font-size: 16px; font-weight: bold;
        ">${value.properties.name}</p>
        <p>${value.properties.address}</p>
        <p>${value.properties.phone}</p>
        <p>${value.properties.note}</p>
        <p>更新時間 : ${value.properties.updated}</p>
        <div class="maskNum">
        <div class="${adultMaskColor}">成人 ${value.properties.mask_adult}</div>
        <div class="${childMaskColor}">兒童 ${value.properties.mask_child}</div>
        </div>`
      )
    );
    map.addLayer(markers);
  });
}

// 日期資料
const getWeekAndIdNum = (() => {
  let day = new Date();
  let today = day.getDay();
  let now_today =
    day.getFullYear() + "-" + (day.getMonth() + 1) + "-" + day.getDate();
  sideDate.innerHTML = now_today;
  switch (today) {
    case 1:
      sideWeek.innerHTML = "星期一";
      sideId.innerHTML = "1, 3, 5, 7, 9";
      break;
    case 2:
      sideWeek.innerHTML = "星期二";
      sideId.innerHTML = "0, 2, 4, 6, 8";
      break;
    case 3:
      sideWeek.innerHTML = "星期三";
      sideId.innerHTML = "1, 3, 5, 7, 9";
      break;
    case 4:
      sideWeek.innerHTML = "星期四";
      sideId.innerHTML = "0, 2, 4, 6, 8";
      break;
    case 5:
      sideWeek.innerHTML = "星期五";
      sideId.innerHTML = "1, 3, 5, 7, 9";
      break;
    case 6:
      sideWeek.innerHTML = "星期六";
      sideId.innerHTML = "0, 2, 4, 6, 8";
      break;
    case 7:
      sideWeek.innerHTML = "星期日";
      sideId.innerHTML = `<span style="color:yellow">不限制</span>`;
      break;
  }
})();

//製作 marker
var greenIcon = new L.Icon({
  iconUrl:
    "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -41],
  shadowSize: [100, 41],
});
