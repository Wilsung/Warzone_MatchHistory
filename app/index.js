import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import Navigation from './components/Navigation'
import 'tachyons'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import Particles from 'react-particles-js';
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

const particleOptions = {
    particles: {
        number: {
            value: 100,
            density: {
                enable: true,
                value_area: 500
            }
        }
    }
}

const initialState = {
    input: '',
    imageUrl: '',
    skip: 'false',
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

class App extends React.Component{
    constructor(){
        super();
        this.state = initialState;
    }

    loadUser = (data) => {
        this.setState({
            user: {
                id: data.id,
                name: data.name,
                email: data.email,
                entries: data.entries,
                joined: data.joined
            }
        })
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value})
    }

    calculateFaceLocation = (data) => {
        const face_location = data.outputs[0].data.regions[0].region_info.bounding_box
        const image = document.getElementById('inputimage');
        const width = Number(image.width);
        const height = Number(image.height);
        return {
            leftCol: face_location.left_col * width,
            topRow: face_location.top_row * height,
            rightCol: width - (face_location.right_col * width),
            bottomRow: height - (face_location.bottom_row * height)
        }
    }

    displayFaceBox = (box) => {
        this.setState ({box})
    }

    onSubmit = () => {
        this.setState({
            imageUrl: this.state.input
        })
        fetch('https://immense-garden-32810.herokuapp.com/imageurl', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: this.state.input
            })
            })
            .then(response => response.json())
            .then(response => {
                if (response) {
                    fetch('https://immense-garden-32810.herokuapp.com/image', {
                        method: 'put',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            id: this.state.user.id
                        })
                    })
                    .then(response => response.json())
                    .then(count => {
                        this.setState(Object.assign(this.state.user, {entries: count}))
                    })
                    .catch(err => console.log)
                }
                this.displayFaceBox(this.calculateFaceLocation(response))
            })
            
            .catch(err => console.log(err));
    }

    onRouteChange = (route) => {
        if (route === 'signout'){
            this.setState(initialState)
        }else if (route === 'home'){
            this.setState({
                isSignedIn: true,
                skip: false,
                imageUrl: ''
            })
        }else if (route === 'skip'){
            this.setState({
                skip: true,
                imageUrl: ''
            })
        }
        this.setState({route})
    }

    render(){
        const { isSignedIn, imageUrl, box, route, user, skip } = this.state;
        return(
            <div>
                <Particles 
                    className='particles'
                    params={particleOptions} 
                />
                <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn} skip={skip}/>
                {route === 'home' || route==='skip' ? 
                    <div>
                        <Logo />
                        {!skip ? 
                            <Rank name={user.name} entries={user.entries} />
                            : <div className="tc i">Create an account to save your Rank.</div>}
                        <ImageLinkForm 
                            onInputChange={this.onInputChange} 
                            onSubmit={this.onSubmit}
                        />
                    </div>
                    : (
                        route === 'signin' || route === 'signout' ?
                            <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
                            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>   
                    )
                }
                
                {imageUrl && <FaceRecognition box={box} imageUrl={imageUrl}/>}
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
)