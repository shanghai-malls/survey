import Question from "./Question";
import React from "react";
import BaiduMap from "baidu-map";

export class Geo extends Question {

    body() {
        return (
            <div className="question-body geo">
                <input type="text" id="suggestId" size="20" ref="suggestId" className="form-control" disabled={this.props.readOnly}  />
                <div ref='mapContainer' disabled={this.props.readOnly} width="100%" style={{height:215,marginTop:'30px'}} />
            </div>
        )
    }


    componentDidMount(){
        let map = new BaiduMap.Map(this.refs.mapContainer);

        let ac = new BaiduMap.Autocomplete({input : "suggestId", location : map});

        ac.addEventListener("onconfirm", (e) => {    //鼠标点击下拉列表后的事件
            let value = e.item.value;
            let address = value.province +  value.city +  value.district +  value.street +  value.business;


            let local = new BaiduMap.LocalSearch(map, { //智能搜索
                onSearchComplete: ()=>{
                    let point = local.getResults().getPoi(0).point;    //获取第一个智能搜索的结果
                    this.centerAndZoom(map,point,address,ac)
                }
            });
            local.search(address);
        });


        if(this.props.readOnly){
            map.disableDragging()
        }
        if (Geo.browserType.mobile) {
            let navigationControl = new BaiduMap.NavigationControl({
                anchor: window.BMAP_ANCHOR_TOP_LEFT,
                type: window.BMAP_NAVIGATION_CONTROL_LARGE,
                enableGeolocation: true
            });
            map.addControl(navigationControl);

            let geolocationControl = new BaiduMap.GeolocationControl();

            geolocationControl.addEventListener("locationSuccess", this.locateSuccess.bind(this,map));

            geolocationControl.addEventListener("locationError", this.locateError.bind(this));
            map.addControl(geolocationControl);
        }

        new BaiduMap.LocalCity().get( (result) => {
            let point = result.center;
            map.centerAndZoom(point, 18);
            map.addOverlay(new BaiduMap.Marker(point));
            if(this.state.value){
                this.centerAndZoom(map,this.state.value,this.state.value.address,ac)
            }
        });
    }


    locateSuccess(map, rs){
        let {addressComponent,addressComponents,point} = rs;
        let addr = addressComponent || addressComponents;
        let address = `${addr.province}${addr.city}${addr.district}`;
        if (addr.street) {
            address +=  addr.street
        }
        if (addr.streetNumber) {
            address +=  addr.streetNumber
        }
        this.centerAndZoom(map,point,address)
    }

    locateError(){
        window.alert("定位失败，您的浏览器还不支持地理定位");
        super.resetResponse();
    }

    centerAndZoom(map,point,address,ac){

        let {lat,lng} = point;
        this.fillInResponse({address,lat,lng});

        map.clearOverlays();    //清除地图上所有覆盖物
        map.addOverlay(new BaiduMap.Marker(point));    //添加标注
        map.centerAndZoom(point, 18);

        if(ac) {
            ac.setInputValue(address);
        } else {
            document.getElementById('suggestId').value = address;
        }
    }
}
let u = window.navigator.userAgent;
Geo.browserType =  {//移动终端浏览器版本信息
    trident: u.indexOf('Trident') > -1, //IE内核
    presto: u.indexOf('Presto') > -1, //opera内核
    webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') === -1, //火狐内核
    mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
    ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
    android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
    iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1, //是否为iPhone或者QQHD浏览器
    iPad: u.indexOf('iPad') > -1, //是否iPad
    webApp: u.indexOf('Safari') === -1, //是否web应该程序，没有头部与底部
    language: (navigator['browserLanguage'] || navigator.language).toLowerCase()
};