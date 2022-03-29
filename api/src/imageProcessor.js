const path=require('path')
const {Worker, isMainThread}=require('worker_threads')

const pathToResizeWorker= path.resolve(__dirname,'resizeWorker.js')
const pathToMonochromeWorker=path.resolve(__dirname,'monochromeWorker.js')
const uploadPathResolver= (filename)=>path.resolve(__dirname,'../uploads',filename)

const imageProcessor=(filename)=>{
    let resizeWorkerFinished=false
    let monochromeWorkerFinished =false
    
    return new Promise((resolve,reject)=>{
        const sourcePath=uploadPathResolver(filename)
        const resizedDestination=uploadPathResolver('resized-'+filename)
        const monochromeDestination= uploadPathResolver('monochrome-'+filename)

        if(isMainThread){
            try{
                const resizeWorker= new Worker(pathToResizeWorker,{
                    workerData:{
                        source:sourcePath,
                        destination:resizedDestination
                    }
                })
                const monochromeWorker= new Worker(pathToMonochromeWorker,{
                    workerData:{
                        source:sourcePath,
                        destination:monochromeDestination
                    }
                })
                resizeWorker.on('message',()=>{
                    resizeWorkerFinished=true
                    if(monochromeWorkerFinished == true){
                    resolve('resizeWorker finished processing')
                    }
                })
                resizeWorker.on('error',(error)=>{
                    reject(new Error(error.message))
                })

                monochromeWorker.on('message',()=>{
                    if(resizeWorkerFinished==true){
                    monochromeWorkerFinished=true
                    resolve('monochromeWorker finished processing')
                    }
                })
                monochromeWorker.on('error',(error)=>{
                    reject(new Error(error.message))
                })
            }
            catch(error){
                reject(error)
            }
        }
        else{
            reject(new Error('not on main thread'))
        }
    })
}

module.exports=imageProcessor