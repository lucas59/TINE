import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  Alert,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Button } from 'react-native-paper';
import styles from '../css/stylesPerfil';
import { Icon } from 'react-native-elements';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
const { server } = require('../config/keys');
import ActionButton, { renderIcon } from 'react-native-action-button';

export default class Profile extends Component {

  static navigationOptions = {
    title: 'TINE',
    headerStyle: {
      backgroundColor: '#008FAD',
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
      celular: '',
      modalVisibleEdit: false
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

  setModalVisible(visible) {
    this.setState({ modalVisibleEdit: visible });
  }

  guardarDatos = () => {
    console.log("guardando datos");
  }

  render() {
    var imagen;
    if (this.state.datos.fotoPerfil) {
      imagen = server.img + this.state.datos.fotoPerfil;
    } else {
      imagen = server.img + 'user.jpg';
    } return (
      <>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.header}></View>
            <Image style={styles.avatar} source={{ uri: imagen }} />


            <View style={styles.body}>
              <View style={styles.bodyContent}>
                <Text style={styles.name}>{this.state.datos.nombre} {this.state.datos.apellido} </Text>
                <Text style={styles.info}>{this.state.datos.email} </Text>
                <Text style={styles.info}>{this.state.datos.celular}   </Text>
                <Button style={styles.buttonContainer} color="#008FAD" mode="contained" onPress={this.desactivarCuenta}>
                  Desactivar cuenta
  </Button>
                <Button style={styles.buttonContainer} color="#008FAD" mode="contained" onPress={this.confirmCerrarSession}>
                  Cerrar sesión
  </Button>
              </View>
            </View>
          </View>

        </ScrollView>
        <ActionButton
          renderIcon={active => (
            <Icon name="edit" color='white' />
          )}
          buttonColor="#008FAD"
          //onPress={() => { this.props.navigation.navigate('modificarPerfil'); }}
          onPress={() => {
            this.setModalVisible(true);
          }}>
          >
        </ActionButton>

        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisibleEdit}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View>
            <ScrollView>
              <View style={styles.container}>
                <View style={styles.header}></View>
                <Image style={styles.avatar} source={{ uri: imagen }} />


                <View style={styles.body}>
                  <View style={styles.bodyContent}>
                    <TextInput style={styles.modificarTextInput}>{this.state.datos.nombre} {this.state.datos.apellido} </TextInput>
                    <TextInput style={styles.info}>{this.state.datos.email} </TextInput>
                    <TextInput style={styles.info}>{this.state.datos.celular}   </TextInput>

                    <TouchableOpacity onPress={() => this.setModalVisible(false)} style={styles.buttonContainer}>
                      <Text onPress={() => this.setModalVisible(false)}>Volver</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

            </ScrollView>
          </View>
        </Modal>

      </>
    );
  }
}