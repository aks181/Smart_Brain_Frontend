import React, {Component} from 'react';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo.js';
import Signin from './components/Signin/Signin.js';
import Register from './components/Register/Register.js';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm.js';
import Rank from './components/Rank/Rank.js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition.js';
import './App.css';

const app = new Clarifai.App({
 apiKey: '698944d0c66a469ca12d175393c4f019'
});

const particlesOptions = {
  particles: {
    number: {
      value:100,
      density: {
        enable: true,
        value_area:700
      }     
    }
  }
}
const initialState={
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}
class App extends Component {
  constructor() {
    super();
    this.state= initialState;
  }
  

  /*componentDidMount() {
    fetch('http://localhost:3001/')
      .then(response => response.json())
      .then(console.log)
  }*/

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }


  calculateFaceLocation=(data) => {
    const clarifaiFace= data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row * height)        
    }
  }

  displayFacebox = (box) => {
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value });
  }

  onPictureSubmit = () => {
    this.setState({imageUrl: this.state.input})
    app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
      .then(response => {
        if(response){
          fetch('http://localhost:3001/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id,
              
            })
          })
          .then(response => response.json())
          .then(count  => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
        }
        this.displayFacebox(this.calculateFaceLocation(response))
      })
      .catch(err =>console.log(err))
  }

  onRouteChange = (routeInput) => {
    if(routeInput === 'signout'){
      this.setState(initialState)
    } 
    else if(routeInput === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: routeInput})
  }

  render() {
    const {isSignedIn, imageUrl, route, box } = this.state
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn= {isSignedIn} onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank name={this.state.user.name} entries= {this.state.user.entries} />
              <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onPictureSubmit={this.onPictureSubmit}
              />
              <FaceRecognition imageUrl={imageUrl} box={box}/>
            </div>        
          : (
              route === 'signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} /> 
              : (
                  route === 'signout'
                  ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                  : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
                ) 
            )
        } 
      </div>
    );    
  }
}

export default App;
