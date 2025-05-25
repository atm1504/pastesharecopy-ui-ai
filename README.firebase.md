# Firebase Configuration

To set up Firebase authentication with Google OAuth, follow these steps:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Google authentication in the Firebase console (Authentication > Sign-in method)
3. Register your app in Firebase and get your configuration
4. Create a `.env.local` file in the root of the project with the following variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

5. Replace the placeholder values with your actual Firebase configuration

## Firebase Cloud Functions

For backend functionality, you can use Firebase Cloud Functions:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase Functions: `firebase init functions`
4. Write your Cloud Functions in the `functions` directory
5. Deploy with: `firebase deploy --only functions`

## Firestore Database

For storing data, you can use Firestore:

1. Create a Firestore database in the Firebase console
2. Set up security rules for your database
3. Use the Firestore SDK to interact with your database:

```javascript
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Add a document
const addData = async (data) => {
  try {
    const docRef = await addDoc(collection(db, "collectionName"), data);
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};

// Get all documents from a collection
const getData = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "collectionName"));
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return documents;
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
};
```
