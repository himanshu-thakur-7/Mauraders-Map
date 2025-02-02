import {initializeApp, applicationDefault, cert, getApp } from 'firebase-admin/app';
import  { getFirestore, Timestamp, FieldValue, Filter } from 'firebase-admin/firestore';
const serviceAccount = require('../keys/service-account.json');
import {BOT_DATA} from "./types";
import { getAuth } from 'firebase-admin/auth';

export default class FirestoreClient{
    db: FirebaseFirestore.Firestore;
    auth:any;
    constructor(){
        try{
            getApp();
        }
        catch(error){
            initializeApp({
                credential: cert(serviceAccount)
            });
        }

        this.auth = getAuth();
        this.db = getFirestore();
    }

      async verifyToken(token: string) {
        return await this.auth.verifyIdToken(token);
    }
    async getDocuments(collection:string):Promise<Array<BOT_DATA>>{
        let data:Array<BOT_DATA> = [];
        const snapshot = await this.db.collection(collection).get();
        snapshot.forEach((doc)=>{
            data.push({id:doc.id,name:doc.data().name,image_url:doc.data().image_url,audio:doc.data().audio,description:doc.data().description,isBot:true})
        })
        return data;
    }

}
