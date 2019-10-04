import React from 'react';
import { createSwitchNavigator,  createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack'
//vistas
require('moment/locale/es');
import Login from './src/componentes/login';
import Signup from './src/componentes/registrarse';
import Signup2 from './src/componentes/registrarse2';
import altaTarea from './src/componentes/Alta_tarea';
import Inicio from './src/componentes/Inicio';
import modoTablet from './src/componentes/modo_tablet';
import lista_empresas from './src/componentes/lista_empresas';
import lista_tareas from './src/componentes/lista_tareas';
import perfil from './src/componentes/perfil';
import modificar_tarea from './src/componentes/modificar_tarea';
import menu_listas from './src/componentes/Menu_listas';
import lista_asistencias from './src/componentes/lista_asistencias';
import asistencia_app from './src/componentes/asistencia_app';
import modalModificarPerfil from "./src/componentes/modificarPerfil";


const AppStack = createStackNavigator({ Inicio: Inicio });
const Tareas = createStackNavigator({lista_empresas: lista_empresas,asistencia_app: asistencia_app, lista_asistencias: lista_asistencias, altaTarea: altaTarea, lista_tareas: lista_tareas, perfil: perfil, modificar_tarea: modificar_tarea,menu_listas: menu_listas, modificarPerfil:modalModificarPerfil });
const empresa = createStackNavigator({ modoTablet: modoTablet, perfilEmpresa: perfil });
const AuthStack = createStackNavigator({ Login: Login, Signup: Signup,Signup2: Signup2  });

export default createAppContainer(createSwitchNavigator(
  {
    Home: AppStack,
    Tareas: Tareas,
    Auth: AuthStack,
    empresa: empresa
  }
));

