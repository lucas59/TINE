import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Alert,
  Text,
  View,
  Image,
  TouchableOpacity
} from 'react-native';
import styles from '../css/stylesPerfil';
import { Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
const { server } = require('../config/keys');


export default class Profile extends Component {

  static navigationOptions = {
    title: 'TINE',
    headerStyle: {
        backgroundColor: '#1E8AF1',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
        fontWeight: 'bold',
    },
   

};
  constructor(props) {
    super(props);
    this.state = {
      datos: '',
      email: '',
      nombre: '',
      apellido: '',
      nacimiento: '',
      username: '',
      foto: '',
      celular: ''
    }

    this.bajarDatos();

  }

  actualizarState = (datos) => {
    datos.datos.forEach(element => {
      console.log(element);
      this.setState({ datos: element });
    });
  }

  bajarDatos = () => {
    const { navigation } = this.props;
    const session = JSON.parse(navigation.getParam('session'));
    console.log('session', session);
    
    if (session.tipo == 0) {
      fetch(server.api + 'userEmpresa', {
        method: 'POST',
        headers: {
          'Aceptar': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: session.id })
      })

        .then(res => {
          return res.json()
        })
        .then(data => this.actualizarState(data))

        .catch(function (err) {
          console.log('error', err);
        })

    } else {
      fetch(server.api + 'user', {
        method: 'POST',
        headers: {
          'Aceptar': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: session.id })
      })

        .then(res => {
          return res.json()
        })
        .then(data => this.actualizarState(data))

        .catch(function (err) {
          console.log('error', err);
        })
    }
  }

  cerrarSession = async (retorno) => {
    if (retorno) {
      console.log('retorno', retorno);
      await AsyncStorage.clear();
      this.props.navigation.navigate('Inicio');
    } else {
      console.log('retorno', retorno);

    }
  }

  desactivar = () => {
    //console.log('desactivando');
    const { navigation } = this.props;
    const session = JSON.parse(navigation.getParam('session'));
    console.log(session);

    fetch(server.api + 'desactivar', {
      method: 'POST',
      headers: {
        'Aceptar': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ session: session.id })
    })
      .then(res => {
        return res.json()
      })
      .then(data => this.cerrarSession(data.retorno))

      .catch(function (err) {
        console.log('error', err);
      })
  }

  desactivarCuenta = () => {
    Alert.alert(
      'Desactivar cuenta',
      '¿Esta seguro que desea desactivar su cuenta temporalmente?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Preoceso cancelado'),
          style: 'cancel',
        },
        { text: 'Si', onPress: () => this.desactivar() },
      ],
      { cancelable: false },
    );
  }

  confirmCerrarSession = () => {

    Alert.alert(
      'Cerrar sesion',
      '¿Esta seguro que desea cerrar sesion?',
      [
        {
          text: 'Cancelar',
          onPress: () => console.log('Preoceso cancelado'),
          style: 'cancel',
        },
        { text: 'Si', onPress: () => this.cerrarSession(true) },
      ],
      { cancelable: false },
    );
  }

  cambiarFoto = () => {
    console.log('cambiando foto');
  }

  render() {
    var imagen;
    if (this.state.datos.fotoPerfil) {
      imagen = server.img + this.state.datos.fotoPerfil;
    } else {
      imagen = server.img + 'user.jpg';
    } return (
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.header}></View>
          <Image style={styles.avatar} source={{ uri: imagen }} />

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
              width: 70,
              position: 'absolute',
              bottom: 10,
              right: 10,
              height: 70,
              backgroundColor: '#fff',
              borderRadius: 100,
            }}
          >
            <Icon name="edit" size={30} color="#01a699" />
          </TouchableOpacity>

          <View style={styles.body}>
            <View style={styles.bodyContent}>
              <Text style={styles.name}>{this.state.datos.nombre} {this.state.datos.apellido} </Text>
              <Text style={styles.info}>{this.state.datos.email} </Text>
              <Text style={styles.info}>{this.state.datos.celular}   </Text>

              <TouchableOpacity onPress={this.desactivarCuenta} style={styles.buttonContainer}>
                <Text onPress={this.desactivarCuenta}>Desactivar cuenta</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.confirmCerrarSession} style={styles.buttonContainer}>
                <Text onPress={this.confirmCerrarSession} >Cerrar sesion</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

      </ScrollView>
    );
  }
}