import admin from 'firebase-admin';
let serviceAccount = require('../secrets/juicemessenger-5d2fa-firebase-adminsdk-tk782-3bb7f54f2e.json');

export class Internet {

  public static firebaseApp: admin.app.App;
  public static isInit: boolean = false;
  public static auth: admin.auth.Auth;
  public static database: admin.firestore.Firestore;

  public static initFirebase() {
    if (!this.isInit) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://juicemessenger-5d2fa.firebaseio.com"
      });
      admin.database(admin.app());
      this.firebaseApp = admin.initializeApp();
      this.auth = admin.auth();
      this.database = admin.firestore();
      this.isInit = true;
    }
  }

  public static authUser() {

  }

  public static getRecentConversationIDs(): Promise<admin.firestore.DocumentReference[]> {
    this.initFirebase();
    return new Promise<any>((res, rej) => { });
    // return this.database.collection("recentConversation")
  }

}