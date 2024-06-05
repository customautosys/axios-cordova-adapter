import type{
	InternalAxiosRequestConfig,
	AxiosPromise,
	AxiosResponse
}from 'axios';
import settle from 'axios/unsafe/core/settle.js';
import buildURL from 'axios/unsafe/helpers/buildURL.js';
import buildFullPath from 'axios/unsafe/core/buildFullPath.js';
import {getReasonPhrase} from 'http-status-codes';

export default function axiosCordovaAdapter(
	config:InternalAxiosRequestConfig
):AxiosPromise{
	return new Promise<AxiosResponse>(async(resolve,reject)=>{
		try{
			let data:any;
			let url:string=buildURL(
				buildFullPath(
					config.baseURL,
					config.url
				),
				config.params,
				config.paramsSerializer
			);
			let serializer='';
			let headers=Object.assign(config.auth?cordova.plugin.http.getBasicAuthHeader(config.auth.username,config.auth.password):{},config.headers.toJSON(true));
			if(config.data instanceof URLSearchParams){
				serializer='utf8';
				data=config.data.toString();
				headers['Content-Type']='application/x-www-form-urlencoded;charset=UTF-8';
				headers['Content-Length']=data.length.toString();
			}else if(config.data instanceof Uint8Array||config.data instanceof ArrayBuffer){
				serializer='raw';
				data=config.data;
				headers['Content-Length']=config.data.byteLength.toString();
			}else if(config.data instanceof FormData){
				serializer='multipart';
				data=config.data;
			}else if(config.data&&typeof config.data==='object'){
				serializer='json';
				data=config.data;
				headers['Content-Length']=JSON.stringify(data).length.toString();
			}else{
				serializer='utf8';
				data=config.data?String(config.data):'';
				if(data)headers['Content-Length']=data.length.toString();
			}
			let responseType='';
			switch(config.responseType){
				case 'text':
				case 'json':
				case 'arraybuffer':
				case 'blob':
					responseType=config.responseType;
					break;
				default:
					responseType='text';
					break;
			}
			let options:any={
				method:config.method.toLowerCase(),
				responseType,
				followRedirect:typeof config.maxRedirects!=='number'||config.maxRedirects>0
			};
			cordova.plugin.http.setFollowRedirect(options.followRedirect);
			switch(options.method){
				case 'post':
				case 'put':
				case 'patch':
					options.data=data;
					options.serializer=serializer;
					break;
				case 'get':
				case 'head':
				case 'delete':
				case 'options':
				case 'upload':
				case 'download':
					break;
				default:
					options.method='get';
			}
			if(config.timeout){
				if(typeof config.timeout==='number'){
					options.timeout=Math.max(0,config.timeout/1000);
				}else{
					options.timeout=Math.max(0,parseFloat(String(config.timeout))||0)/1000;
				}
			}
			if(Object.keys(headers).length>0)options.headers=headers;
			let response=await new Promise<any>(resolve=>cordova.plugin.http.sendRequest(
				url,
				options,
				(response:any)=>resolve(response),
				(response:any)=>resolve(response)
			));
			let locationCaseSensitive='';
			for(let i in response.headers){
				if(i.toLowerCase()==='location')locationCaseSensitive=i;
			}
			if(response.status===-1&&locationCaseSensitive&&response.headers[locationCaseSensitive])response.status=302;
			switch(config.responseType){
				case 'document':
					try{
						if(response.data)response.data=new DOMParser().parseFromString(
							response.data,
							response.data.startsWith('<?xml')?'text/xml':'text/html'
						);
					}catch(error){
						console.log(error);
					}
					break;
				case 'stream':
					if(response.data)response.data=new ReadableStream(new(
						class implements UnderlyingDefaultSource{
							constructor(public text:string){}
							start(controller:ReadableStreamDefaultController<any>){
								controller.enqueue(this.text);
								controller.close();
							}
						}
					)(response.data));
					break;
			}
			response.config=config;
			try{
				response.statusText=getReasonPhrase(response.status);
			}catch(error){
				console.log(error);
			}
			let a:AxiosResponse;
			(Object.prototype.toString.call((config as any).settle)==='[object Function]'
				?(config as any).settle
				:settle
			)(resolve,reject,response);
		}catch(error){
			reject(error);
		}
	});
};