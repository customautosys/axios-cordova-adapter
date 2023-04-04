import type{
	InternalAxiosRequestConfig,
	AxiosPromise
}from 'axios';

export default async function axiosCordovaAdapter(
	config:InternalAxiosRequestConfig
):AxiosPromise{
	cordova.plugin.http.setRequestTimeout(config.timeout||0);
	if(config.data instanceof URLSearchParams){
		cordova.plugin.http.setDataSerializer('urlencoded');
	}else if(config.data&&typeof config.data==='object'){
		cordova.plugin.http.setDataSerializer('json');
	}
};