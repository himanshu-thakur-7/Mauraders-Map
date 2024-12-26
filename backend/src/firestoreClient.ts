import {initializeApp, applicationDefault, cert, getApp } from 'firebase-admin/app';
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';
const serviceAccount = require('../keys/service-account.json');
import {BOT_DATA} from "./types";


export default class FirestoreClient{
    db: FirebaseFirestore.Firestore;
    constructor(){
        try{
            getApp();
        }
        catch(error){
            
            initializeApp({
                credential: cert(serviceAccount)
            });
        }
        this.db = getFirestore();
    }

    async getDocuments(collection:string):Promise<Array<BOT_DATA>>{
        let data:Array<BOT_DATA> = [];
        const snapshot = await this.db.collection(collection).get();
        snapshot.forEach((doc)=>{
            data.push({id:doc.id,name:doc.data().name,image_url:doc.data().image_url,audio:doc.data().audio,description:doc.data().description})
        })
        return data;
    }

}
