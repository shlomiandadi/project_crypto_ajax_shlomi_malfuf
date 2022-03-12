(function () {

    let coinsArr = []
    let searchedArr = []
    let lastTimeClickedCache = {}
    let coinsChoosenArr = localStorage['choosenCoins'] ? localStorage['choosenCoins'].split(",") : [];
    let coinsGraphData = {}
    let timer; 

    $(() => {
        infoInit();
        fiveCoinsInit();
        hideLoading();
        allEventsOfTheMenu();
        RequestDoApiAjax();
        hideAllScreen();
        showHomeScreenRow();

    })

    const showLoading = () => {
        $(".loadingScreen").show();
        $(".loadingScreen").attr("display", "flex");
    }

    const hideLoading = () => {
        $(".loadingScreen").hide();
    }

    const showHomeScreenRow = () => {
        hideAllScreen();
        $("#idRow").show();
    }

    // start about screen 
    const showAboutScreen = () => {
        hideAllScreen();
        $("#idAbout").show();
    }
    const showGraphScreen = () => {
        hideAllScreen();
        $("#idGraph").show();
        if (coinsChoosenArr.length > 0) {
            showLoading();
        }
        coinsGraphData = {};
        timer = setInterval(createGraph, 2000);
    }

    const hideAllScreen = () => {
        $("#idRow").hide();
        $("#idAbout").hide();
        $("#idGraph").hide();
        $("main .nav").addClass("d-none d-md-block")
        $("main .nav").hide();
        clearInterval(timer)
    }

    const createGraph = () => {
        let graphDataAr = [];
        if (coinsChoosenArr.length === 0) {
            $("#chartContainer").hide();
            $("#h2Graph").html("Not coins choose ,please click on toggle of one or more coins and back")
        }
        else {
            $("#chartContainer").show();
            $("#h2Graph").html("Info About choosen coins:")

            let choosenCoinsString = coinsChoosenArr.join(",")
            let url = `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${choosenCoinsString}&tsyms=USD`;
            $.get(url, (data, status) => {
                console.log(data);
                for (let item in data) {
                    console.log(data[item])
                    console.log(item); 
                    let dtNow = new Date(Date.now())
                    if (coinsGraphData[item]) {
                        coinsGraphData[item] = [...coinsGraphData[item], { x: dtNow, y: data[item].USD }]
                    }
                    else {
                        coinsGraphData[item] = [{ x: dtNow, y: data[item].USD }]
                    }
               
                    graphDataAr.push(
                        {
                            type: "line",
                            showInLegend: true,
                            name: item,
                            yValueFormatString: "#,##0$",
                            dataPoints: coinsGraphData[item]
                        }
                    )
                }
                
                let names = Object.keys(coinsGraphData)
    
                const options = {
                    animationEnabled: false,
                    theme: "light2",

                    title: {
                        text:`${names.join(",")} to USD`
                    },
                    axisX: {
                        valueFormatString: "hh:mm "
                    },
                    axisY: {
                        title: "Price of coin",
                        suffix: " ",
                        minimum: -180
                    },
                    toolTip: {
                        shared: true
                    },
                    legend: {
                        cursor: "pointer",
                        verticalAlign: "bottom",
                        horizontalAlign: "left",
                        dockInsidePlotArea: true,
                        itemclick: () => { }
                    },
                    data: graphDataAr
                };

                $("#chartContainer").CanvasJSChart(options);
                hideLoading();
            })
                .catch((error) => {
                    console.log(error);
                    alert("Failed to get user data");
                });
        }
    }

    const fiveCoinsInit = () => {
        $(".fiveBars .close-btn").on("click", () => {
            hideFiveCoins();
        })
    }

    const hideFiveCoins = () => {
        $(".fiveBars").hide();
    }

    const showFiveCoins = () => {
        $(".fiveBars").show();
        $(".fiveBars").css("display", "flex")
        createFiveCoinsList();
    }

    const createFiveCoinsList = () => {
        $("#idUlFive").empty();
        coinsArr.forEach(coin => {
            if (coinsChoosenArr.includes(coin.symbol)) {
                addSingleCoinFromFive(coin);
            }
        })
    }

    const addSingleCoinFromFive = (coin) => {
        let li = $("<li class='mt-3'></li>")
        $("#idUlFive").append(li);
        $(li).html(`
      <div class="form-check form-switch float-start">
        <input checked class="form-check-input checked-input popUpUlInShow" type="checkbox">
      </div>
      <span>${coin.symbol} </span>
     
    `)

        let checkdBtn = $(li).children(".form-check").children("input");

        checkdBtn.on("click", () => {
            let symbolIndex = coinsChoosenArr.indexOf(coin.symbol)
            coinsChoosenArr.splice(symbolIndex, 1);
            hideFiveCoins();
            localStorage.setItem("choosenCoins", coinsChoosenArr.join(","))
            createAllCoins();
        })
    }

    const infoInit = () => {
        $(".infoFixed").hide();
        $("#closeInfoBtn").on("click", () => {
            $(".infoFixed").hide();
        })
    }

    const DataFromCacheAfter2Min = (id) => {
        if (lastTimeClickedCache[id] && lastTimeClickedCache[id].time + 1000 * 120 > Date.now()) {
            console.log("local")
            let data = lastTimeClickedCache[id].data;
            showAndUpdateInfoWindowOfMoreInfoOnCurrencies(data);
        }
        else {
            lastTimeClickedCache[id] = { time: Date.now() };
            showLoading();
            let url = "https://api.coingecko.com/api/v3/coins/" + id;
            $.get(url, (data, status) => {
                console.log(data);
                showAndUpdateInfoWindowOfMoreInfoOnCurrencies(data);
                lastTimeClickedCache[id].data = data
            })
                .catch((error) => {
                    console.log(error);
                    alert("Failed to get user data");

                });
        }
    }

    const showAndUpdateInfoWindowOfMoreInfoOnCurrencies = (data) => {
        $("#idInfoName").html(data.name);
        $("#idInfoPriceUsd").html(Number(data.market_data.current_price.usd).toLocaleString());
        $("#idInfoPriceEur").html(Number(data.market_data.current_price.eur).toLocaleString());
        $("#idInfoPriceIls").html(Number(data.market_data.current_price.ils).toLocaleString());
        $("#idInfoBoxImg").attr("src", data.image.large)
        hideLoading();
        $(".infoFixed").show();
        $(".infoFixed").css("display", "flex");
    }

    const allEventsOfTheMenu = () => {
        $(".burger").on("click", () => {
            $("main .nav").removeClass("d-none")
            $("main .nav").fadeToggle(500)
        })

        $("#homeLink").on("click", () => {
            showHomeScreenRow();
            createAllCoins();
        })

        $("#liveGraphLink").on("click", () => {
            showGraphScreen();
        })

        $("#aboutLink").on("click", () => {
            showAboutScreen();
        })

        $("#searchBtn").on("click", () => {
            showHomeScreenRow();
            let inputVal = $("#searchInput").val();
            searchedArr = coinsArr.filter(item => {
                return item.symbol.toLowerCase() == inputVal.toLowerCase() || item.name.toLowerCase() == inputVal.toLowerCase();
            })
            createSearchedCoins()
            $("#searchInput").val("");
        })
    }

    const createSearchedCoins = () => {
        $("#idRow").empty()
        searchedArr.forEach(item => {
            showCoinsToUI(item.id, item.symbol, item.name, item.image.small);
        })
    }

    const RequestDoApiAjax = () => {
        let url = "https://api.coingecko.com/api/v3/coins";
        // let url = "data/coins.json"
        showLoading();
        $.get(url, (data, status) => {
            // console.log(data);
            coinsArr = data.splice(0, 100);
            console.log(coinsArr);
            createAllCoins()
            hideLoading();
        })
            .catch((error) => {
                console.log(error);
                alert("Failed to get user data");
            });
    }

    const createAllCoins = () => {
        $("#idRow").empty()
        coinsArr.forEach(item => {
            showCoinsToUI(item.id, item.symbol, item.name, item.image.small);
        })
    }

    const showCoinsToUI = (id, symbol, name, img) => {

        let div = $(`<div  class="  col-md-2 border p-3 cards ">`);
        $(div).html(`
      <div class="form-check form-switch float-end ">
        <input class="form-check-input checked-input" type="checkbox">
      </div >
      <img class="img-fluid" src="${img}" alt="Card image cap">
      <h2>${symbol}</h2>
      <h4>${name}</h4>
      <button id="${id}" class="btn btn-primary">More info</button>
        `)

        $("#idRow").append(div);
        let infoBtn = $(div).children("button")
        infoBtn.on("click", () => {
            // alert("work!")
            DataFromCacheAfter2Min(id);
        })

        let checkdBtn = $(div).children(".form-check").children("input");
        if (coinsChoosenArr.includes(symbol)) {
            checkdBtn[0].checked = true;
        }

        checkdBtn.on("click", () => {
            checkdBtn[0].checked = false
            if (!coinsChoosenArr.includes(symbol)
                && coinsChoosenArr.length < 5) {
                coinsChoosenArr.push(symbol);
                checkdBtn[0].checked = true;
            }
            else {
                let symbolIndex = coinsChoosenArr.indexOf(symbol);
                if (symbolIndex > -1) {
                    coinsChoosenArr.splice(symbolIndex, 1);
                }
                else {
                    showFiveCoins()
                }
            }
            localStorage.setItem("choosenCoins", coinsChoosenArr.join(","))
        })
    }
})();






