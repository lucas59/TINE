import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, Keyboard, View, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import NetInfo from '@react-native-community/netinfo';
import { ListItem, Icon, Image } from 'react-native-elements';
const manejador = require('./manejadorSqlite');
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
import MqttService from '../core/services/MqttService';
import OfflineNotification from '../componentes/OfflineNotification';
import OnlineNotification from '../componentes/OnlineNotification';
import PTRView from 'react-native-pull-to-refresh';

var PushNotification = require("react-native-push-notification");
_isMounted = false;
import { PulseIndicator } from 'react-native-indicators';
export default class lista_empresas extends Component {
  constructor(props) {
    super(props);
    this.state = {
      titulo: '',
      estado: '',
      inicio: '',
      fin: '',
      listaT: '',
      cargando: true,
      isConnected: false,
      mensaje: '',
      nombre_empresa: ''
    };
  }

  listar_empresa()  {
    console.log("rfd");
    NetInfo.isConnected.fetch().done(async isConnected => {
      if (isConnected == true) {
        let session = await AsyncStorage.getItem('usuario');
        console.log(session);
        let sesion = JSON.parse(session);
        manejador.listarempresas(sesion.id);
        this.Listar();
        console.log('online');  
        MqttService.connectClient(this.mqttSuccessHandler, this.mqttConnectionLostHandler);
      } else {
        this.promesa().then(lista_SC => {
          console.log('lista tareas: ', lista_SC);
          this.setState({ listaT: lista_SC });
          this.setState({ cargando: false });
        });
        console.log('offline');
      }
    });
   
  }
  componentDidMount() {
    this._isMounted = true;
    this.listar_empresa();
    
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  onWORLD = mensaje => {
    PushNotification.localNotification({
      title: "Mensaje de la empresa",
      message: mensaje,
      playSound: true,
      soundName: 'default',
      importance: "high",
    });
  };

  mqttSuccessHandler = async () => {

    let session = await AsyncStorage.getItem('usuario');
    console.log(session);
    let sesion = JSON.parse(session);
    console.log("documento", sesion.id);

    console.info('connected to mqtt');
    //  MqttService.subscribe('WORLD', this.onWORLD);
    MqttService.subscribe("tip" + sesion.id, this.onWORLD);

    //MqttService.subscribe(sesion.id, this.onWORLD);

    this.setState({
      isConnected: true,
    });
  };

  mqttConnectionLostHandler = () => {
    console.info('NOOO connected to mqtt');
    this.setState({
      isConnected: false,
    });
  };

  promesa = async () => {
    return new Promise(function (resolve, reject) {
      console.log('empresa');
      setTimeout(() => {
        db.transaction(async function (txn) {
          txn.executeSql('SELECT * FROM empresa', [], (tx, res) => {
            console.log(res);
            resolve(res.rows.raw());
          });
        });
      }, 1000);
    });
  };

  static navigationOptions = ({ navigation }) => {
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
    console.log("wfd");
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
          this.setState({ listaT: retorno.mensaje });
        }
        else {
          this.setState({ listaT: null });
        }
        console.log(retorno);
        this.setState({ cargando: false });
      })
      .catch(function (err) {
        console.log('error', err);
      });
  };

  redireccionar_alta = async (id, nombre, foto) => {
    var myArray = [id, nombre, foto];
    AsyncStorage.setItem('empresa', JSON.stringify(myArray));
    this.setState({ nombre_empresa: nombre });
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
            leftAvatar={{ source: { uri: server.img + data.fotoPerfil } }}
            title={data.nombre}
            onPress={() => this.redireccionar_alta(data.id, data.nombre, data.fotoPerfil)}
          />
        );
      });
    } else {
      return (
        <View>
          {
            this.state.cargando ? <PulseIndicator color='#008FAD' size={60} style={{ marginTop: 30 }} /> :
              <View style={{
                top: 15,
                left: 0,
                right: 0,
                bottom: 0,
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 600
              }}>
                <Image
                  source={require('../imagenes/empresa.png')}
                  style={{ width: 300, height: 250 }}
                />
                <Text style={{ fontSize: 19 }}>La lista de empresas esta vacia</Text>
              </View>
          }
        </View>
      );
    }
  }
  someMethod() {
    // Force a render with a simulated state change
    this.setState({ state: this.state });
}
  render() {
    const { isConnected } = this.state;
    return (
     <>
        {!isConnected && <OfflineNotification />}
        { isConnected && <OnlineNotification /> }
        
        <PTRView onRefresh={() => this.listar_empresa()} >
        <ScrollView>{this.parseData()}</ScrollView>
        </PTRView>
        </>
    );
  }
}
