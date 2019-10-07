import React, {Component} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Keyboard,
  View,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const {server} = require('../config/keys');
import NetInfo from '@react-native-community/netinfo';
import {ListItem, Icon} from 'react-native-elements';
const manejador = require('./manejadorSqlite');
import {openDatabase} from 'react-native-sqlite-storage';
var db = openDatabase({name: 'sqlliteTesis.db', createFromLocation: 1});
import MqttService from '../core/services/MqttService';
import OfflineNotification from '../componentes/OfflineNotification';
import OnlineNotification from '../componentes/OnlineNotification';

var PushNotification = require('react-native-push-notification');

import {PulseIndicator} from 'react-native-indicators';
export default class lista_empresas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      session: AsyncStorage.getItem('usuario'),
      titulo: '',
      estado: '',
      inicio: '',
      fin: '',
      listaT: '',
      cargando: true,
      isConnected: false,
      mensaje: '',
      nombre_empresa: '',
    };
  }

  componentDidMount() {
    NetInfo.isConnected.fetch().done(async isConnected => {
      console.log('isConnected: ', isConnected);
      if (isConnected == true) {
        let session = await AsyncStorage.getItem('usuario');
        console.log(session);
        let sesion = JSON.parse(session);
        manejador.listarempresas(sesion.id);
        this.Listar();
        console.log('online');
      } else {
        this.promesa().then(lista_SC => {
          console.log('lista tareas: ', lista_SC);
          this.setState({listaT: lista_SC});
          this.setState({cargando: false});
        });
        console.log('offline');
      }
        MqttService.connectClient(
      this.mqttSuccessHandler,
      this.mqttConnectionLostHandler,
    );
    });
  
  }

  onWORLD = mensaje => {
    PushNotification.localNotification({
      title: 'Mensaje de la empresa',
      message: mensaje,
      playSound: true,
      soundName: 'default',
      importance: 'high',
    });
  };

  mqttSuccessHandler = () => {
    let {session} = this.state; // await AsyncStorage.getItem('usuario');
    let sesion = JSON.parse(session);

    this.setState({
      isConnected: true,
    });
     MqttService.subscribe('WORLD', this.onWORLD);
    // MqttService.subscribe('tip' + sesion.id, this.onWORLD);
  };

  mqttConnectionLostHandler = () => {
    console.info('NOOO connected to mqtt');
    this.setState({
      isConnected: false,
    });
  };

  promesa = async () => {
    return new Promise(function(resolve, reject) {
      console.log('empresa');
      setTimeout(() => {
        db.transaction(async function(txn) {
          txn.executeSql('SELECT * FROM empresa', [], (tx, res) => {
            console.log(res);
            resolve(res.rows.raw());
          });
        });
      }, 1000);
    });
  };

  static navigationOptions = ({navigation}) => {
    return {
      title: 'Lista de empresas',
      headerStyle: {
        backgroundColor: '#008FAD',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: (
        <Icon
          reverse
          name="face"
          type="material"
          color="#008FAD"
          onPress={async () =>
            navigation.navigate('perfil', {
              session: await AsyncStorage.getItem('usuario'),
            })
          }
        />
      ),
    };
  };

  redireccionar_perfil() {
    this.props.navigation.navigate('perfil');
  }

  Listar = async () => {
    Keyboard.dismiss();
    let session = await AsyncStorage.getItem('usuario');
    let sesion = JSON.parse(session);
    let tarea_send = {
      id: sesion.id,
    };
    await fetch(server.api + '/Tareas/ListaEmpresas', {
      method: 'POST',
      headers: {
        Aceptar: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tarea_send),
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        const retorno = data;
        if (retorno.retorno == true) {
          console.log(retorno.mensaje);
          this.setState({listaT: retorno.mensaje});
        } else {
          alert(retorno.mensaje);
        }
        this.setState({cargando: false});
      })
      .catch(function(err) {
        console.log('error', err);
      });
  };

  redireccionar_alta = async (id, nombre, foto) => {
    var myArray = [id, nombre, foto];
    AsyncStorage.setItem('empresa', JSON.stringify(myArray));
    this.setState({nombre_empresa: nombre});
    console.log(myArray);
    this.props.navigation.navigate('menu_listas');
  };

  parseData() {
    if (this.state.listaT) {
      return this.state.listaT.map((data, i) => {
        console.log(data.fotoPerfil);
        return (
          <ListItem
            key={i}
            leftAvatar={{source: {uri: server.img + data.fotoPerfil}}}
            title={data.nombre}
            onPress={() =>
              this.redireccionar_alta(data.id, data.nombre, data.fotoPerfil)
            }
          />
        );
      });
    } else {
      return (
        <View>
          {this.state.cargando ? (
            <PulseIndicator color="#008FAD" size={60} style={{marginTop: 30}} />
          ) : (
            <Text style={{textAlign: 'center'}}> No existen empresas </Text>
          )}
        </View>
      );
    }
  }
  render() {
    const {isConnected} = this.state;
    return (
      <>
        {!isConnected && <OfflineNotification />}
        {isConnected && <OnlineNotification />}

        <ScrollView>{this.parseData()}</ScrollView>
      </>
    );
  }
}
