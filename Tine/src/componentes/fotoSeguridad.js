import React, {Component} from 'react';
import {
  View,
  Keyboard,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {RNCamera} from 'react-native-camera';
import moment from 'moment';
const {server} = require('../config/keys');
import NetInfo from '@react-native-community/netinfo';
import {Button} from 'react-native-paper';
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'sqlliteTesis.db', createFromLocation: 1});
import Toast from 'react-native-simple-toast';

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: '#00748D',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
    <Text>Cargando</Text>
  </View>
);
export default class seguridadFoto extends Component {
 
 
   
  componentDidMount = async () => {
    this.comprobar_conexion();
    const value = await AsyncStorage.getItem('configuraciones');
    if (value !== null) {
      this.setState({camara: JSON.parse(value).camara.data[0]});
    }
  };

  static navigationOptions = {
    header: null,
  };
  constructor(props) {
    super(props);
    this.state = {
      foto: '',
      codigo: '',
      inicio: '',
      empleado_id: '',
      empresa_id: '',
      cameraType: 'front',
      mirrorMode: false,
      camara: '',
      cargnado: false,
    };
  }

  subirImagen = async camera => {
    const {foto} = this.state;
    this.setState({cargando: true});
    Keyboard.dismiss();
    const options = {quality: 0.5, base64: true, captureAudio: false};
    if (camera != null) {
      const data = await camera.takePictureAsync(options);
      this.setState({foto: data.base64});
    } else {
      this.setState({foto: null});
    }

    
    let session = await AsyncStorage.getItem('usuario');
    let sesion = JSON.parse(session);
    
    let foto_send = {
      fecha: fecha,
      foto: foto,
      empleado_id: sesion.id
    };
    fetch(server.api + 'fotoSeguridad', {
      method: 'POST',
      headers: {
        Aceptar: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(foto_send),
    })
      .then(res => {
        return res.json();
      })
      .then(async data => {
        const retorno = data;
        if (retorno.retorno == true) {
          Toast.show('La foto se registro correctamente');
          this.setState({cargnado: false});
          this.props.navigation.navigate('perfil');
        } else {
          this.setState({cargnado: false});
          Toast.show(retorno.mensaje);
        }
      })
      .catch(function(err) {
        console.log('error', err);
      });
  };




  render() {
    return (
      <>
        <View style={styles.main}>
          {this.state.camara == 1  (
            <RNCamera
              style={styles.camara}
              type={RNCamera.Constants.Type.front}
              captureAudio={false}>
                if (status !== 'READY') return <PendingView />;
                return (
                  <View
                    style={{
                      position: 'relative',
                      bottom: 20,
                      left: 0,
                      right: 0,
                    }}>
                    {this.state.cargando ? (
                      <Button
                        disabled={true}
                        style={{width: 200, height: 45}}
                        color="#00748D"
                        loading={true}
                        mode="contained"></Button>
                    ) : (
                      <Button
                        style={{width: 200, height: 45}}
                        color="#00748D"
                        mode="contained"
                        onPress={() => {
                          this.subirImagen(camera);
                        }}>
                        <Text style={{fontSize: 14, color: 'white'}}>
                          {' '}
                          Capturar{' '}
                        </Text>
                      </Button>
                    )}
                  </View>
                );
              }}
            </RNCamera>
          )}
        </View>
      </>
    );
  }
}

const styles = StyleSheet.create({
  camara: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#00748D',
    borderRadius: 5,
    padding: 15,
    alignSelf: 'center',
    paddingHorizontal: 20,
    margin: 20,
  },
  main: {
    flex: 1,
  },
});
