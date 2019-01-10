var isFirst = true

$(function () {
    $.ajax({
        url: 'http://127.0.0.1:8000/api/station/names',
        type: 'GET',
        dataType: 'JSON',
        success: function (result) {
            sessionStorage.setItem("first-api-data", JSON.stringify(result))
            init(result, []);
        }
    });
});

function init(data, links) {
    var app = echarts.init(document.getElementById('map'));

    /**
     * 这个函数是用来鼠标拖动地图时，点要随着拖动一起重新刻画，可以直接复制用
     * @param {*} params
     * @param {*} api
     */
    function renderItem(params, api) {
        var coords = [];
        var points = [];
        for (var i = 0; i < coords.length; i++) {
            points.push(api.coord(coords[i]));
        }
        var color = api.visual('color');

        return {
            type: 'polygon',
            shape: {
                points: echarts.graphic.clipPointsByRect(points, {
                    x: params.coordSys.x,
                    y: params.coordSys.y,
                    width: params.coordSys.width,
                    height: params.coordSys.height
                })
            },
            style: api.style({
                fill: color,
                stroke: echarts.color.lift(color)
            }),
        };
    }

    /**
     * 最终的设置
     * serises里面的data属性data，也就是最终echart绘制时的数据来源
     * 由于api返回的格式就是echart绘图时所需要的数据格式，因此可以直接让echart绘制
     */
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                return params.name + ", 站点总交易数量：" + params.value[2]
            },
        },
        bmap: {
            center: [-73.98165557, 40.73221853],
            zoom: 17,
            roam: true,
        },
        series: [{
            name: '用户数量',
            type: 'graph',
            // edgeSymbol: ['none', 'arrow'],
            links: links,
            coordinateSystem: 'bmap',
            data: data,
            symbolSize: function (val) {
                return val[2] / 200;
            },
            label: {
                normal: {
                    formatter: function (params) {
                        return ""
                    },
                    position: 'right',
                    show: true
                },
                emphasis: {
                    show: true
                }
            },
            itemStyle: {
                normal: {
                    // color: '#000080'
                    color: '#c23531'
                }
            }
        },
            {
                type: 'custom',
                coordinateSystem: 'bmap',
                renderItem: renderItem,
                itemStyle: {
                    normal: {
                        opacity: 0.5
                    }
                },
                animation: true,
                silent: true,
                data: [0],
                z: -10
            }
        ]
    };
    app.setOption(option);

    if (isFirst) {
        isFirst = false
        ajax1(escape("1 Ave & E 15 St"));
        ajax2(escape("1 Ave & E 15 St"));
        ajax3(escape("1 Ave & E 15 St"));
    }

    app.on('click', function (params) {
        if (params.componentType === 'series') {
            // alert(params.data.name);
            var name = escape(params.data.name);
            ajax1(name);
            ajax2(name);
            ajax3(name);
        }
    });
}

function ajax1(name) {
    $.ajax({
        url: 'http://127.0.0.1:8000/api/station/analyze/hour?station_name=' + name,
        type: 'GET',
        dataType: 'JSON',
        success: function (result) {
            init2(result)
        }
    })
}

function ajax2(name) {
    $.ajax({
        url: 'http://127.0.0.1:8000/api/station/analyze/date?start_station_name=' + name,
        type: 'GET',
        dataType: 'JSON',
        success: function (result) {
            init3(result)
        }
    })
}

function init2(data) {
    // var bike = echarts.init(document.getElementById('bike'),'dark');
    var in_bike = echarts.init(document.getElementById('in_bike'));
    var out_bike = echarts.init(document.getElementById('out_bike'));
    var hours = [];
    var in_bikenums = [];
    var out_bikenums = [];
    for (var i = 0; i < 24; i++) {
        hours.push(data.in_bike[i].hour);
        in_bikenums.push(data.in_bike[i].nums);
        out_bikenums.push(data.out[i].nums);
    }
    // console.log(hours);
    // console.log(in_bikenums);
    var option1 = {
        title: {
            text: '每小时借车数',
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['每小时借车数']
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            data: hours
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '借车数',
            type: 'bar',
            // itemStyle:{
            //     color:'#583e7e',
            // },
            data: in_bikenums,
            markPoint: {
                data: [{
                    type: 'max',
                    name: '最大值'
                },
                    {
                        type: 'min',
                        name: '最小值'
                    }
                ]
            },
            markLine: {
                data: [{
                    type: 'average',
                    name: '平均值'
                }]
            }
        }, ]
    };
    var option2 = {
        title: {
            text: '每小时还车数',
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['每小时还车数']
        },
        calculable: true,
        xAxis: [{
            type: 'category',
            data: hours
        }],
        yAxis: [{
            type: 'value'
        }],
        series: [{
            name: '还车数',
            type: 'bar',
            data: out_bikenums,
            markPoint: {
                data: [{
                    type: 'max',
                    name: '最大值'
                },
                    {
                        type: 'min',
                        name: '最小值'
                    }
                ]
            },
            markLine: {
                data: [{
                    type: 'average',
                    name: '平均值'
                }]
            }
        }, ]
    };
    in_bike.setOption(option1);
    out_bike.setOption(option2);
}

function init3(data) {
    var everyday_bike = echarts.init(document.getElementById('everyday_bike'));
    var date = [];
    var nums = [];
    for (var i = 0; i < 31; i++) {
        date.push(data[i].date);
        nums.push(data[i].nums);
    }
    var option = {
        title: {
            text: '每日交易数量',
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: date
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                formatter: '{value} '
            }
        },
        series: [{
            name: '每日交易数量',
            type: 'line',
            data: nums,
            markPoint: {
                data: [{
                    type: 'max',
                    name: '最大值'
                },
                    {
                        type: 'min',
                        name: '最小值'
                    }
                ]
            },
            markLine: {
                data: [{
                    type: 'average',
                    name: '平均值'
                }]
            }
        }]
    };
    everyday_bike.setOption(option);
}

function ajax3(name) {
    $.ajax({
        url: 'http://127.0.0.1:8000/api/station/analyze?start_station_name=' + name,
        type: 'GET',
        dataType: 'JSON',
        success: function (result) {
            init4(result)
        }
    })
}

function init4(data) {
    var source = data.start_station_name
    var target_1 = data.end_station
    var target_2 = data.start_station
    var links = []
    var length = target_1.length < target_2.length ? target_1.length : target_2.length
    for (var i = 0; i < length; i ++) {
        s = "<tr>";
        s += "<td>" + target_1[i].end_station_name + "</td>";
        s += "<td>" + target_1[i].nums + "</td>";
        s += "<td>" + target_2[i].start_station_name + "</td>";
        s += "<td>" + target_2[i].nums + "</td>";
        s += "</tr>"
        if (target_1[i].nums > 30) {
            links.push({
                source: source,
                target: target_1[i].end_station_name,
                lineStyle: {
                    normal: {
                        width:target_1[i].nums / 5,
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [{
                                offset: 0, color: '#eda553' // 0% 处的颜色
                            }, {
                                offset: 1, color: '#7c785b' // 100% 处的颜色
                            }],
                            globalCoord: false // 缺省为 false
                        }
                    }
                },
            })
        }
        $(s).appendTo($("#myTable"));
    }

    init(JSON.parse(sessionStorage.getItem("first-api-data")), links)
}