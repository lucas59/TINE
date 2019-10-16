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
  comprobar_ultima_asistencia_offline = async () => {
    let session = await AsyncStorage.getItem('usuario');
    let sesion = JSON.parse(session);
    let session_2 = await AsyncStorage.getItem('empresa');
    let empresa = JSON.parse(session_2);
    var empresa_id = empresa[0];
    return new Promise(function(resolve, reject) {
      setTimeout(() => {
        db.transaction(function(tx) {
          console.log('entra', sesion.id);
          console.log('entra', empresa_id);
          tx.executeSql(
            'SELECT * FROM asistencia WHERE id=(SELECT MAX(id) from asistencia) AND empleado_id = ? AND empresa_id = ? AND tipo = 1',
            [sesion.id, empresa_id],
            (tx, results) => {
              if (results.rows.length > 0) {
                resolve(1);
              } else {
                resolve(2);
              }
            },
          );
        });
      }, 1000);
    });
  };

  componentDidMount = async () => {
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

  subirfoto = async (camera, tipo) => {
    this.setState({cargando: true});
    Keyboard.dismiss();
    const options = {quality: 0.5, base64: true, captureAudio: false};
    if (camera != null) {
      const data = await camera.takePictureAsync(options);
      this.setState({foto: data.base64});
    } else {
      this.setState({foto: null});
    }
    const {foto} = this.state;
    let session = await AsyncStorage.getItem('usuario');
    let sesion = JSON.parse(session);
    let foto_send = {
      foto: foto,
      empleado: sesion.id,
    };
    console.log(server.api + 'fotoSeguridad');
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
          Toast.show('La asistencia se ingresó correctamente');
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
          <RNCamera
            style={styles.camara}
            type={RNCamera.Constants.Type.front}
            captureAudio={false}>
            {({camera, status}) => {
              if (status !== 'READY') return <PendingView />;
              return (
                <View
                  style={{position: 'relative', bottom: 20, left: 0, right: 0}}>
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
                      onPress={() => this.subirfoto(camera, 1)}>
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
