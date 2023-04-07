import type{
	InternalAxiosRequestConfig,
	AxiosPromise,
	AxiosResponse
}from 'axios';
import settle from 'axios/lib/core/settle';
import buildURL from 'axios/lib/helpers/buildURL';
import buildFullPath from 'axios/lib/core/buildFullPath';

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
			let headers=Object.assign(config.auth?cordova.plugin.http.getBasicAuthHeader(config.auth.username,config.auth.password):{},config.headers);
			if(config.data instanceof URLSearchParams){
				serializer='utf8';
				headers['content-type']='application/x-www-form-urlencoded';
				data=config.data.toString();
			}else if(config.data instanceof Uint8Array||config.data instanceof ArrayBuffer){
				serializer='raw';
				data=config.data;
			}else if(config.data instanceof FormData){
				serializer='multipart';
				data=config.data;
			}else if(config.data){
				if(typeof config.data==='object'){
					serializer='json';
					data=config.data;
				}else{
					serializer='utf8';
					data=config.data.toString();
				}
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
				followRedirect:config.maxRedirects>0
			};
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
			switch(config.responseType){
				case 'document':
					try{
						response.data=new DOMParser().parseFromString(response.data,response.data.startsWith('<?xml')?'text/xml':'text/html');
					}catch(error){
						console.log(error);
					}
					break;
				case 'stream':
					response.data=new ReadableStream(new(class implements UnderlyingDefaultSource{
						constructor(public text:string){}
						start(controller:ReadableStreamDefaultController<any>){
							controller.enqueue(this.text);
							controller.close();
						};
					})(response.data));
					break;
			}
			(Object.prototype.toString.call((config as any).settle)==='[object Function]'
				?(config as any).settle
				:settle
			)(resolve,reject,response);
		}catch(error){
			reject(error);
		}
	});
};