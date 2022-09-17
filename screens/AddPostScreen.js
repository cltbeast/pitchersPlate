import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';

import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

import {
  InputField,
  InputWrapper,
  AddImage,
  SubmitBtn,
  SubmitBtnText,
  StatusWrapper,
} from '../styles/AddPost';

import { AuthContext } from '../navigation/AuthProvider';

const AddPostScreen = () => {
  const {user, logout} = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(null);
  const [session, setSession] = useState(null);
  const [strikes, setStrike] = useState(0);
  const [balls, setBall] = useState(0);
  const [pitch, setPitch] = useState(0);
  
  
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };

  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then((image) => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      setImage(imageUri);
    });
  };
  

  const submitSession = async () => {
    firestore()
    .collection('sessions')
    .add({
      userId: user.uid,
      session: post,
      sessionTime: firestore.Timestamp.fromDate(new Date()),
      pitches: 0,
      strikes: 0,
      balls:0,
    })
    .then(() => {
      console.log('Your session has been posted');
      Alert.alert(
        'Session published',
        'Your session has been published Successfully!',
      );
      setSession(null);
    })
    .catch((error) => {
      console.log('Something went wrong with added post to firestore.', error);
    });
    firestore()
    .collection('sessions')
    .add({
      userId: user.uid,
      session: session,
      sessionTime: firestore.Timestamp.fromDate(new Date()),
      pitches:0,
      strikes:0,
      balls: 0,
    })
    .then(() => {
      console.log('Post Added!');
      Alert.alert(
        'Session published!',
        'Your session has been published Successfully!',
      );
      setSession(null);
    })
    .catch((error) => {
      console.log('Something went wrong with added post to firestore.', error);
    });
  }
  
  const throwStrike = async () => {
    const increment = firestore.FieldValue.increment(1);
    firestore().collection('sessions').doc("yawXUcut0mSEWNIQ6dp2").update({
      "strikes": increment,
      "pitches": increment,
    })
    .then(() => {
      setStrike(strikes + 1);
      setPitch(pitch + 1);
      console.log('You have thrown a strike');
      Alert.alert("You have thrown a strike");
      setSession(null);
    })
    .catch((error) => {
      console.log('Something went wrong with added post to firestore.', error);
    });
  }
  
  const throwBall = async () => {
    const increment = firestore.FieldValue.increment(1);
    firestore().collection('sessions').doc("yawXUcut0mSEWNIQ6dp2").update({
      "balls":increment,
      "pitches":increment,
    })
    .then(() => {
      setBall(balls + 1);
      setPitch(pitch+1);
      console.log('You have thrown a ball');
      Alert.alert("A ball has been thrown");
      setSession(null);
    })
    .catch((error) => {
      console.log('Something went wrong with added post to firestore.', error);
    });
  }
  

  

  const uploadImage = async () => {
    if( image == null ) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop(); 
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', (taskSnapshot) => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);
      return url;

    } catch (e) {
      console.log(e);
      return null;
    }

  };

  return (
    <View style={styles.container}>
        <Text>Pitches: {pitch}</Text>
        <Text>Strikes: {strikes}</Text>
        <Text>Balls: {balls}</Text>

      <InputWrapper>
        {image != null ? <AddImage source={{uri: image}} /> : null}

        <InputField
          placeholder="Current Session: "
          multiline
          numberOfLines={4}
          value={post}
          onChangeText={(content) => setPost(content)}
        />
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completed!</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <SubmitBtn onPress={submitSession}>
            <SubmitBtnText>Throw Pitch</SubmitBtnText>
          </SubmitBtn>
        )}
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completed!</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <SubmitBtn onPress={throwStrike}>
            <SubmitBtnText>Throw Strike</SubmitBtnText>
          </SubmitBtn>
        )}
        
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completed!</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <SubmitBtn onPress={throwBall}>
            <SubmitBtnText>Throw Ball</SubmitBtnText>
          </SubmitBtn>
        )}
       

      </InputWrapper>
      <View>
        <View style = {styles.strikeZone}></View>
        <View style = {[styles.strike, {backgroundColor:'red'}]}></View>
        <View style = {[styles.ball, {backgroundColor:'blue'}]}></View>
      </View>
      <ActionButton buttonColor="#2e64e5">
        <ActionButton.Item
          buttonColor="#9b59b6"
          title="Take Photo"
          onPress={takePhotoFromCamera}>
          <Icon name="camera-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#3498db"
          title="Choose Photo"
          onPress={choosePhotoFromLibrary}>
          <Icon name="md-images-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
      
    </View>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  strikeZone:{
    width: 150,
    height: 200,
    marginTop:50,
    position: 'relative',
    top: 0,
    left: 0,
    backgroundColor: 'grey',
  },
  strike:{
    height: 10,
    width: 10,
    borderRadius: 50,
    position: 'absolute',
    top: 150,
    right: 10,
    elevation: 10,
   // backgroundColor: 'red',
  },
  ball:{
    height: 10,
    width: 10,
    borderRadius: 50,
    position: 'absolute',
    top: 150,
    left: 0,
    elevation: 10,
    //backgroundColor: 'blue',
  },
});