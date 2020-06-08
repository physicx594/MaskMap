//設定一個地圖，綁在#map上，
//定位 center 座標及 zoom 縮放大小(0~18 數字越小，縮越小)
var map = L.map("map", {
  // center: [25.069859, 121.638958],
  zoom: 18,
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
const selectLocation = document.querySelector(".selectLocation");
const sideCard = document.querySelector(".sideCard");
const search = document.querySelector(".search");
let selectedCity = "臺北市";
let selectedLocation = "全部地區";

function fetchData(data) {
  // 預設資料 - 縣市、地區
  let cityStr = `<option data-num="20"value=${selectedCity}>${selectedCity}</option>`;
  let locationStr = `<option data-num=""value=${selectedLocation}>${selectedLocation}</option>`;

  //篩選縣市
  let cityArr = [];
  for (let i = 0; i < data.length; i++) {
    CityData = data[i].properties.county;
    cityArr.push(CityData);
  }

  let cityFilter = cityArr.filter((item, index, arr) => {
    return arr.indexOf(item) === index && item != "";
  });

  cityFilter.filter((value, keys) => {
    if (value != "臺北市") {
      cityStr += `<option data-num="${keys}" value="${value}">${value}</option>`;
    }
  });
  let taipeiArr = [];
  data.filter((value) => {
    if (
      value.properties.address.match("臺北市") &&
      value.properties.town != ""
    ) {
      return taipeiArr.push(value.properties.town);
    }
  });
  let taipeiFilter = taipeiArr.filter((item, index, arr) => {
    return arr.indexOf(item) === index;
  });
  taipeiFilter.filter((value, keys) => {
    locationStr += `<option data-num="${keys}" value="${value}">${value}</option>`;
  });

  selectCity.innerHTML = cityStr;
  selectLocation.innerHTML = locationStr;

  let str = "";
  let strData = data.filter((value) => {
    return value.properties.county === selectedCity;
  });

  strData.filter((value) => {
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
    str += `<li>
            <div class="cardTop">
              <h1>${value.properties.name}</h1>
              <a class="clickMe fas fa-map-marker-alt fa-2x" data-lat = "${value.geometry.coordinates[1]}"data-lng = "${value.geometry.coordinates[0]}"></a>
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
    map.setView([25.0634467, 121.590849], 15);
  });
  sideCard.innerHTML = str;

  // 縣市選單
  function changeCity(e) {
    let changeCityStr = "";
    locationStr = "";
    locationStr = `<option data-num=""value=${selectedLocation}>${selectedLocation}</option>`;
    let locationArr = [];
    selectedCity = e.target.value;
    var selectedCityData = data.filter((value) => {
      return selectedCity === value.properties.county;
    });
    for (let i = 0; i < selectedCityData.length; i++) {
      townData = selectedCityData[i].properties.town;
      locationArr.push(townData);
    }
    let fliterLocationArr = locationArr.filter((item, index, arr) => {
      return arr.indexOf(item) === index;
    });
    fliterLocationArr.filter((value) => {
      locationStr += `<option  value="${value}">${value}</option>`;
    });
    selectLocation.innerHTML = locationStr;

    selectedCityData.filter((value) => {
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
      changeCityStr += `<li>
              <div class="cardTop">
                <h1>${value.properties.name}</h1>
                <a class="clickMe fas fa-map-marker-alt fa-2x" data-lat = "${value.geometry.coordinates[1]}"data-lng = "${value.geometry.coordinates[0]}"></a>
                </div>
              <p>${value.properties.address}</p>
              <p>${value.properties.phone}</p>
              <p>${value.properties.note}</p>
              <p>更新時間 : ${value.properties.updated}</p>
              <div class="maskNum">
                  <div class="${adultMaskColor}">成人 ${value.properties.mask_adult}</div>
                  <div class="${childMaskColor}">兒童 ${value.properties.mask_child}</div>
              </div>
          </li>`;
      map.setView(
        [value.geometry.coordinates[1], value.geometry.coordinates[0]],
        15
      );
    });
    sideCard.innerHTML = changeCityStr;
  }
  // 地區選單
  function changeTown(e) {
    let changeTownStr = "";
    let TownData = data.filter((value) => {
      return value.properties.town === e.target.value && value.properties.address.match(selectCity.value);
    });
    
    if (e.target.value === selectedLocation) {
      let allTown = data.filter((item) => {
        return item.properties.address.match(selectCity.value);
      });
      allTown.filter((value) => {
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
        changeTownStr += `<li>
      <div class="cardTop">
        <h1>${value.properties.name}</h1>
        <a class="clickMe fas fa-map-marker-alt fa-2x" data-lat = "${value.geometry.coordinates[1]}"data-lng = "${value.geometry.coordinates[0]}"></a>
        </div>
      <p>${value.properties.address}</p>
      <p>${value.properties.phone}</p>
      <p>${value.properties.note}</p>
      <p>更新時間 : ${value.properties.updated}</p>
      <div class="maskNum">
          <div class="${adultMaskColor}">成人 ${value.properties.mask_adult}</div>
          <div class="${childMaskColor}">兒童 ${value.properties.mask_child}</div>
      </div>
  </li>`;
      });
    }
    TownData.filter((value) => {
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
      changeTownStr += `<li>
        <div class="cardTop">
        <h1>${value.properties.name}</h1>
        <a class="clickMe fas fa-map-marker-alt fa-2x" data-lat = "${value.geometry.coordinates[1]}"data-lng = "${value.geometry.coordinates[0]}"></a>
        </div>
      <p>${value.properties.address}</p>
      <p>${value.properties.phone}</p>
      <p>${value.properties.note}</p>
      <p>更新時間 : ${value.properties.updated}</p>
      <div class="maskNum">
          <div class="${adultMaskColor}">成人 ${value.properties.mask_adult}</div>
          <div class="${childMaskColor}">兒童 ${value.properties.mask_child}</div>
      </div>
  </li>`;
      map.setView(
        [value.geometry.coordinates[1], value.geometry.coordinates[0]],
        18
      );
    });
    sideCard.innerHTML = changeTownStr;
  }
  // 地址搜尋
  function searchAddress(e) {
    let addressALLStr = "";
    let content = search.value;
    let addressALL = {};

    addressALL = data.filter((value) => {
      return value.properties.address.match(content);
    });
    if (event.keyCode === 13) {
      if (content.length === 0 || content == " ") {
        alert("請輸入地址資料");
        return;
      } else if (addressALL == {} || addressALL.length == 0) {
        alert("查無資料");
        return;
      } else {
        addressALL.filter((value) => {
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
          addressALLStr += `<li>
            <div class="cardTop">
            <h1>${value.properties.name}</h1>
            <a class="clickMe fas fa-map-marker-alt fa-2x" data-lat = "${value.geometry.coordinates[1]}"data-lng = "${value.geometry.coordinates[0]}"></a>
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
          map.setView(
            [value.geometry.coordinates[1], value.geometry.coordinates[0]],
            18
          );

        });
        sideCard.innerHTML = addressALLStr;
        search.value = ""
        return
      }
    }
  }
  // 點擊移動至店家
  function moveMap(e) {
    if (e.target.nodeName == "A")
      map.setView([e.target.dataset.lat, e.target.dataset.lng], 18);
  }

  search.addEventListener("keyup", searchAddress);
  selectLocation.addEventListener("change", changeTown);
  selectCity.addEventListener("change", changeCity);
  sideCard.addEventListener("click", moveMap);
}

// 地圖店家資訊
function mapInformation(data) {
  data.filter((value) => {
    // const iconColor = (() => {
    //   if (value.properties.mask_adult > 0 && value.properties.mask_child > 0) {
    //     return new L.Icon({
    //       iconUrl:
    //         "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    //       shadowUrl:
    //         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    //       iconSize: [25, 41],
    //       iconAnchor: [12, 41],
    //       popupAnchor: [1, -34],
    //     });
    //   }
    //   if (value.properties.mask_adult === 0 && value.properties.mask_child === 0) {
    //     return new L.Icon({
    //       iconUrl:
    //         "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png",
    //       shadowUrl:
    //         "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    //       iconSize: [25, 41],
    //       iconAnchor: [12, 41],
    //       popupAnchor: [1, -34],
    //     });
    //   }
    //   return new L.Icon({
    //     iconUrl:
    //       "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    //     shadowUrl:
    //       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    //     iconSize: [25, 41],
    //     iconAnchor: [12, 41],
    //     popupAnchor: [1, -34],
    //   });
    // })();
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
    markers.addLayer(
      L.marker([value.geometry.coordinates[1], value.geometry.coordinates[0]], {
        icon: greenIcon,
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
  });
}
// 日期相關
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
