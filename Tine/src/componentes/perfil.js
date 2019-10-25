import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import { Alert, Text, View, Modal, Image, ImageBackground, TouchableHighlight } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import styles from '../css/stylesPerfil';
import { Icon } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
const { server } = require('../config/keys');
import Toast from 'react-native-simple-toast';
import ActionButton, { renderIcon } from 'react-native-action-button';

export default class Profile extends Component {
  static navigationOptions = {
    title: 'Perfil',
    headerStyle: {
      backgroundColor: '#00748D',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      nombre: '',
      apellido: '',
      nacimiento: '',
      username: '',
      foto: '',
      celular: '',
      modalVisibleEdit: false,
      cargando: false
    };

    this.bajarDatos();
  }

  actualizarState = datos => {
    console.log('datos', datos);
    datos.forEach(element => {
      console.log(element);
      this.setState(element);
    });
  };

  actualizarState_empresa = datos => {
    console.log('datos', datos);
    datos.datos.forEach(element => {
      console.log(element);
      this.setState(element);
    });
  };

  bajarDatos = () => {
    const { navigation } = this.props;
    const session = JSON.parse(navigation.getParam('session'));
    console.log('session', session);

    if (session.tipo == 0) {
      fetch(server.api + 'userEmpresa', {
        method: 'POST',
        headers: {
          Aceptar: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: session.id }),
      })
        .then(res => {
          return res.json();
        })
        .then(data => this.actualizarState_empresa(data))

        .catch(function (err) {
          console.log('error', err);
        });
    } else {
      fetch(server.api + 'user', {
        method: 'POST',
        headers: {
          Aceptar: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session: session.id }),
      })
        .then(res => {
          console.log('res', res);
          return res.json();
        })
        .then(data => this.actualizarState(data))

        .catch(function (err) {
          console.log('error', err);
        });
    }
  };

  cerrarSession = async retorno => {
    if (retorno) {
      console.log('retorno', retorno);
      await AsyncStorage.clear();
      this.props.navigation.navigate('Inicio');
    } else {
      console.log('retorno', retorno);
    }
  };

  desactivar = () => {
    //console.log('desactivando');
    const { navigation } = this.props;
    const session = JSON.parse(navigation.getParam('session'));
    console.log(session);

    fetch(server.api + 'desactivar', {
      method: 'POST',
      headers: {
        Aceptar: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session: session.id }),
    })
      .then(res => {
        return res.json();
      })
      .then(data => this.cerrarSession(data.retorno))

      .catch(function (err) {
        console.log('error', err);
      });
  };

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
  };

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
  };

  cambiarFoto = () => {
    console.log('cambiando foto');
  };

  setModalVisible(visible) {
    this.setState({ modalVisibleEdit: visible });
  }

  agregarFotoSeguridad = () => {
    this.props.navigation.navigate('fotoSeguridad');
  }
  guardarDatos = () => {
    this.setState({ cargando: true });
    const {
      nombre,
      apellido,
      email,
      nombreUsuario,
      celular,
      documento,
    } = this.state;
    if (
      email == '' ||
      nombre == '' ||
      apellido == '' ||
      nombreUsuario == '' ||
      celular == '' ||
      documento == ''
    ) {
      Toast.show('Ingresa datos validos.');
      return;
    }

    let datos = {
      email: email,
      nombre: nombre,
      apellido: apellido,
      celular: celular,
      fullName: nombreUsuario,
      documento: documento,
    };

    fetch(server.api + 'update', {
      method: 'POST',
      headers: {
        Aceptar: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    })
      .then(res => {
        return res.json();
      })
      .then(data => {
        const retorno = data;
        console.log(retorno.retorno);
        if (retorno.retorno == true) {
          this.setModalVisible(false);
          this.setState({ cargando: false });
        } else {
          alert(retorno.mensaje);
        }
      })
      .catch(function (err) {
        Toast.show('Compruebe su conexión');
      });
  };

  render() {
    var imagen;
    console.log(this.state.fotoPerfil);
    if (this.state.fotoPerfil) {
      imagen = server.img + this.state.fotoPerfil;
    } else {
      imagen = server.img + 'user.jpg';
    }
    return (
      <>
        <ScrollView contentContainerStyle={{
          flex: 1
        }}>
          <ImageBackground
            resizeMode='cover'
            source={require('../imagenes/perfil.png')}
            style={{
              width: '100%',
              height: '100%',
              flex: 1
            }}>
            <View style={styles.container}>
              <Image style={styles.avatar} source={{ uri: imagen }} />

              <View style={styles.body}>
                <View style={styles.bodyContent}>
                  <Text style={styles.name}>
                    {this.state.nombre} {this.state.apellido}{' '}
                  </Text>
                  <View style={{
                    paddingVertical: 15,
                    paddingHorizontal: 10,
                    flexDirection: "row",
                    alignItems: "center"
                  }}>
                    {this.state.email ? <Icon
                      name='email'
                      type='material-community'
                      color="#00748D"
                    />:null}
                    <Text style={styles.info}> {this.state.email}      </Text>
                    {this.state.celular ? <Icon
                      name='phone'
                      type='material-community'
                      color="#00748D" /> : null}
                    <Text style={styles.info}> {this.state.celular} </Text>
                  </View>
                  <TouchableHighlight onPress={this.desactivarCuenta}>
                    <Button
                      style={styles.buttonContainer}
                      color="#00748D"
                      mode="contained"
                      onPress={this.desactivarCuenta}>
                      Desactivar cuenta
                </Button>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={() => { this.props.navigation.navigate('seguridadFoto'); }}>
                    <Button
                      style={styles.buttonContainer}
                      color="#00748D"
                      mode="contained"
                      onPress={() => { this.props.navigation.navigate('seguridadFoto'); }}>
                      Agreagar una foto de seguridad
                </Button>
                  </TouchableHighlight>
                  <TouchableHighlight onPress={this.confirmCerrarSession}>
                    <Button
                      style={styles.buttonContainer}
                      color="#00748D"
                      mode="contained"
                      onPress={this.confirmCerrarSession}>
                      Cerrar sesión
                </Button>
                  </TouchableHighlight>
                </View>
              </View>
            </View>
          </ImageBackground>
        </ScrollView>
        <ActionButton
          renderIcon={active => <Icon name="edit" color="white" />}
          buttonColor="#00748D"
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
            this.setModalVisible(false);
          }}>
          <ScrollView contentContainerStyle={{
            flex: 1
          }}>
            <ImageBackground
              resizeMode='cover'
              source={require('../imagenes/perfil.png')}
              style={{
                width: '100%',
                height: '100%',
                flex: 1
              }}>
              <View style={styles.container}>
                <Image style={styles.avatar} source={{ uri: imagen }} />
                <View style={styles.body_m}>
                  <View style={styles.bodyContent}>
                    <TextInput
                      label="Correo"
                      style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                      onChangeText={email => this.setState({ email })}
                      selectionColor="#00748D"
                      underlineColor="#00748D"
                      theme={{
                        colors: {
                          primary: '#00748D',
                          underlineColor: 'transparent'
                        }

                      }}
                      value={this.state.email}
                    />
                    <TextInput
                      label="Nombre"
                      style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                      onChangeText={nombre => this.setState({ nombre })}
                      selectionColor="#00748D"
                      underlineColor="#00748D"
                      theme={{
                        colors: {
                          primary: '#00748D',
                          underlineColor: 'transparent'
                        }

                      }}
                      value={this.state.nombre}
                    />
                    <TextInput
                      label="Apellido"
                      style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                      onChangeText={apellido => this.setState({ apellido })}
                      selectionColor="#00748D"
                      underlineColor="#00748D"
                      theme={{
                        colors: {
                          primary: '#00748D',
                          underlineColor: 'transparent'
                        }

                      }}
                      value={this.state.apellido}
                    />
                    <TextInput
                      label="Celular"
                      style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 10 }}
                      onChangeText={celular => this.setState({ celular })}
                      selectionColor="#00748D"
                      underlineColor="#00748D"
                      theme={{
                        colors: {
                          primary: '#00748D',
                          underlineColor: 'transparent'
                        }

                      }}
                      value={this.state.celular}
                    />
                    {this.state.cargando ?
                      <TouchableHighlight onPress={this.guardarDatos}>
                        <Button
                          loading={true}
                          disabled={true}
                          style={styles.buttonContainer}
                          color="#00748D"
                          mode="contained"
                          onPress={this.guardarDatos}>
                        </Button>
                      </TouchableHighlight>
                      :
                      <TouchableHighlight onPress={this.guardarDatos}>
                        <Button
                          style={styles.buttonContainer}
                          color="#00748D"
                          mode="contained"
                          onPress={this.guardarDatos}>
                          Terminar
                </Button></TouchableHighlight>}
                  </View>
                </View>
              </View>
            </ImageBackground>
          </ScrollView>
        </Modal>
      </>
    );
  }
}
